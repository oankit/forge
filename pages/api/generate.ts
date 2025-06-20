import { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from 'ai';
import { createVercel } from '@ai-sdk/vercel';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';

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

// Initialize Vercel AI provider
const vercel = createVercel({
  apiKey: process.env.VERCEL_API_KEY,
});

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
    console.error('Error generating code from image:', error);
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

/**
 * API handler for generating code from images
 * Protected by Canva JWT authentication
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<GenerateResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

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
    if (!process.env.VERCEL_API_KEY) {
      console.error('VERCEL_API_KEY environment variable is not set');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing API key',
      });
    }

    // Generate code from image
    console.log(`Generating code for user: ${req.user.sub}`);
    const generatedCode = await generateCodeFromImageDataURL(imageDataURL, prompt);

    // Return successful response
    return res.status(200).json({
      success: true,
      code: generatedCode,
      userId: req.user.sub,
    });
  } catch (error) {
    console.error('Error in /api/generate:', error);
    
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
}

// Export the handler wrapped with authentication middleware
export default withAuth(handler);

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger payloads for base64 images
    },
  },
};