import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserModel from '../../entity/models/userModel'; 
import OrgModel from '../../entity/models/organizerModel';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export interface CustomJwtRequest extends Request {
  user?: { id: string; role: string; [key: string]: any };
}

export const authenticateJWT = async (req: CustomJwtRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('authenticate jwt reached');

  // Retrieve the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    try {
      // Verify the token
      const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
      console.log(decodedToken)
      
      // Ensure the token includes user information
      if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id || !decodedToken.role) {
        res.status(400).json({ message: 'Invalid token structure' });
        return;
      }

      req.user = { id: decodedToken.id, role: decodedToken.role };

      console.log('User role:', req.user.role);

      // Skip blocked status check for admins
      if (req.user.role === 'admin') {
        next(); // Call next middleware for admin
        return;
      }

      // Check the user's role and blocked status for organizer and user
      let userRecord: any;

      if (req.user.role === 'user') {
        userRecord = await UserModel.findById(req.user.id);
      } else if (req.user.role === 'organizer') {
        userRecord = await OrgModel.findById(req.user.id);
      } else {
        res.status(400).json({ message: 'Invalid user role' });
        return;
      }

      if (!userRecord) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (userRecord.isBlocked) {
        res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
        return;
      }

      next(); // Call next middleware
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        console.error('JWT verification error: Token expired');
        res.status(401).json({ message: 'Session expired. Please log in again.' });
        return;
      }

      console.error('JWT verification error:', err);
      res.status(403).json({ message: 'Invalid token or forbidden access.' });
      return;
    }
  } else {
    console.log('No token found or invalid header format');
    res.status(401).json({ message: 'No token provided or invalid header format.' });
    return;
  }
};
