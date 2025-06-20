import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCodeFromImage, convertBlobToBase64 } from '../../src/api/generate_code';

interface GenerateCodeRequestBody {
  imageUrl: string;
  prompt?: string;
}

interface GenerateCodeResponse {
  code?: string;
  success: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateCodeResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
      });
    }

    const { imageUrl, prompt }: GenerateCodeRequestBody = req.body;

    // Validate required fields
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'imageUrl is required and must be a string',
      });
    }

    // Validate prompt if provided
    if (prompt !== undefined && typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'prompt must be a string if provided',
      });
    }

    // Validate imageUrl format
    if (!imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl must be a valid blob, data, or http URL',
      });
    }

    // Validate API key
    if (!process.env.VERCEL_API_KEY || typeof process.env.VERCEL_API_KEY !== 'string') {
      // Log error without using console.error to avoid ESLint warning
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing or invalid API key',
      });
    }

    // Convert blob URL to base64 if needed
    let processedImageUrl = imageUrl;
    if (imageUrl.startsWith('blob:')) {
      try {
        processedImageUrl = await convertBlobToBase64(imageUrl);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error instanceof Error ? `Failed to process image URL: ${error.message}` : 'Failed to process image URL',
        });
      }
    }

    // Generate code from image
    const result = await generateCodeFromImage(processedImageUrl, prompt);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate code',
      });
    }

    return res.status(200).json({
      success: true,
      code: result.code,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? `Internal server error: ${error.message}` : 'Internal server error',
    });
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger payloads for image data
    },
  },
};