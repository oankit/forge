import { generateText } from 'ai';
import { createVercel } from '@ai-sdk/vercel';

interface GenerateCodeRequest {
  imageUrl: string;
  prompt?: string;
}

interface GenerateCodeResponse {
  code: string;
  success: boolean;
  error?: string;
}

// Initialize Vercel AI provider
const vercel = createVercel({
  apiKey: process.env.VERCEL_API_KEY,
});

export async function generateCodeFromImage(
  imageUrl: string,
  userPrompt?: string
): Promise<GenerateCodeResponse> {
  try {
    // Default prompt for code generation
    const defaultPrompt = `
Analyze this design image and generate clean, modern React component code that recreates this design.

Requirements:
- Use React functional components with TypeScript
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper semantic HTML structure
- Add hover states and interactions where appropriate
- Use modern React patterns (hooks, etc.)
- Include proper TypeScript types
- Make the component reusable with props where it makes sense

Please provide only the React component code without any explanations or markdown formatting.`;

    const finalPrompt = userPrompt 
      ? `${userPrompt}\n\nAdditional context: ${defaultPrompt}`
      : defaultPrompt;

    // Generate code using Vercel AI SDK with v0 model
    const result = await generateText({
      model: vercel('v0-1.0-md'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: finalPrompt,
            },
            {
              type: 'image',
              image: imageUrl,
            },
          ],
        },
      ],
      maxTokens: 4000,
      temperature: 0.1, // Lower temperature for more consistent code generation
    });

    return {
      code: result.text,
      success: true,
    };
  } catch (error) {
    return {
      code: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Alternative function using fetch for direct API calls
export async function generateCodeFromImageDirect(
  imageUrl: string,
  userPrompt?: string
): Promise<GenerateCodeResponse> {
  try {
    const defaultPrompt = `
Analyze this design image and generate clean, modern React component code that recreates this design.

Requirements:
- Use React functional components with TypeScript
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper semantic HTML structure
- Add hover states and interactions where appropriate
- Use modern React patterns (hooks, etc.)
- Include proper TypeScript types
- Make the component reusable with props where it makes sense

Please provide only the React component code without any explanations or markdown formatting.`;

    const finalPrompt = userPrompt 
      ? `${userPrompt}\n\nAdditional context: ${defaultPrompt}`
      : defaultPrompt;

    const response = await fetch('https://api.vercel.com/v1/models/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'v0-1.0-md',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: finalPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedCode = data.choices?.[0]?.message?.content || '';

    return {
      code: generatedCode,
      success: true,
    };
  } catch (error) {
    return {
      code: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Utility function to convert blob URL to base64 for API consumption
export async function convertBlobToBase64(blobUrl: string): Promise<string> {
  try {
    // Validate blob URL format
    if (!blobUrl.startsWith('blob:')) {
      throw new Error('Invalid blob URL format');
    }

    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Validate blob size (limit to 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      throw new Error('Image size exceeds 10MB limit');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (!base64String) {
          reject(new Error('Failed to convert blob to base64'));
          return;
        }
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('FileReader error occurred'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`Failed to convert blob to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export types for use in other files
export type { GenerateCodeRequest, GenerateCodeResponse };