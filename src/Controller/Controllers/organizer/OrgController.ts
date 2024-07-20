import { Request, Response, NextFunction } from 'express';
import { OrgUseCases } from '../../../usecases/OrgUseCases';
import { OrgEntity } from '../../../entity/models/OrgEntity';
import { CustomRequest } from '../../types/orgProfille';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

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

        if (!organizer) {
          throw new Error('User not found');
        }

        // Generate JWT token for normal signed up organizer after verifying otp
      const token = jwt.sign(
        { id: organizer.id, email: organizer.email, name: organizer.name, isBlocked: organizer.isBlocked },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

        res.status(200).json({ message: 'User verified successfully', organizer , token});

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

         // Generate JWT token for directly google auth signup
        const token = jwt.sign(
          { id: organizer.id, email: organizer.email, name: organizer.name , isBlocked: organizer.isBlocked},
          JWT_SECRET,
          { expiresIn: '1h' } // Token expires in 1 hour
        );
  
        res.status(201).json({ message: 'Signed up successfully with Google!', organizer , token});
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

      const organizer = await this.orgUseCases.signInOrganizer(email, password);
      // console.log('User signed in successfully:', user);
      //generating jwt token for organizer who created account normally at signin
      if(!organizer){
        throw new Error("organizer not found");
      }
      const token = jwt.sign(
        { id: organizer.id, email: organizer.email, name: organizer.name , isBlocked: organizer.isBlocked},
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      res.status(200).json({organizer ,token});
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
      // console.log(email, "email in sign in google")
      const organizer = await this.orgUseCases.signInGoogle(email);

      if (!organizer) {
        throw new Error('Organizer not found');
      }

      if (!organizer.isVerified) {
        throw new Error('Organizer not verified');
      }

      if (!organizer.isGoogle) {
        throw new Error('Organizer not signed up with Google auth');
      }

      //generating jwt token for the organizer when google auth sign in
      const token = jwt.sign(
        { id: organizer.id, email: organizer.email, name: organizer.name , isBlocked: organizer.isBlocked},
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      res.status(200).json({organizer , token});
    } catch (error: any) {
      console.error('Error signing in organizer:', error.message);
      if (error.message === 'Organizer not found' || error.message === 'Organizer not verified' || error.message === 'Organizer not signed up with Google auth') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to sign in' });
      }
    }
  };

  createProfile = async(req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body, 'data from create organizer profile');
    
    // Type assertion to handle potential undefined value for images that passed from frontend for the ownerid and licence
    const files = req.files ;
    
    if (files) {
      // console.log('Files:', files); // Logs the uploaded files

      const ownerIdCard = files['ownerIdCard'] ? files['ownerIdCard'][0] : null;
      const eventHallLicense = files['eventHallLicense'] ? files['eventHallLicense'][0] : null;

      console.log('Owner ID Card:', ownerIdCard);
      console.log('Event Hall License:', eventHallLicense);
    } else {
      console.log('No files uploaded');
    }
  }
}
