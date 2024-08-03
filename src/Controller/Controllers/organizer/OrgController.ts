import { Request, Response, NextFunction } from 'express';
import { OrgUseCases } from '../../../usecases/OrgUseCases';
import { OrgEntity } from '../../../entity/models/OrgEntity';
import { CustomRequestWithJwt } from '../../../interfaces/CustomRequestWithJwt';
import { CustomPostRequestWithJwt } from '../../types/orgPost';

import { generateOrgAccessToken } from '../../../utils/tokenUtils';
import { generateOrgRefreshToken } from '../../../utils/tokenUtils';
import { saveRefreshToken } from '../../../usecases/RefreshTokenUseCases';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// import { refreshToken } from 'firebase-admin/app';

dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export class OrgController {
  private orgUseCases: OrgUseCases

  constructor(orgUseCases: OrgUseCases) {
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

      if (!organizer || !organizer.id) {
        throw new Error('User not found');
      }

      const accessToken = generateOrgAccessToken(organizer, JWT_SECRET as string);
      const refreshToken = generateOrgRefreshToken(organizer, REFRESH_TOKEN_SECRET as string);

      await saveRefreshToken(organizer.id, refreshToken, 'organizer');

      res.status(200).json({ message: 'signed up successfully with!', organizer, accessToken, refreshToken });
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

      if (!email || !name) {
        throw new Error('Email or name not provided');
      }

      // Fetch password from environment variables
      const password = process.env.GOOGLE_CLIENT_PASSWORD;

      if (!password) {
        throw new Error('Google client password not set');
      }

      const organizer = await this.orgUseCases.createGoogleOrganizer({ email, name, password });

      // console.log('Organizer created successfully with Google:', organizer);
      if(!organizer || !organizer.id){
        console.log('not organizer');
        throw new Error('organizer not found');
      }


      const accessToken = generateOrgAccessToken(organizer, JWT_SECRET as string);
      const refreshToken = generateOrgRefreshToken(organizer, REFRESH_TOKEN_SECRET as string);

      await saveRefreshToken(organizer.id, refreshToken, 'organizer');

      res.status(200).json({ message: 'signed up successfully with Google!', organizer, accessToken, refreshToken });
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ error: 'Failed to sign up with Google. Please try again.' });
    }
  };


  // Sign In
  signInOrganizer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const { email, password } = req.body;

      const organizer = await this.orgUseCases.signInOrganizer(email, password);
      //generating jwt token for organizer who created account normally at signin
      if(!organizer || !organizer.id){
        throw new Error('organizer not found');
      }

      const accessToken = generateOrgAccessToken(organizer, JWT_SECRET as string);
      const refreshToken = generateOrgRefreshToken(organizer, REFRESH_TOKEN_SECRET as string);
      // console.log(refreshToken, 'refresh token in controller')
      await saveRefreshToken(organizer.id, refreshToken, 'organizer');

      res.status(200).json({ organizer, accessToken, refreshToken });
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
      const organizer = await this.orgUseCases.signInGoogle(email);

      if(!organizer || !organizer.id){
        throw new Error('organizer not found');
      }

      if (!organizer.isVerified) {
        throw new Error('Organizer not verified');
      }

      if (!organizer.isGoogle) {
        throw new Error('Organizer not signed up with Google auth');
      }

      const accessToken = generateOrgAccessToken(organizer, JWT_SECRET as string);
      const refreshToken = generateOrgRefreshToken(organizer, REFRESH_TOKEN_SECRET as string);

      // Save refresh token to database or memory
      await saveRefreshToken(organizer.id, refreshToken, 'organizer');

      res.status(200).json({ organizer, accessToken, refreshToken });
    } catch (error: any) {
      console.error('Error signing in organizer:', error.message);
      if (error.message === 'Organizer not found' || error.message === 'Organizer not verified' || error.message === 'Organizer not signed up with Google auth') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to sign in' });
      }
    }
  };


  async createProfile(req: CustomRequestWithJwt, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = req.user.id;

      const {
        eventHallName,
        phoneNumber,
        district,
        city,
        buildingFloor,
        pincode,
        ownerIdCardUrl,
        eventHallLicenseUrl
      } = req.body;

      const organizerData = {
        eventHallName,
        phoneNumber,
        district,
        city,
        buildingFloor,
        pincode,
        ownerIdCardUrl,
        eventHallLicenseUrl
      }
      // Pass userId and profile data to the use case
      const updatedOrganizer = await this.orgUseCases.updateProfile(userId, organizerData);
      res.status(201).json(updatedOrganizer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPresignedUrl(req: Request, res: Response): Promise<void> {
    const { fileName, fileType, operation, expiresIn } = req.query as {
      fileName: string;
      fileType: string;
      operation: 'upload' | 'download';
      expiresIn?: string;
    };

    // URL-decode fileType 
    const decodedFileType = decodeURIComponent(fileType);

    try {
      const url = await this.orgUseCases.getPresignedUrl(
        fileName,
        decodedFileType,
        operation,
        expiresIn ? parseInt(expiresIn) : undefined
      );
      res.status(200).json({ url });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
  }


  async createPost(req: CustomPostRequestWithJwt, res: Response): Promise<void> {
    try {

      if (!req.user || !req.user.id) {
        res.status(401).json({ error: 'unauthorized' });
        return;
      }

      const userId = req.user.id;

      const {
        main,
        parking,
        indoor,
        stage,
        dining
      } = req.body;

      const postData = {
        main,
        parking,
        indoor,
        stage,
        dining
      };

      const newPost = await this.orgUseCases.createPost(userId, postData);
      res.status(201).json(newPost);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

}