import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export interface CustomJwtRequest extends Request {
  user?: { id: string; [key: string]: any };
}

export const authenticateJWT = async (req: CustomJwtRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('authenticate jwt reached');
  
  // Retrieve the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    console.log('Token received:', token);

    try {
      // Verify the token
      const user = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = user as { id: string };
      next();
    } catch (err) {
      console.error('JWT verification error:', err);
      res.sendStatus(403); // Forbidden
    }
  } else {
    console.log('No token found or invalid header format');
    res.sendStatus(401); // Unauthorized
  }
};
