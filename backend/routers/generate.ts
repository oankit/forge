import { generateText } from 'ai';
import { createVercel } from '@ai-sdk/vercel';
import * as express from 'express';
import { createJwtMiddleware } from '../../utils/backend/jwt_middleware';
import type { Request, Response } from 'express';

interface GenerateRequest {
  imageDataURL: string;
  prompt?: string;
}

interface GenerateResponse {
  code?: string;
  success: boolean;
  error?: string;
  userId?: string;
}

interface AuthenticatedRequest extends Request {
  canva: {
    appId: string;
    userId: string;
    brandId: string;
  };
}

// Initialize Vercel AI provider
const vercel = createVercel({
  apiKey: process.env.V0_API_KEY,
});

/**
 * Creates an Express router for the generate API
 */
export const createGenerateRouter = () => {
  console.log('[GENERATE] Creating generate router...');
  const router = express.Router();
  const jwtMiddleware = createJwtMiddleware(process.env.CANVA_APP_ID || 'default-app-id');


/**
 * Generate React component code from an image using v0-1.0-md model
 */
async function generateCodeFromImageDataURL(
  imageDataURL: string,
  userPrompt?: string
): Promise<string> {
  const defaultPrompt = `Analyze this design image and create a production-ready Next.js 15 page component that precisely recreates the visual design.

Requirements:
- Use Next.js 15 App Router with TypeScript
- Implement with shadcn/ui components where appropriate
- Apply Tailwind CSS for styling with mobile-first responsive design
- Use lucide-react icons only
- Include proper accessibility (semantic HTML, ARIA labels, alt text)
- Match colors, typography, spacing, and layout as closely as possible
- Use Server Components by default, Client Components ('use client') only when interactivity is needed

Focus on visual accuracy while leveraging modern React patterns and Vercel deployment best practices.
CRITICAL: You must only output code. Do not include any explanatory text, feature lists, summaries, or descriptions before or after the code. Start directly with the code and end with the closing bracket.`;

  const prompt = userPrompt ? `${userPrompt}\n\n${defaultPrompt}` : defaultPrompt;

  try {
    const result = await generateText({
      model: vercel('v0-1.0-md'),
      system: 'You are v0, an expert AI assistant specializing in creating production-ready Next.js 15 applications. You have deep expertise in TypeScript, Tailwind CSS, shadcn/ui components, lucide-react icons, and Vercel deployment. You create components that are immediately deployable and follow modern React Server Component patterns. CRITICAL: You must only output code. Do not include any explanatory text, feature lists, summaries, or descriptions before or after the code. Start directly with the code and end with the closing bracket.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image',
              image: imageDataURL,
            },
          ],
        },
      ],
      maxTokens: 6000, // Increased for more complex components
      temperature: 0.1, // Lower temperature for more consistent code generation
    });

    // Filter out thinking tags from the response
    const cleanedCode = filterThinkingTags(result.text);
    return cleanedCode;
  } catch (error) {
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Remove <Thinking> tags and markdown code blocks from the generated code
 */
function filterThinkingTags(text: string): string {
  // Remove <Thinking>...</Thinking> blocks (case insensitive, multiline)
  const thinkingRegex = /<thinking[^>]*>[\s\S]*?<\/thinking>/gi;
  let cleaned = text.replace(thinkingRegex, '');
  
  // Also handle unclosed thinking tags at the beginning
  const openThinkingRegex = /^[\s\S]*?<\/thinking>/gi;
  cleaned = cleaned.replace(openThinkingRegex, '');
  
  // Remove any remaining opening thinking tags
  const remainingOpenRegex = /<thinking[^>]*>/gi;
  cleaned = cleaned.replace(remainingOpenRegex, '');
  
  // Remove markdown code block syntax
  // Remove opening code blocks like ```tsx, ```typescript, ```react, etc.
  const openCodeBlockRegex = /^\s*```[a-zA-Z]*\s*$/gm;
  cleaned = cleaned.replace(openCodeBlockRegex, '');
  
  // Remove closing code blocks
  const closeCodeBlockRegex = /^\s*```\s*$/gm;
  cleaned = cleaned.replace(closeCodeBlockRegex, '');
  
  // Remove any remaining standalone backticks at start/end of lines
  const standaloneBackticksRegex = /^\s*`{3,}.*$/gm;
  cleaned = cleaned.replace(standaloneBackticksRegex, '');
  
  // Trim whitespace and ensure clean output
  return cleaned.trim();
}

/**
 * Validate image data URL format and size
 */
function validateImageDataURL(imageDataURL: string): { isValid: boolean; error?: string } {
  // Check if it's a valid data URL format
  if (!imageDataURL.startsWith('data:image/')) {
    return { isValid: false, error: 'Invalid image format. Must be a data URL starting with "data:image/"' };
  }

  // Check if it contains base64 data
  if (!imageDataURL.includes('base64,')) {
    return { isValid: false, error: 'Invalid image format. Must be base64 encoded' };
  }

  // Estimate size (base64 is ~33% larger than binary)
  const base64Data = imageDataURL.split('base64,')[1];
  const estimatedSize = (base64Data.length * 3) / 4;
  const maxSize = 10 * 1024 * 1024; // 10MB limit

  if (estimatedSize > maxSize) {
    return { isValid: false, error: `Image too large. Maximum size is ${maxSize / (1024 * 1024)}MB` };
  }

  return { isValid: true };
}

  // POST /api/generate - Generate code from image
  router.post('/', jwtMiddleware, async (req: AuthenticatedRequest, res: Response<GenerateResponse>) => {
    console.log('[GENERATE] Received code generation request from user:', req.canva?.userId);
    try {
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body. Expected JSON object.',
        });
      }

      const { imageDataURL, prompt }: GenerateRequest = req.body;

      // Validate required fields
      if (!imageDataURL || typeof imageDataURL !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid imageDataURL. Must be a base64 data URL string.',
        });
      }

      // Validate optional prompt
      if (prompt && typeof prompt !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid prompt. Must be a string.',
        });
      }

      // Validate image data URL
      const validation = validateImageDataURL(imageDataURL);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
        });
      }

      // Check for required environment variables
      if (!process.env.V0_API_KEY) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error: Missing API key',
        });
      }

      // Generate code from image
      console.log('[GENERATE] Starting code generation with prompt length:', prompt?.length || 0);
      const generatedCode = await generateCodeFromImageDataURL(imageDataURL, prompt);
      console.log('[GENERATE] Code generation completed, length:', generatedCode.length);

      // Return successful response
      console.log('[GENERATE] Sending successful response to user:', req.canva.userId);
      return res.status(200).json({
        success: true,
        code: generatedCode,
        userId: req.canva.userId,
      });
    } catch (error) {
      console.error('[GENERATE] Code generation failed:', error instanceof Error ? error.message : 'Unknown error');
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('quota')) {
          return res.status(429).json({
            success: false,
            error: 'API rate limit exceeded. Please try again later.',
          });
        }
        
        if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
          return res.status(401).json({
            success: false,
            error: 'API authentication failed. Please check your credentials.',
          });
        }
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to generate code. Please try again.',
      });
    }
  });

  return router;
};