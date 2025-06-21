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
  const defaultPrompt = `
Analyze this design image and generate a complete, production-ready React component that recreates the design exactly.

Requirements:
- Use modern React with TypeScript
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper semantic HTML
- Add hover states and interactions where appropriate
- Ensure the component is self-contained and ready to use
- Match colors, typography, spacing, and layout precisely
- Include any icons or graphics as SVG when possible

Return only the React component code, no explanations or markdown formatting.`;

  const prompt = userPrompt ? `${userPrompt}\n\n${defaultPrompt}` : defaultPrompt;

  try {
    const result = await generateText({
      model: vercel('v0-1.0-md'),
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
      maxTokens: 4000,
      temperature: 0.1, // Lower temperature for more consistent code generation
    });

    return result.text;
  } catch (error) {
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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