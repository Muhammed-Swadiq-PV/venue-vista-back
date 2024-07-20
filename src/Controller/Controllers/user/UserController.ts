import { Request, Response, NextFunction } from 'express';
import { UserUseCases } from '../../../usecases/UserUseCases';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export class UserController {
  private userUseCases: UserUseCases;

  constructor(userUseCases: UserUseCases) {
    this.userUseCases = userUseCases;
  }

  // Signup
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // console.log('Received signup request:', req.body);

      const { name, email, password } = req.body;
      const user = await this.userUseCases.createUser({ name, email, password });

      console.log('User created successfully:', user);

      res.status(201).json({ message: 'OTP sent to your email. Please verify.', user });
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      if (error.message === 'Email already exists') {
        res.status(400).json({ error: error.message });
      } else if (error.message === 'User already exists but is not verified. OTP has been sent.') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  };


   //create user with google auth
  createGoogleUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, name } = req.body;
      console.log(email, name, 'request body google controller data');

      if (!email || !name) {
        throw new Error('Email or name not provided');
      }

      // Fetch password from environment variables
      const password = process.env.GOOGLE_CLIENT_PASSWORD;

      if (!password) {
        throw new Error('Google client password not set');
      }

      const user = await this.userUseCases.createGoogleUser({ email, name, password });

      // console.log('User created successfully with Google:', user);

       // Generate JWT token for normal signed up user after verifying otp
       const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, isBlocked: user.isBlocked },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      res.status(201).json({ message: 'Signed up successfully with Google!', user, token});
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ error: 'Failed to sign up with Google. Please try again.' });
    }
  };

  // Resend OTP
  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(req.body)
      console.log('entering inside resend otp')
      const { email } = req.body;
      console.log(email, 'usercontrollerile resend otp email')

      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email');
      }
      await this.userUseCases.resendOtp(email);

      res.status(200).json({ message: 'OTP resent to your email' });
    } catch (error: any) {
      console.error('Error resending OTP:', error.message);
      if (error.message === 'User not found' || error.message === 'User is already verified') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to resend OTP' });
      }
    }
  };

  // Verify OTP
  verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const user = await this.userUseCases.verifyUser(email, otp);

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, isBlocked: user.isBlocked },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      res.status(200).json({ message: 'User verified successfully', user , token });
    } catch (error: any) {
      console.error('Error verifying user:', error.message);
      if (error.message === 'User not found' || error.message === 'Invalid OTP') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to verify user' });
      }
    }
  };

  // Sign In
  signInUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // console.log('Received sign-in request:', req.body);

      const { email, password } = req.body;

      const user = await this.userUseCases.signInUser(email, password);
      // console.log('User signed in successfully:', user);

      if(!user){
        throw new Error('user not found');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, isBlocked: user.isBlocked },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      res.status(200).json({user , token});
    } catch (error: any) {
      console.error('Error signing in user:', error.message);
      if (error.message === 'User not found' || error.message === 'Invalid password' || error.message === 'User not verified') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to sign in' });
      }
    }
  };

  signInGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      console.log(email, "email in sign in google")
      const user = await this.userUseCases.signInGoogle(email);

      if(!user){
        throw new Error('user not found');
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, isBlocked: user.isBlocked },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      res.status(200).json({user , token});
    } catch (error: any) {
      console.error('Error signing in user:', error.message);
      if (error.message === 'User not found' || error.message === 'User not verified' || error.message === 'User not signed up with Google auth') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to sign in' });
      }
    }
  };
  
}
