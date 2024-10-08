import { Request, Response, NextFunction } from 'express';
import { OrgUseCases } from '../../../usecases/OrgUseCases';
import { CustomRequestWithJwt } from '../../../interfaces/CustomRequestWithJwt';
import { CustomPostRequestWithJwt } from '../../types/orgPost';
import { isParkingSection, isIndoorSection, isDiningSection } from '../../../utils/typeGuards';
import { VenueSection, ParkingSection, IndoorSection, DiningSection } from '../../../entity/models/OrgPostEntity'
import { generateOrgAccessToken } from '../../../utils/tokenUtils';
import { generateOrgRefreshToken } from '../../../utils/tokenUtils';
import { saveRefreshToken } from '../../../usecases/RefreshTokenUseCases';
import dotenv from 'dotenv';

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

      const { name, email, password } = req.body;
      const user = await this.orgUseCases.createOrganizer({ name, email, password });

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

      res.status(200).json({ message: 'signed up successfully with!', organizerId: organizer.id, organizer, accessToken, refreshToken });
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
      if (!organizer || !organizer.id) {
        console.log('not organizer');
        throw new Error('organizer not found');
      }


      const accessToken = generateOrgAccessToken(organizer, JWT_SECRET as string);
      const refreshToken = generateOrgRefreshToken(organizer, REFRESH_TOKEN_SECRET as string);

      await saveRefreshToken(organizer.id, refreshToken, 'organizer');

      res.status(200).json({ message: 'signed up successfully with Google!', organizerId: organizer.id, organizer, accessToken, refreshToken });
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
      if (!organizer || !organizer.id) {
        throw new Error('organizer not found');
      }

      const accessToken = generateOrgAccessToken(organizer, JWT_SECRET as string);
      const refreshToken = generateOrgRefreshToken(organizer, REFRESH_TOKEN_SECRET as string);
      // console.log(refreshToken, 'refresh token in controller')
      await saveRefreshToken(organizer.id, refreshToken, 'organizer');

      res.status(200).json({
        organizerId: organizer.id,
        organizer,
        accessToken,
        refreshToken
      });
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

      if (!organizer || !organizer.id) {
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

      res.status(200).json({ organizerId: organizer.id, organizer, accessToken, refreshToken });
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
  };

  async saveLocation(req: Request, res: Response): Promise<void> {
    try {
      const { organizerId, lat, lng }: { organizerId: string; lat: number; lng: number } = req.body;

      if (typeof lat !== 'number' || typeof lng !== 'number' || !organizerId) {
        res.status(400).json({ error: 'Invalid location data' });
        return;
      }

      const location = { lat, lng };
      await this.orgUseCases.saveLocation(organizerId, location);
      res.status(200).json({ message: 'Location saved successfully!' });
    } catch (error) {
      console.error('Error saving location:', error);
      res.status(500).json({ error: 'Failed to save location. Please try again.' });
    }
  }



  async viewProfile(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = req.params.organizerId;
      const details = await this.orgUseCases.viewProfile(organizerId);

      if (!details) {
        res.status(400).json({ message: 'organizer profile not found' });
        return;
      }

      res.status(200).json(details);
    } catch (error) {
      console.error('Error fetching organizer data:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }


  async getPresignedUrl(req: Request, res: Response): Promise<void> {
    const { fileName, fileType, operation, expiresIn } = req.query as {
      fileName: string;
      fileType: string;
      operation: 'upload' | 'download';
      expiresIn?: string;
    };

    if (!fileName || !fileType || !operation) {
      res.status(400).json({ error: 'File name, file type, and operation must be provided' });
      return;
    }
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
  };



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

      // Validate sections
      const validatedParking: ParkingSection | undefined = isParkingSection(parking) ? parking : undefined;
      const validatedIndoor: IndoorSection | undefined = isIndoorSection(indoor) ? indoor : undefined;
      const validatedDining: DiningSection | undefined = isDiningSection(dining) ? dining : undefined;

      const postData = {
        main,
        parking: validatedParking,
        indoor: validatedIndoor,
        stage,
        dining: validatedDining
      };

      const newPost = await this.orgUseCases.createPost(userId, postData);
      res.status(201).json(newPost);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }


  async checkPostData(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = req.params.organizerId;
      const hasPost = await this.orgUseCases.checkPostData(organizerId);
      res.status(200).json({ hasPost })
    } catch (error: any) {
      console.error('Error checking post data', error);
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  // view post details getting 
  async viewPost(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = req.params.organizerId;
      const details = await this.orgUseCases.getCompletePostDetails(organizerId);
      // console.log(details, 'details in view post')

      if (!details) {
        res.status(400).json({ message: 'Organizer post details doesnt found ' });
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

  async editPost(req: Request, res: Response): Promise<void> {
    try {
      const { organizerId } = req.params;
      const { section, data } = req.body;

      const result = await this.orgUseCases.updatePostDetails(organizerId, section, data);

      // Send a response back
      res.status(200).json({ message: 'Update successful' });
    } catch (err) {
      console.error('Error updating event hall:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createRulesAndRestrictions(req: Request, res: Response): Promise<void> {
    try {
      const { rules, organizerId } = req.body;
      const result = await this.orgUseCases.createRulesAndRestrictions(rules, organizerId);
      res.status(200).json({ message: 'Rules and restrictions saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'error occured while saving rules and restrictions' });
    }
  }

  async cancellationPolicy(req: Request, res: Response): Promise<void> {
    try {
      const { policy, organizerId } = req.body;
      const result = await this.orgUseCases.cancellationPolicy(policy, organizerId);
      res.status(200).json({ message: 'Cancellation policy saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'error occured while saving cancellation policy' });
    }
  }

  async getCancellationPolicy(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = req.query.organizerId as string;
      const response = await this.orgUseCases.getCancellationPolicy(organizerId);
      if (response) {
        res.status(200).json({ policy: response.paymentPolicy });
      } else {
        res.status(404).json({ error: 'Organizer not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error occurred while getting cancellation policy' });
    }
  }

  async getRulesAndRestrictions(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = req.query.organizerId as string;
      const response = await this.orgUseCases.getCancellationPolicy(organizerId);

      if (response) {
        res.status(200).json({ rules: response.rulesAndRestrictions });
      } else {
        res.status(404).json({ error: 'Organizer not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error occured while getting rules and restrictions' });
    }
  }


  async addPriceBySelectDay(req: Request, res: Response): Promise<void> {
    try {
      const { date, organizerId, dayPrice, nightPrice, fullDayPrice }: { date: string; organizerId: string; dayPrice: number; nightPrice: number; fullDayPrice: number } = req.body;
      console.log('date:', date, 'organizerId:', organizerId, 'dayPrice:', dayPrice, 'nightPrice:', nightPrice, 'fulldayprice:', fullDayPrice);
      const dateObj = new Date(date);
      const result = await this.orgUseCases.addPriceBySelectDay(dateObj, organizerId, { dayPrice, nightPrice, fullDayPrice });
      res.status(200).json({ message: 'Price by day , night, fullday saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'error occured while saving day, night, fullday price' });
    }
  }

  async getPriceBySelectDay(req: Request, res: Response): Promise<void> {
    try {
      const { date, organizerId } = req.query;
      // console.log(date, organizerId)
      const dateObj = new Date(date as string);
      const result = await this.orgUseCases.getPriceBySelectDay(dateObj, organizerId as string);
      console.log(result)
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'error occured while getting the price of the day' });
    }
  }

  async getEventsDetails(req: Request, res: Response): Promise<void> {
    try {
      const { start, end, organizerId } = req.query;

      if (!start || !end || !organizerId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      const month = startDate.getMonth() + 1; // getMonth() returns 0-11, so we add 1
      const year = startDate.getFullYear();

      const result = await this.orgUseCases.getEventsDetails(
        startDate,
        endDate,
        month,
        year,
        organizerId as string
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'error occured while getting events booked details' })
    }
  }

  async createDefaultPrice(req: Request, res: Response): Promise<void> {
    try {
      const { organizerId, weeklyPrices } = req.body;

      // console.log(weeklyPrices, 'weekly prices')
      if (!organizerId || !weeklyPrices) {
        res.status(400).json({ error: 'missing required data' });
        return;
      }
      await this.orgUseCases.createDefaultPrice(organizerId, weeklyPrices)
      res.status(200).json({ message: 'Default weekly prices updated successfully' })
    } catch (error) {
      console.error('Error in createDefaultPrice:', error);
      res.status(500).json({ error: 'Failed to update weekly prices. Please try again.' });
    }
  }


}