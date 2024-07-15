import { Request, Response, NextFunction } from 'express';
import { UserUseCases } from '../../../usecases/UserUseCases';

export class UserController {
  private userUseCases: UserUseCases;

  constructor(userUseCases: UserUseCases) {
    this.userUseCases = userUseCases;
  }

  // Signup
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Received signup request:', req.body);

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

  // Verify OTP
  verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const user = await this.userUseCases.verifyUser(email, otp);

      res.status(200).json({ message: 'User verified successfully', user });
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
      console.log('Received sign-in request:', req.body);

      const { email, password } = req.body;

      const user = await this.userUseCases.signInUser(email, password);
      console.log('User signed in successfully:', user);

      res.status(200).json(user);
    } catch (error: any) {
      console.error('Error signing in user:', error.message);
      if (error.message === 'User not found' || error.message === 'Invalid password' || error.message === 'User not verified') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to sign in' });
      }
    }
  };
}
