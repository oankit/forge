# API Routes Documentation

This document describes the new API routes for generating and deploying code using the Vercel AI SDK and Vercel deployment API.

## Overview

Two new protected API routes have been added:
- `/api/generate` - Generate React component code from images using v0-1.0-md model
- `/api/deploy` - Deploy generated code to Vercel

Both routes are protected by JWT authentication middleware that validates Canva User tokens.

## Authentication

All API routes require a valid Canva User JWT token in the Authorization header:

```
Authorization: Bearer <canva_user_jwt_token>
```

### Environment Variables Required

```bash
# For JWT verification
CANVA_JWT_SECRET=your_canva_jwt_secret

# For code generation
V0_API_KEY=your_V0_API_KEY

# For deployment
VERCEL_DEPLOY_TOKEN=your_vercel_deploy_token
```

## API Routes

### POST /api/generate

Generates React component code from an image using the Vercel AI SDK's v0-1.0-md model.

#### Request Body

```typescript
interface GenerateRequest {
  imageDataURL: string;  // Base64 data URL (required)
  prompt?: string;       // Optional custom prompt
}
```

#### Example Request

```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <canva_user_jwt_token>'
  },
  body: JSON.stringify({
    imageDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    prompt: 'Create a modern card component with hover effects'
  })
});

const result = await response.json();
```

#### Response

```typescript
interface GenerateResponse {
  success: boolean;
  code?: string;         // Generated React component code
  error?: string;        // Error message if failed
  userId?: string;       // User ID from JWT
}
```

#### Example Response

```json
{
  "success": true,
  "code": "import React from 'react';\n\nconst GeneratedComponent = () => {\n  return (\n    <div className=\"bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow\">\n      <h2 className=\"text-xl font-bold mb-4\">Card Title</h2>\n      <p className=\"text-gray-600\">Card content goes here...</p>\n    </div>\n  );\n};\n\nexport default GeneratedComponent;",
  "userId": "user_123"
}
```

### POST /api/deploy

Deploys generated code to Vercel as a complete Next.js or React application.

#### Request Body

```typescript
interface DeployRequest {
  code: string;              // Generated component code (required)
  componentName?: string;    // Component name (default: 'GeneratedComponent')
  projectName?: string;      // Project name (auto-generated if not provided)
  framework?: 'next' | 'react'; // Framework choice (default: 'next')
}
```

#### Example Request

```javascript
const response = await fetch('/api/deploy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <canva_user_jwt_token>'
  },
  body: JSON.stringify({
    code: generatedCode,
    componentName: 'MyAwesomeComponent',
    projectName: 'my-canva-component',
    framework: 'next'
  })
});

const result = await response.json();
```

#### Response

```typescript
interface DeployResponse {
  success: boolean;
  deploymentUrl?: string;    // Live deployment URL
  error?: string;           // Error message if failed
  userId?: string;          // User ID from JWT
}
```

#### Example Response

```json
{
  "success": true,
  "deploymentUrl": "https://my-canva-component-abc123.vercel.app",
  "userId": "user_123"
}
```

## Error Handling

All routes return consistent error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

### Common Error Codes

- `401` - Unauthorized (invalid or missing JWT token)
- `400` - Bad Request (invalid request body or parameters)
- `405` - Method Not Allowed (only POST is supported)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Security Features

### JWT Middleware

The authentication middleware (`src/middleware/auth.ts`) provides:

- JWT token verification using `jsonwebtoken`
- Issuer validation (must be 'canva.com')
- Expiration checking
- Required claims validation
- Rate limiting protection

### Input Validation

- Image data URL format validation
- File size limits (10MB for images, 2MB for code)
- Request body structure validation
- Environment variable checks

## Usage in Canva App

To integrate these API routes into your Canva app:

1. **Export Design**: Use `@canva/design` to export the current design as PNG
2. **Convert to Base64**: Convert the blob URL to base64 data URL
3. **Generate Code**: Call `/api/generate` with the image data
4. **Deploy (Optional)**: Call `/api/deploy` to create a live preview

### Example Integration

```typescript
import { requestExport } from '@canva/design';

// Export design and generate code
const handleGenerateAndDeploy = async () => {
  try {
    // 1. Export design
    const response = await requestExport({
      acceptedFileTypes: ['PNG'],
    });
    
    if (response.status === 'COMPLETED') {
      // 2. Convert to base64
      const imageDataURL = await convertBlobToBase64(response.exportBlobs[0].url);
      
      // 3. Generate code
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userJwtToken}`
        },
        body: JSON.stringify({ imageDataURL })
      });
      
      const { code } = await generateResponse.json();
      
      // 4. Deploy code
      const deployResponse = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userJwtToken}`
        },
        body: JSON.stringify({ code })
      });
      
      const { deploymentUrl } = await deployResponse.json();
      console.log('Deployed to:', deploymentUrl);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## File Structure

```
pages/api/
├── generate.ts          # Code generation endpoint
├── deploy.ts           # Deployment endpoint
└── generate_code.ts    # Original endpoint (legacy)

src/middleware/
└── auth.ts             # JWT authentication middleware
```

## Dependencies

The new API routes require these packages (already included in package.json):

- `ai` - Vercel AI SDK
- `@ai-sdk/vercel` - Vercel AI provider
- `jsonwebtoken` - JWT token verification
- `@types/jsonwebtoken` - TypeScript types

## Testing

To test the API routes:

1. Ensure environment variables are set
2. Start the development server: `npm run start`
3. Use a tool like Postman or curl to test the endpoints
4. Include a valid Canva User JWT token in the Authorization header

### Example curl command

```bash
curl -X POST http://localhost:8080/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "imageDataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

## Limitations

- Maximum image size: 10MB
- Maximum code size for deployment: 2MB
- Rate limiting: 10 requests per minute per IP
- JWT tokens must be issued by 'canva.com'
- Deployment creates new projects (no updates to existing projects)

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check JWT token format and validity
2. **500 Server Error**: Verify environment variables are set
3. **400 Bad Request**: Validate request body structure and data types
4. **429 Rate Limited**: Wait before making additional requests

### Debug Tips

- Check server logs for detailed error messages
- Verify JWT token claims using jwt.io
- Test with smaller images if getting size errors
- Ensure Vercel API tokens have correct permissions