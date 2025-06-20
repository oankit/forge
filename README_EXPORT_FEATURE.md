# Canva Design Export & AI Code Generation

This feature allows users to export their Canva designs and generate React component code using AI. The implementation uses the Canva Design API for exporting and the Vercel AI SDK with the v0 API for code generation.

## Features

### 🎨 Design Export
- Export current Canva design as PNG or JPG
- Real-time progress tracking
- Error handling and user feedback
- Preview of exported design

### 🤖 AI Code Generation
- Generate React TypeScript components from design images
- Uses Vercel AI SDK with v0 model for high-quality code generation
- Customizable prompts for specific requirements
- Tailwind CSS styling by default

### 💻 Code Display & Management
- Syntax-highlighted code display
- Copy to clipboard functionality
- Download generated code as .tsx files
- Code statistics (lines, characters)
- Usage instructions

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already included in `package.json`:

```bash
npm install
```

Key dependencies:
- `@ai-sdk/vercel`: Vercel AI SDK provider
- `ai`: Core AI SDK functionality
- `@canva/design`: Canva Design API
- `@canva/app-ui-kit`: UI components

### 2. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Get your Vercel API key:
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new API token
   - Copy the token to your `.env` file:

```env
VERCEL_API_KEY=your_vercel_api_key_here
```

### 3. Start the Development Server

```bash
npm run start
# or for preview mode
npm run start:preview
```

## Usage Guide

### Accessing the Export Feature

1. Open your Canva app
2. Navigate to the "Export & Generate Code" tab
3. Configure your export settings:
   - **Export Format**: Choose PNG or JPG
   - **Code Generation Instructions**: Add custom prompts (optional)

### Exporting and Generating Code

1. Click "Export & Generate Code"
2. The process includes:
   - **Step 1**: Exporting design (25% progress)
   - **Step 2**: Processing image (50% progress)
   - **Step 3**: Generating code with AI (75% progress)
   - **Step 4**: Completion (100% progress)

3. View results in the "Generated Code" tab

### Working with Generated Code

- **Copy**: Click "Copy Code" to copy to clipboard
- **Download**: Click "Download" to save as .tsx file
- **Clear**: Remove current code and start over

## API Reference

### Export Design Component

```typescript
import { ExportDesign } from 'src/components/export_design';

<ExportDesign onCodeGenerated={(code) => console.log(code)} />
```

**Props:**
- `onCodeGenerated`: Callback function called when code is generated

### Code Display Component

```typescript
import { CodeDisplay } from 'src/components/code_display';

<CodeDisplay 
  code={generatedCode}
  title="Generated Component"
  language="typescript"
  onClear={() => setCode('')}
/>
```

**Props:**
- `code`: The code string to display
- `title`: Display title (optional)
- `language`: Programming language for syntax highlighting
- `onClear`: Callback for clearing the code

### API Endpoints

#### POST `/api/generate-code`

Generates React component code from a design image.

**Request Body:**
```typescript
{
  imageUrl: string;     // URL or base64 of the design image
  prompt?: string;      // Optional custom generation prompt
}
```

**Response:**
```typescript
{
  success: boolean;
  code?: string;        // Generated React component code
  error?: string;       // Error message if failed
}
```

## Code Generation Prompts

### Default Prompt
The system uses a comprehensive default prompt that generates:
- React functional components with TypeScript
- Tailwind CSS for styling
- Responsive and accessible design
- Modern React patterns (hooks, etc.)
- Proper semantic HTML structure

### Custom Prompts
You can provide custom instructions such as:
- "Create a mobile-first responsive component"
- "Use CSS modules instead of Tailwind"
- "Add hover animations and transitions"
- "Include accessibility features like ARIA labels"

## Architecture Overview

### Components Structure
```
src/components/
├── export_design.tsx    # Main export interface
├── code_display.tsx     # Code viewer and management
├── app_error.tsx        # Error handling
└── prompt_input.tsx     # Original prompt input
```

### API Structure
```
src/api/
├── generate-code.ts     # Core AI generation logic
└── api.ts              # Existing API utilities

pages/api/
└── generate-code.ts     # Next.js API route
```

### Data Flow
1. User initiates export from `ExportDesign` component
2. Design exported using `design.requestExport()`
3. Image URL sent to `/api/generate-code` endpoint
4. API calls Vercel AI SDK with v0 model
5. Generated code returned and displayed in `CodeDisplay`

## Error Handling

### Common Issues

1. **Export Failed**: Design export was cancelled or failed
   - Solution: Try again or check design permissions

2. **API Key Missing**: Vercel API key not configured
   - Solution: Add `VERCEL_API_KEY` to `.env` file

3. **Generation Timeout**: AI request took too long
   - Solution: Try with a simpler design or check network



### Error Recovery
- All errors are displayed with user-friendly messages
- "Start Over" button allows easy recovery
- Progress is reset on errors

## Customization

### Styling
Components use Canva's App UI Kit for consistent styling:
- Modify component props for different appearances
- Extend with custom CSS if needed

### AI Models
To use different AI providers, modify `src/api/generate-code.ts`:

```typescript
// Example: Using OpenAI instead
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4-vision-preview'),
  // ... rest of configuration
});
```

### Export Formats
Add more export formats by modifying the `ExportFormat` type:

```typescript
type ExportFormat = 'png' | 'jpg' | 'pdf' | 'svg';
```

## Performance Considerations

- **Image Size**: Larger designs take longer to export and process
- **API Limits**: Vercel AI SDK has rate limits and token costs
- **Memory Usage**: Large images may consume significant memory
- **Network**: Export and generation require stable internet

## Security Notes

- API keys are server-side only (never exposed to client)
- Image URLs are temporary and expire automatically
- Generated code is not stored permanently
- All API requests include proper error handling

## Troubleshooting

### Development Issues

1. **TypeScript Errors**: Ensure all dependencies are installed
2. **Import Errors**: Check file paths and component exports
3. **API Errors**: Verify environment variables and API keys

### Runtime Issues

1. **Slow Generation**: Try smaller images or simpler designs
2. **Poor Code Quality**: Provide more specific prompts
3. **Export Failures**: Check Canva app permissions

## Contributing

When contributing to this feature:

1. Follow existing code patterns and TypeScript types
2. Add proper error handling for new functionality
3. Update this README for any new features
4. Test with various design types and sizes
5. Ensure accessibility compliance

## License

This feature is part of the Canva AI Agent Challenge and follows the same license terms as the main project.