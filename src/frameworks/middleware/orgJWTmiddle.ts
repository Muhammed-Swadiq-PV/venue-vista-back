import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export interface CustomJwtRequest extends Request {
  user?: { id: string; [key: string]: any }; 
}

export const authenticateJWT = (req: CustomJwtRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log(token, 'token in jwt')
    console.log(JWT_SECRET, 'to compare')

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user as { id: string }; 
      console.log('User from JWT:', req.user); 
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
