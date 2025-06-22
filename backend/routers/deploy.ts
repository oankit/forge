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

interface DeploymentFile {
  file: string;
  data: string;
}

/**
 * Add common shadcn/ui components that v0 frequently uses
 */
function addCommonShadcnComponents(files: DeploymentFile[]) {
  // Add utils.ts (required for all shadcn components)
  files.push({
    file: 'lib/utils.ts',
    data: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`
  });

  // Button component (most common)
  files.push({
    file: 'components/ui/button.tsx',
    data: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`
  });

  // Card component (very common)
  files.push({
    file: 'components/ui/card.tsx',
    data: `import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`
  });

  // Input component
  files.push({
    file: 'components/ui/input.tsx',
    data: `import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }`
  });

  // Label component
  files.push({
    file: 'components/ui/label.tsx',
    data: `import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }`
  });

  // Badge component
  files.push({
    file: 'components/ui/badge.tsx',
    data: `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }`
  });

  // Progress component
  files.push({
    file: 'components/ui/progress.tsx',
    data: `import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: \`translateX(-\${100 - (value || 0)}%)\` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }`
  });

  // Slider component
  files.push({
    file: 'components/ui/slider.tsx',
    data: `import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }`
  });
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
          // Core Framework
          "next": "^15.0.0",
          "react": "^19.0.0",
          "react-dom": "^19.0.0",
          "typescript": "^5.6.0",
          "@types/node": "^22.0.0",
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          
          // AI SDK - Latest versions
          "ai": "^4.0.0",
          "@ai-sdk/react": "^0.0.62",
          "@ai-sdk/openai": "^1.0.0",
          "zod": "^3.23.8",
          
          // Styling
          "tailwindcss": "^3.4.0",
          "autoprefixer": "^10.4.16",
          "postcss": "^8.4.32",
          "class-variance-authority": "^0.7.0",
          "clsx": "^2.0.0",
          "tailwind-merge": "^2.0.0",
          
          // Icons
          "lucide-react": "^0.522.0",
          
          // Radix UI - Core Components
          "@radix-ui/react-slot": "^1.0.2",
          "@radix-ui/react-label": "^2.0.2",
          "@radix-ui/react-dialog": "^1.0.5",
          "@radix-ui/react-dropdown-menu": "^2.0.6",
          "@radix-ui/react-select": "^2.0.0",
          "@radix-ui/react-separator": "^1.0.3",
          "@radix-ui/react-avatar": "^1.0.4",
          "@radix-ui/react-checkbox": "^1.0.4",
          "@radix-ui/react-popover": "^1.0.7",
          "@radix-ui/react-scroll-area": "^1.0.5",
          "@radix-ui/react-switch": "^1.0.3",
          "@radix-ui/react-tabs": "^1.0.4",
          "@radix-ui/react-toast": "^1.1.5",
          "@radix-ui/react-tooltip": "^1.0.7",
          
          // Radix UI - Extended Components
          "@radix-ui/react-accordion": "^1.1.2",
          "@radix-ui/react-alert-dialog": "^1.0.5",
          "@radix-ui/react-progress": "^1.0.3",
          "@radix-ui/react-radio-group": "^1.1.3",
          "@radix-ui/react-slider": "^1.1.2",
          "@radix-ui/react-toggle": "^1.0.3",
          "@radix-ui/react-collapsible": "^1.0.3",
          "@radix-ui/react-hover-card": "^1.0.7",
          "@radix-ui/react-menubar": "^1.0.4",
          "@radix-ui/react-navigation-menu": "^1.1.4",
          "@radix-ui/react-aspect-ratio": "^1.0.3",
          "@radix-ui/react-context-menu": "^2.1.5",
          "@radix-ui/react-toggle-group": "^1.0.4",
          
          // Forms & Validation
          "react-hook-form": "^7.48.2",
          "@hookform/resolvers": "^3.3.2",
          
          // Charts & Visualization
          "recharts": "^2.8.0",
          
          // Animation & Themes
          "motion": "^1.0.0",
          "next-themes": "^0.2.1",
          
          // Date Utilities
          "date-fns": "^2.30.0",
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
          plugins: [
            {
              name: 'next'
            }
          ],
          paths: {
            '@/*': ['./*']
          }
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
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

    // Add app/layout.tsx
    files.push({
      file: 'app/layout.tsx',
      data: `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${componentName} - Generated by v0',
  description: 'Generated component using v0 AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
    });

    // Add app/page.tsx
    files.push({
      file: 'app/page.tsx',
      data: `import ${componentName} from '@/components/${componentName}'

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-6 flex flex-col justify-center sm:py-12">
      <div className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20">
        <div className="w-full max-w-4xl">
          <${componentName} />
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Generated using v0
        </p>
      </div>
    </main>
  )
}`
    });

    // Add app/globals.css with enhanced CSS variables
    files.push({
      file: 'app/globals.css',
      data: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

* {
  border-color: hsl(var(--border));
}

body {
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}`
    });

    // Update tailwind.config.js with proper shadcn theme
    files.push({
      file: 'tailwind.config.js',
      data: `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}`
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

    // ADD SHADCN COMPONENTS HERE
    addCommonShadcnComponents(files);

    // Add the generated component
    files.push({
      file: `components/${componentName}.tsx`,
      data: code,
    });
  } else {
    // React framework setup (simplified)
    files.push({
      file: 'package.json',
      data: JSON.stringify({
        name: projectName,
        version: '0.1.0',
        private: true,
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'react-scripts': '5.0.1',
          typescript: '^5.1.6',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
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