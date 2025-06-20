import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface CanvaUserJWT {
  sub: string; // User ID
  aud: string; // Client ID
  iss: string; // Issuer (Canva)
  exp: number; // Expiration time
  iat: number; // Issued at time
  scope?: string; // OAuth scopes
  team_id?: string; // Team ID if applicable
}

export interface AuthenticatedRequest extends NextApiRequest {
  user: CanvaUserJWT;
}

/**
 * Middleware to verify Canva User JWT tokens
 * This should be used to protect API routes that require authentication
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Missing or invalid authorization header. Expected: Bearer <token>'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT token
      const jwtSecret = process.env.CANVA_JWT_SECRET;
      if (!jwtSecret) {
        console.error('CANVA_JWT_SECRET environment variable is not set');
        return res.status(500).json({
          success: false,
          error: 'Server configuration error'
        });
      }

      // Verify and decode the JWT
      const decoded = jwt.verify(token, jwtSecret) as CanvaUserJWT;

      // Validate required JWT claims
      if (!decoded.sub || !decoded.aud || !decoded.iss) {
        return res.status(401).json({
          success: false,
          error: 'Invalid JWT: missing required claims'
        });
      }

      // Validate issuer is Canva
      if (decoded.iss !== 'canva.com') {
        return res.status(401).json({
          success: false,
          error: 'Invalid JWT: invalid issuer'
        });
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return res.status(401).json({
          success: false,
          error: 'JWT token has expired'
        });
      }

      // Attach user info to request
      (req as AuthenticatedRequest).user = decoded;

      // Call the protected handler
      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('JWT verification failed:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid JWT token'
        });
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          error: 'JWT token has expired'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  };
}

/**
 * Rate limiting middleware to prevent abuse
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      
      const clientData = requestCounts.get(clientId as string);
      
      if (!clientData || now > clientData.resetTime) {
        // Reset or initialize counter
        requestCounts.set(clientId as string, {
          count: 1,
          resetTime: now + windowMs
        });
      } else {
        // Increment counter
        clientData.count++;
        
        if (clientData.count > maxRequests) {
          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded. Please try again later.'
          });
        }
      }
      
      return handler(req, res);
    };
  };
}