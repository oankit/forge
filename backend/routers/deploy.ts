import * as express from 'express';
import { createJwtMiddleware } from '../../utils/backend/jwt_middleware';
import type { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  canva: {
    appId: string;
    userId: string;
    brandId: string;
  };
}

interface DeployRequest {
  code: string;
  componentName?: string;
  projectName?: string;
  framework?: 'next' | 'react';
}

interface DeployResponse {
  success: boolean;
  deploymentUrl?: string;
  error?: string;
  userId?: string;
}

interface VercelDeploymentResponse {
  id: string;
  url: string;
  readyState: string;
  createdAt: string;
}

/**
 * Creates an Express router for the deploy API
 */
export const createDeployRouter = () => {
  console.log('[DEPLOY] Creating deploy router...');
  const router = express.Router();
  const jwtMiddleware = createJwtMiddleware(process.env.CANVA_APP_ID || 'default-app-id');

/**
 * Create a deployment on Vercel with the generated code
 */
async function createVercelDeployment(
  code: string,
  componentName: string,
  projectName: string,
  framework: 'next' | 'react' = 'next'
): Promise<string> {
  // Validate Vercel API token
  const vercelToken = process.env.VERCEL_ACCESS_TOKEN;
  if (!vercelToken) {
    throw new Error('VERCEL_ACCESS_TOKEN environment variable is not set');
  }

  // Prepare files for deployment
  interface DeploymentFile {
    file: string;
    data: string;
  }
  const files: DeploymentFile[] = [];

  // Add package.json
  if (framework === 'next') {
    files.push({
      file: 'package.json',
      data: JSON.stringify({
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '^15.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          typescript: '^5.1.6',
          '@types/node': '^20.5.0',
          '@types/react': '^18.2.20',
          '@types/react-dom': '^18.2.7',
          tailwindcss: '^3.4.0',
          autoprefixer: '^10.4.16',
          postcss: '^8.4.32',
          'class-variance-authority': '^0.7.0',
          clsx: '^2.0.0',
          'tailwind-merge': '^2.0.0',
          'lucide-react': '^0.263.1',
        },
        devDependencies: {
          eslint: '^8.57.0',
          'eslint-config-next': '^15.0.0',
          '@tailwindcss/typography': '^0.5.10',
        },
      }),
    });

    // Add tsconfig.json
    files.push({
      file: 'tsconfig.json',
      data: JSON.stringify({
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
        exclude: ['node_modules'],
      }),
    });

    // Add next.config.js
    files.push({
      file: 'next.config.js',
      data: `/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
}`,
    });

    // Add tailwind.config.js
    files.push({
      file: 'tailwind.config.js',
      data: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    });

    // Add postcss.config.js
    files.push({
      file: 'postcss.config.js',
      data: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    });

    // Add globals.css with Tailwind directives
    files.push({
      file: 'styles/globals.css',
      data: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    });

    // Add _app.tsx
    files.push({
      file: 'pages/_app.tsx',
      data: `import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}`,
    });

    // Add index.tsx with the generated component
    files.push({
      file: 'pages/index.tsx',
      data: `import type { NextPage } from 'next';
import Head from 'next/head';
import ${componentName} from '../components/${componentName}';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>${componentName} - Generated by Canva AI</title>
        <meta name="description" content="Generated by Canva AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">

        <div className="w-full max-w-4xl">
          <${componentName} />
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Generated using Vercel v0 model
        </p>
      </main>
    </div>
  );
};

export default Home;`,
    });

    // Add the generated component
    files.push({
      file: `components/${componentName}.tsx`,
      data: code,
    });
  } else {
    // React framework setup (simplified)
    // Add more files as needed for React setup
    files.push({
      file: 'package.json',
      data: JSON.stringify({
        name: projectName,
        version: '0.1.0',
        private: true,
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          'react-scripts': '5.0.1',
          typescript: '^5.1.6',
          '@types/react': '^18.2.20',
          '@types/react-dom': '^18.2.7',
          'tailwindcss': '^3.3.3',
          'postcss': '^8.4.28',
          'autoprefixer': '^10.4.15',
        },
        scripts: {
          start: 'react-scripts start',
          build: 'react-scripts build',
          test: 'react-scripts test',
          eject: 'react-scripts eject',
        },
      }),
    });

    // Add the generated component
    files.push({
      file: `src/components/${componentName}.tsx`,
      data: code,
    });

    // Add App.tsx
    files.push({
      file: 'src/App.tsx',
      data: `import React from 'react';
import ${componentName} from './components/${componentName}';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-3xl font-bold mb-8">Generated Component</h1>
        <div className="w-full max-w-4xl">
          <${componentName} />
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Generated using Vercel v0 model
        </p>
      </main>
    </div>
  );
}

export default App;`,
    });

    // Add index.css with Tailwind
    files.push({
      file: 'src/index.css',
      data: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    });

    // Add index.tsx
    files.push({
      file: 'src/index.tsx',
      data: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    });
  }

  // Create deployment payload
  const payload = {
    name: projectName,
    files: files.map(({ file, data }) => ({
      file,
      data: typeof data === 'string' ? data : JSON.stringify(data),
    })),
    projectSettings: {
      framework: framework === 'next' ? 'nextjs' : 'create-react-app',
      devCommand: framework === 'next' ? 'next dev' : 'react-scripts start',
      buildCommand: framework === 'next' ? 'next build' : 'react-scripts build',
      outputDirectory: framework === 'next' ? '.next' : 'build',
    },
  };

  try {
    // Make API request to Vercel
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vercelToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Vercel API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as VercelDeploymentResponse;
    return data.url;
  } catch (error) {
    throw new Error(`Failed to create deployment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

  // POST /api/deploy - Deploy generated code to Vercel
  router.post('/', jwtMiddleware, async (req: AuthenticatedRequest, res: Response<DeployResponse>) => {
    console.log('[DEPLOY] Received deployment request from user:', req.canva?.userId);
    try {
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body. Expected JSON object.',
        });
      }

      const { code, componentName, projectName, framework }: DeployRequest = req.body;

      // Validate required fields
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid code. Must be a string.',
        });
      }

      // Validate optional fields
      if (componentName && typeof componentName !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid componentName. Must be a string.',
        });
      }

      if (projectName && typeof projectName !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid projectName. Must be a string.',
        });
      }

      if (framework && !['next', 'react'].includes(framework)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid framework. Must be "next" or "react".',
        });
      }

      // Check for required environment variables
      if (!process.env.VERCEL_ACCESS_TOKEN) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error: Missing deployment token',
        });
      }

      // Format component name if not provided
      const formattedComponentName = componentName || 'GeneratedComponent';
      
      // Format project name if not provided
      const formattedProjectName = projectName || 
        `forge-preview-${req.canva.userId.substring(0, 8)}-${Date.now().toString(36)}`;

      // Create deployment
      console.log('[DEPLOY] Creating Vercel deployment for project:', formattedProjectName);
      const deploymentUrl = await createVercelDeployment(
        code,
        formattedComponentName,
        formattedProjectName,
        framework || 'next'
      );
      console.log('[DEPLOY] Deployment successful:', deploymentUrl);

      // Return successful response
      console.log('[DEPLOY] Sending successful response to user:', req.canva.userId);
      return res.status(200).json({
        success: true,
        deploymentUrl,
        userId: req.canva.userId,
      });
    } catch (error) {
      console.error('[DEPLOY] Deployment failed:', error instanceof Error ? error.message : 'Unknown error');
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
        error: 'Failed to deploy code. Please try again.',
      });
    }
  });

  return router;
};