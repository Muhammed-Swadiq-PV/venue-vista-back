import { Request, Response, NextFunction } from 'express';
import { UserUseCases } from '../../../usecases/UserUseCases';
import dotenv from 'dotenv';
import { EventHallWithOrganizerDetails } from '../../../interfaces/eventHallwithOrganizer';
//jwt token related 
import { generateUserAccessToken } from '../../../utils/tokenUtils';
import { generateUserRefreshToken } from '../../../utils/tokenUtils';
import { saveRefreshToken } from '../../../usecases/RefreshTokenUseCases';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export class UserController {
  private userUseCases: UserUseCases;

  constructor(userUseCases: UserUseCases) {
    this.userUseCases = userUseCases;
  }

  // Signup
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

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

      if (!user || !user.id) {
        throw new Error('user not found');
      }

      const accessToken = generateUserAccessToken(user, JWT_SECRET as string);
      const refreshToken = generateUserRefreshToken(user, REFRESH_TOKEN_SECRET as string);

      await saveRefreshToken(user.id, refreshToken, 'user');

      res.status(201).json({ message: 'Signed up successfully with Google!', user, accessToken, refreshToken });
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

      res.status(200).json({ message: 'User verified successfully', user, });
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

      const { email, password } = req.body;

      const user = await this.userUseCases.signInUser(email, password);

      if (!user || !user.id) {
        throw new Error('user not found');
      }

      const accessToken = generateUserAccessToken(user, JWT_SECRET as string);
      const refreshToken = generateUserRefreshToken(user, REFRESH_TOKEN_SECRET as string);

      await saveRefreshToken(user.id, refreshToken, 'user');

      res.status(200).json({ user, accessToken, refreshToken });
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
      const user = await this.userUseCases.signInGoogle(email);

      if (!user || !user.id) {
        throw new Error('user not found');
      }

      const accessToken = generateUserAccessToken(user, JWT_SECRET as string);
      const refreshToken = generateUserRefreshToken(user, REFRESH_TOKEN_SECRET as string);

      await saveRefreshToken(user.id, refreshToken, 'user');

      res.status(200).json({ user, accessToken, refreshToken });
    } catch (error: any) {
      console.error('Error signing in user:', error.message);
      if (error.message === 'User not found' || error.message === 'User not verified' || error.message === 'User not signed up with Google auth') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to sign in' });
      }
    }
  };

  mainEventHallDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 5;

      const { details, totalPages } = await this.userUseCases.fetchHallWithOrganizerDetails(page, limit);
      // console.log(totalPages, 'totalpages')

      if (!details || details.eventHalls.length === 0) {
        res.status(404).json({ message: 'Event hall details not found' });
        return;
      }

      res.status(200).json({ details, totalPages });
    } catch (error: any) {
      console.error('Error fetching hall details:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };



  singleHallDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hallId = req.params.id;
      const details = await this.userUseCases.fetchHallWithOrganizerWithId(hallId);

      if (!details) {
        res.status(404).json({ message: 'Event hall details not found' });
        return;
      }

      res.status(200).json(details);
    } catch (error) {
      console.error('Error fetching hall details:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;
      const details = await this.userUseCases.getProfile(userId);

      if (!details) {
        res.status(404).json({ message: 'user profile details not found' });
      }

      res.status(200).json(details);

    } catch (error) {
      console.error('Error fetching user details');
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async postProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const profileData = req.body; // This will contain address, city, pin, district, mobileNumber, etc.

      const updatedUser = await this.userUseCases.updateUserProfile(userId, profileData);

      if (updatedUser) {
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      next(error);
    }
  }

}
