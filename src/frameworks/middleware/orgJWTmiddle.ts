import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export interface CustomJwtRequest extends Request {
  user?: { id: string; [key: string]: any }; 
}

export const authenticateJWT = (req: CustomJwtRequest, res: Response, next: NextFunction): void => {
  console.log('authenticate jwt reached')
  const authHeader = req.headers.authorization;
  // console.log(req.body, 'req.body in jwt')
  // console.log('Authorization header:', authHeader);
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log(token, 'token in jwt src/frameworks/middleware/orgJWTmiddle.ts')  
    // console.log(JWT_SECRET, 'to compare src/frameworks/middleware/orgJWTmiddle.ts')

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
