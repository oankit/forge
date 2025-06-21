import * as express from "express";
import * as cors from "cors";
import { createBaseServer } from "../utils/backend/base_backend/create";
import { createImageRouter } from "./routers/image";
import { createGenerateRouter } from "./routers/generate";
import { createDeployRouter } from "./routers/deploy";

async function main() {
  console.log('[SERVER] Starting Canva AI Agent Challenge backend server...');
  const router = express.Router();

  // Middleware to parse JSON bodies. The limit is increased to handle the image data URLs.
  router.use(express.json({ limit: '15mb' }));
  console.log('[SERVER] JSON middleware configured with 15mb limit');


  /**
   * Configure CORS Policy for Canva App
   *
   * Cross-Origin Resource Sharing (CORS) configuration to allow requests
   * from the Canva app origin and local development.
   */
  const corsOptions = {
    origin: [
      process.env.CANVA_APP_ORIGIN || 'https://app-aagq4x67nj4.canva-apps.com',
      'http://localhost:8080', // Local frontend development
      'https://localhost:8080' // Local frontend development with HTTPS
    ],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  router.use(cors(corsOptions));
  console.log('[SERVER] CORS configured for origins:', corsOptions.origin);

  // Add request logging middleware
  router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  /**
   * Add root route handler
   */
  router.get('/', (req, res) => {
    res.json({ 
      message: 'Canva AI Agent Challenge - Backend Server',
      status: 'running',
      endpoints: {
        generate: '/api/generate',
        deploy: '/api/deploy',
        images: '/images'
      }
    });
  });

  /**
   * Add routes for image generation.
   */
  const imageRouter = createImageRouter();
  router.use(imageRouter);

  /**
   * Add API routes for code generation and deployment
   */
  const generateRouter = createGenerateRouter();
  const deployRouter = createDeployRouter();
  
  router.use('/api/generate', generateRouter);
  router.use('/api/deploy', deployRouter);

  const server = createBaseServer(router);
  console.log('[SERVER] Starting server on port:', process.env.CANVA_BACKEND_PORT || 'default');
  server.start(process.env.CANVA_BACKEND_PORT);
}

main();
