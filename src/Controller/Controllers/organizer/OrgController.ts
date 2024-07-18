import { Request, Response, NextFunction } from 'express';
import { OrgUseCases } from '../../../usecases/OrgUseCases';
import { OrgEntity } from '../../../entity/models/OrgEntity';

export class OrgController {
  private orgUseCases: OrgUseCases

  constructor(orgUseCases: OrgUseCases){
    this.orgUseCases = orgUseCases;
  }

  
  // Signup
  createOrganizer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // console.log('Received signup request:', req.body);

      const { name, email, password } = req.body;
      const user = await this.orgUseCases.createOrganizer({ name, email, password });

      console.log('organizer created successfully org controller:', user);

      res.status(201).json({ message: 'OTP sent to your email. Please verify.', user });
    } catch (error: any) {
      console.error('Error creating organizer:', error.message);
      if (error.message === 'Email already exists') {
        res.status(400).json({ error: error.message });
      } else if (error.message === 'organizer already exists but is not verified. OTP has been sent.') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create organizer' });
      }
    }
  };

    // Verify OTP
    verifyOrganizer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { email, otp } = req.body;
        const organizer = await this.orgUseCases.verifyOrganizer(email, otp);
  
        res.status(200).json({ message: 'User verified successfully', organizer });
      } catch (error: any) {
        console.error('Error verifying user:', error.message);
        if (error.message === 'User not found' || error.message === 'Invalid OTP') {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to verify user' });
        }
      }
    };

    
    //google auth sign up
    createGoogleOrganizer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  
        const organizer = await this.orgUseCases.createGoogleOrganizer({ email, name, password });
  
        console.log('Organizer created successfully with Google:', organizer);
  
        res.status(201).json({ message: 'Signed up successfully with Google!', organizer });
      } catch (error: any) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ error: 'Failed to sign up with Google. Please try again.' });
      }
    };

    
     // Sign In
     signInOrganizer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // console.log('Received sign-in request:', req.body);

      const { email, password } = req.body;

      const user = await this.orgUseCases.signInOrganizer(email, password);
      // console.log('User signed in successfully:', user);

      res.status(200).json(user);
    } catch (error: any) {
      console.error('Error signing in user:', error.message);
      if (error.message === 'Organizer not found' || error.message === 'Invalid password' || error.message === 'Organizer not verified') {
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
      const organizer = await this.orgUseCases.signInGoogle(email);
      res.status(200).json(organizer);
    } catch (error: any) {
      console.error('Error signing in organizer:', error.message);
      if (error.message === 'Organizer not found' || error.message === 'Organizer not verified' || error.message === 'Organizer not signed up with Google auth') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to sign in' });
      }
    }
  };
}
