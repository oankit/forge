# Canva AI Code Generator App 🎨🤖

## 📋 Project Description

Forge is a AI Design-to-Code Agent, it's an app that transforms Canva designs into production-ready React code using AI. It integrates with Vercel's v0 API and platform to generate, preview, and deploy functional web components directly from your design elements.

## 📸 App Screenshots & Demo

### Generate Code Tab
![Generate Code Tab](./assets/Generate%20Code%20Tab.png)

### Code View
![Code View](./assets/Code%20View.png)

### V0 Build Integration
![V0 Build](./assets/V0%20Build.png)

### Deployed Build
![Deployed Build](./assets/Deployed%20build.png)

### Demo Video
[Seamless Design to Code Workflow](https://www.tella.tv/video/cmc8awf3400000bia06tnhgw6/edit?status=ModalShare)

---

## 🏆 For Judges - Environment Setup

### Quick Start for Testing
1. Extract the provided `judge-env.7z` file (password provided separately)
2. Rename `.env.judges` to `.env`
3. Run `npm start`
4. Follow the testing instructions in the [Testing Section](#testing)

### Alternative Setup
If you prefer to use your own API keys:
1. Copy `.env.template` to `.env`
2. Obtain API keys from:
   - [Canva Developer Portal](https://www.canva.dev/)
   - [Vercel AI Platform](https://vercel.com/ai)
3. Follow the setup instructions above
```

#### In Your Submission Package
```
submission/
├── README.md
├── judge-env.7z (password-protected)
├── setup-instructions.md
└── demo-video.mp4 (optional)
```

### ⚠️ Security Considerations

#### DO:
- ✅ Use **test/limited API keys**
- ✅ Create **temporary credentials**
- ✅ Use **password protection**
- ✅ Share passwords through **separate channels**
- ✅ Set **expiration dates** on shared files
- ✅ **Revoke credentials** after judging period

#### DON'T:
- ❌ Share production API keys
- ❌ Include credentials in public repositories
- ❌ Send passwords in the same email as files
- ❌ Use permanent/high-limit API keys
- ❌ Share personal Vercel tokens

### 🎯 Recommended Submission Approach

1. **Create test credentials** with limited scope
2. **Package in password-protected archive**
3. **Include clear setup instructions**
4. **Provide password through separate channel**
5. **Include fallback instructions** for judges who prefer their own keys
6. **Plan to revoke** test credentials after judging

### 📞 Support for Judges

Include contact information for technical support:

```markdown
## 🆘 Need Help?

If you encounter any issues during setup:
- 📧 Email: omar.ankit2001@gmail.com
```


**Canva AI Agent Challenge Submission**

Welcome to the Canva AI Code Generator App! This innovative application allows users to export their Canva designs and generate React component code using AI. Built for the Canva AI Agent Challenge, it demonstrates the power of combining design tools with AI-powered code generation.

## 🌟 Features

### 🎨 Design Export
- Export current Canva design as PNG or JPG
- Real-time progress tracking with visual feedback
- Error handling and user notifications
- Preview of exported design before code generation

### 🤖 AI Code Generation
- Generate React TypeScript components from design images
- Uses Vercel AI SDK with v0-1.0-md model for high-quality code generation
- Customizable prompts for specific styling requirements
- Tailwind CSS styling by default
- Smart hints for optimal single-component generation

### 💻 Code Display & Management
- Syntax-highlighted code display with Prism.js
- Copy to clipboard functionality
- Download generated code as .tsx files
- Code statistics (lines, characters)
- Clear usage instructions and tips

### 🚀 Deployment Integration
- Deploy generated components directly to Vercel
- Automated deployment pipeline
- Live preview URLs for generated components

**Note:** This code and documentation assumes some experience with TypeScript and React.

## 📋 Requirements

- Node.js `v18` or `v20.10.0`
- npm `v9` or `v10`
- Canva Developer Account
- Vercel Account (for AI code generation)
- Vercel Account with Deploy Token (for deployment features)

**Note:** To make sure you're running the correct version of Node.js, we recommend using a version manager, such as [nvm](https://github.com/nvm-sh/nvm#intro). The [.nvmrc](/.nvmrc) file in the root directory of this repo will ensure the correct version is used once you run `nvm install`.

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd forge
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
```bash
cp .env.template .env
```

2. Configure the following environment variables in `.env`:

```bash
# Canva App Configuration
CANVA_APP_ID=your_canva_app_id
CANVA_APP_ORIGIN=your_app_origin

# Server Configuration
CANVA_BACKEND_PORT=3001
CANVA_FRONTEND_PORT=8080
CANVA_BACKEND_HOST=http://localhost:3001

# Development Features
CANVA_HMR_ENABLED=TRUE

# AI Code Generation (Required)
V0_API_KEY=your_vercel_v0_api_key

# Deployment Features (Optional)
VERCEL_DEPLOY_TOKEN=your_vercel_deploy_token
```

### 3. Get Required API Keys

#### Canva Developer Setup:
1. Visit [Canva Developer Portal](https://www.canva.com/developers/apps)
2. Create a new app or use existing app
3. Copy the **App ID** and **App Origin** from your app settings
4. Get your JWT secret from the app configuration

#### Vercel AI API Key:
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with appropriate permissions
3. Copy the token as `V0_API_KEY`

#### Vercel Deploy Token (Optional):
1. In Vercel dashboard, go to Settings > Tokens
2. Create a new token for deployment
3. Copy the token as `VERCEL_DEPLOY_TOKEN`

## 🏃‍♂️ How to Run the System

### Step 1: Start the Development Server

The application includes both frontend and backend servers that start simultaneously:

```bash
npm start
```

This command will:
- Start the frontend development server at `http://localhost:8080`
- Start the backend API server at `http://localhost:3001`
- Enable hot module replacement for faster development
- Watch for file changes and auto-reload

**Server Status:**
- Frontend: `http://localhost:8080` (Webpack dev server)
- Backend API: `http://localhost:3001` (Express server)
- Main app source: `src/app.tsx`
- Backend source: `backend/server.ts`

### Step 2: Preview the app

The local development server only exposes a JavaScript bundle, so you can't preview an app by visiting <http://localhost:8080>. You can only preview an app via the Canva editor.

To preview an app:

1. Create an app via the [Developer Portal](https://www.canva.com/developers/apps).
2. Select **App source > Development URL**.
3. In the **Development URL** field, enter the URL of the development server.
4. Click **Preview**. This opens the Canva editor (and the app) in a new tab.
5. Click **Open**. (This screen only appears when using an app for the first time.)

The app will appear in the side panel.

<details>
  <summary>Previewing apps in Safari</summary>

By default, the development server is not HTTPS-enabled. This is convenient, as there's no need for a security certificate, but it prevents apps from being previewed in Safari.

**Why Safari requires the development server to be HTTPS-enabled?**

Canva itself is served via HTTPS and most browsers prevent HTTPS pages from loading scripts via non-HTTPS connections. Chrome and Firefox make exceptions for local servers, such as `localhost`, but Safari does not, so if you're using Safari, the development server must be HTTPS-enabled.

To learn more, see [Loading mixed-content resources](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_mixed-content_resources).

To preview apps in Safari:

1. Start the development server with HTTPS enabled:

```bash
npm start --use-https
```

2. Navigate to <https://localhost:8080>.
3. Bypass the invalid security certificate warning:
   1. Click **Show details**.
   2. Click **Visit website**.
4. In the Developer Portal, set the app's **Development URL** to <https://localhost:8080>.
5. Click preview (or refresh your app if it's already open).

You need to bypass the invalid security certificate warning every time you start the local server. A similar warning will appear in other browsers (and will need to be bypassed) whenever HTTPS is enabled.

</details>

### (Optional) Step 3: Enable Hot Module Replacement

By default, every time you make a change to an app, you have to reload the entire app to see the results of those changes. If you enable [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) (HMR), changes will be reflected without a full reload, which significantly speeds up the development loop.

**Note:** HMR does **not** work while running the development server in a Docker container.

To enable HMR:

1. Navigate to an app via the [Your apps](https://www.canva.com/developers/apps).
2. Select **Configure your app**.
3. Copy the value from the **App origin** field. This value is unique to each app and cannot be customized.
4. In the root directory, open the `.env` file.
5. Set the `CANVA_APP_ORIGIN` environment variable to the value copied from the **App origin** field:

   ```bash
   CANVA_APP_ORIGIN=# YOUR APP ORIGIN GOES HERE
   ```

6. Set the `CANVA_HMR_ENABLED` environment variable to `true`:

   ```bash
   CANVA_HMR_ENABLED=true
   ```

7. Restart the local development server.
8. Reload the app manually to ensure that HMR takes effect.

## Running an app's backend

Some templates provide an example backend. This backend is defined in the template's `backend/server.ts` file, automatically starts when the `npm start` command is run, and becomes available at <http://localhost:3001>.

To run templates that have a backend:

1. Navigate to the [Your apps](https://www.canva.com/developers/apps) page.
2. Copy the ID of an app from the **App ID** column.
3. In the starter kit's `.env` file, set `CANVA_APP_ID` to the ID of the app.

   For example:

   ```bash
   CANVA_APP_ID=AABBccddeeff
   CANVA_APP_ORIGIN=#
   CANVA_BACKEND_PORT=3001
   CANVA_FRONTEND_PORT=8080
   CANVA_BACKEND_HOST=http://localhost:3001
   CANVA_HMR_ENABLED=FALSE
   ```

4. Start the app:

   ```bash
   npm start
   ```

The ID of the app must be explicitly defined because it's required to [send and verify HTTP requests](https://www.canva.dev/docs/apps/verifying-http-requests/). If you don't set up the ID in the `.env` file, an error will be thrown when attempting to run the example.

## Customizing the backend host

If your app has a backend, the URL of the server likely depends on whether it's a development or production build. For example, during development, the backend is probably running on a localhost URL, but once the app's in production, the backend needs to be exposed to the internet.

To more easily customize the URL of the server:

1. Open the `.env` file in the text editor of your choice.
2. Set the `CANVA_BACKEND_HOST` environment variable to the URL of the server.
3. When sending a request, use `BACKEND_HOST` as the base URL:

   ```ts
   const response = await fetch(`${BACKEND_HOST}/custom-route`);
   ```

   **Note:** `BACKEND_HOST` is a global constant that contains the value of the `CANVA_BACKEND_HOST` environment variable. The variable is made available to the app via webpack and does not need to be imported.

4. Before bundling the app for production, update `CANVA_BACKEND_HOST` to point to the production backend.

## Configure ngrok (optional)

If your app requires authentication with a third party service, your server needs to be exposed via a publicly available URL, so that Canva can send requests to it.
This step explains how to do this with [ngrok](https://ngrok.com/).

**Note:** ngrok is a useful tool, but it has inherent security risks, such as someone figuring out the URL of your server and accessing proprietary information. Be mindful of the risks, and if you're working as part of an organization, talk to your IT department.
You must replace ngrok urls with hosted API endpoints for production apps.

To use ngrok, you'll need to do the following:

1. Sign up for a ngrok account at <https://ngrok.com/>.
2. Locate your ngrok [authtoken](https://dashboard.ngrok.com/get-started/your-authtoken).
3. Set an environment variable for your authtoken, using the command line. Replace `<YOUR_AUTH_TOKEN>` with your actual ngrok authtoken:

   For macOS and Linux:

   ```bash
   export NGROK_AUTHTOKEN=<YOUR_AUTH_TOKEN>
   ```

   For Windows PowerShell:

   ```shell
   $Env:NGROK_AUTHTOKEN = "<YOUR_AUTH_TOKEN>"
   ```

This environment variable is available for the current terminal session, so the command must be re-run for each new session. Alternatively, you can add the variable to your terminal's default parameters.

## 🧪 How to Test the System

### Manual Testing Guide

#### 1. Basic App Functionality
1. Start the development server (`npm start`)
2. Open Canva editor and load your app
3. Verify the app loads without errors
4. Check that both "Generate Code" and "View Code" tabs are visible

#### 2. Design Export Testing
1. Create a simple design in Canva (e.g., a button, card, or text element)
2. Click on the "Generate Code" tab
3. Verify the export progress indicator appears
4. Check that the design preview loads correctly
5. Ensure no error messages appear during export

#### 3. AI Code Generation Testing
1. After successful design export, the system should automatically generate code
2. Verify the loading states and progress indicators
3. Check that the "View Code" tab shows a checkmark when complete
4. Switch to "View Code" tab to see generated code
5. Verify syntax highlighting is working
6. Test the copy-to-clipboard functionality
7. Test the download functionality

#### 4. Custom Prompt Testing
1. In the "Generate Code" tab, add custom instructions
2. Examples to test:
   - "Use Tailwind CSS with dark theme"
   - "Make it responsive with mobile-first approach"
   - "Add hover effects and animations"
3. Verify the generated code reflects the custom instructions

#### 5. Error Handling Testing
1. Test with invalid/corrupted designs
2. Test with very large designs
3. Test with no internet connection
4. Verify appropriate error messages are shown
5. Test recovery after errors

#### 6. API Endpoint Testing

Test the backend API endpoints directly:

```bash
# Test the generate endpoint (requires valid JWT token)
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "imageDataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "prompt": "Create a simple button component"
  }'

# Test the deploy endpoint (optional, requires Vercel token)
curl -X POST http://localhost:3001/api/deploy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "export default function Button() { return <button>Click me</button>; }",
    "componentName": "TestButton"
  }'
```

### Performance Testing

1. **Load Testing**: Test with multiple concurrent users
2. **Large Design Testing**: Test with complex designs (10+ elements)
3. **Memory Usage**: Monitor browser memory during long sessions
4. **Network Testing**: Test with slow network connections

### Browser Compatibility Testing

Test the app in different browsers:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari (requires HTTPS setup)
- ✅ Edge

### Mobile Testing

While the app runs in Canva's desktop editor, test responsive behavior:
1. Use browser dev tools to simulate mobile viewports
2. Test touch interactions
3. Verify UI components scale appropriately

## 🎯 Usage Instructions

### For Judges and Testers

#### Test Design Available
For quick testing, you can use this pre-made test design:
**[Sample UI Components Design](https://www.canva.com/design/DAGrHgCctX0/HbYmffq0eyIf_hwDctlQNQ/edit?utm_content=DAGrHgCctX0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)**

This design contains various UI components perfect for testing the AI code generation features.

1. **Quick Demo Flow**:
   - Use the test design above OR create a simple UI component in Canva (button, card, etc.)
   - Open the AI Code Generator app
   - Click "Generate Code" and wait for processing
   - View the generated React component code
   - Copy or download the code

2. **Advanced Testing**:
   - Try complex designs with multiple elements
   - Test custom prompts for specific styling
   - Test error scenarios (invalid designs, network issues)
   - Verify deployment functionality (if Vercel token provided)

3. **Code Quality Assessment**:
   - Review generated TypeScript code quality
   - Check for proper component structure
   - Verify Tailwind CSS usage
   - Test generated components in a React project

### Best Practices for Optimal Results

1. **Design Recommendations**:
   - Use single, focused components rather than complex layouts
   - Ensure good contrast and clear visual hierarchy
   - Keep designs reasonably sized (not too large or too small)

2. **Prompt Engineering**:
   - Be specific about styling requirements
   - Mention framework preferences (Tailwind, styled-components, etc.)
   - Include accessibility requirements if needed
   - Specify responsive behavior if required

## 📚 Additional Documentation

- [Export Feature Documentation](./README_EXPORT_FEATURE.md) - In-depth feature documentation
- [Canva Apps SDK Documentation](https://www.canva.dev/docs/apps/) - Official Canva platform docs

## 🐛 Troubleshooting

### Common Issues

1. **App won't load in Canva**:
   - Check that development server is running
   - Verify CANVA_APP_ID is correctly set
   - Ensure app origin matches in Developer Portal

2. **Code generation fails**:
   - Verify V0_API_KEY is valid and has sufficient credits
   - Check network connectivity
   - Try with a simpler design

3. **Export errors**:
   - Ensure design has exportable elements
   - Check browser console for detailed error messages
   - Try refreshing the app

4. **HTTPS issues in Safari**:
   - Use `npm start --use-https`
   - Accept the security certificate warning
   - Update app origin to use HTTPS URL

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Review the terminal output for server errors
3. Verify all environment variables are correctly set
4. Ensure all required API keys are valid and have appropriate permissions

## 🏆 For Judges - Environment Setup

### Quick Start for Testing
1. Extract the provided `judge-env.7z` file (password provided separately)
2. Rename `.env.judges` to `.env`
3. Run `npm start`
4. Follow the testing instructions in the [Testing Section](#testing)

### Alternative Setup
If you prefer to use your own API keys:
1. Copy `.env.template` to `.env`
2. Obtain API keys from:
   - [Canva Developer Portal](https://www.canva.dev/)
   - [Vercel AI Platform](https://vercel.com/ai)
3. Follow the setup instructions above
