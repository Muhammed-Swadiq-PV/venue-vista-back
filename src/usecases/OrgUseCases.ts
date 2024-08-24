import { OrgRepository } from '../entity/repository/orgRepository';
import { OrgEntity } from '../entity/models/OrgEntity';
import { OrgPostEntity } from '../entity/models/OrgPostEntity';
import { generateOTP, sendOtpEmail } from '../utils/otpGenerator';
import { GetPresignedUrlUseCase } from './GetPresignedUrlUseCases';
import  mongoose, { Types}from 'mongoose';
import { EventHallWithOrganizerDetails } from '../interfaces/eventHallwithOrganizer';
import { EventHallWithOrganizerId } from '../interfaces/eventHallWithOrganizerId';

export class OrgUseCases {
  private orgRepository: OrgRepository;
  constructor(orgRepository: OrgRepository) {
    this.orgRepository = orgRepository;
  }

  async createOrganizer(organizer: OrgEntity): Promise<OrgEntity> {

    const existingOrganizer = await this.orgRepository.findOrganizerByEmail(organizer.email);

    if (existingOrganizer && existingOrganizer.isVerified) {
      throw new Error('Email already exists');
    }

    if (existingOrganizer && !existingOrganizer.isVerified) {
      const otp = generateOTP();
      existingOrganizer.otp = otp;
      await this.orgRepository.updateOrganizer(existingOrganizer);
      await sendOtpEmail(existingOrganizer.name, existingOrganizer.email, otp);
      throw new Error('Organizer already exists but is not verified. OTP has been sent.');
    }

    const otp = generateOTP();
    organizer.otp = otp;
    organizer.isVerified = false;
    organizer.isGoogle = false;

    const newOrganizer = await this.orgRepository.createOrganizer(organizer);
    await sendOtpEmail(newOrganizer.name, newOrganizer.email, otp);

    return newOrganizer;
  }

  async verifyOrganizer(email: string, otp: string): Promise<OrgEntity> {
    const organizer = await this.orgRepository.findOrganizerByEmail(email);
    if (!organizer) {
      throw new Error('User not found');
    }

    if (organizer.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    organizer.isVerified = true;
    organizer.otp = undefined; // Clear OTP after successful verification

    const updatedOrganizer = await this.orgRepository.updateOrganizerByEmail(email, {
      isVerified: organizer.isVerified,
      otp: organizer.otp
    });

    if (!updatedOrganizer) {
      throw new Error('Failed to update organizer');
    }

    return updatedOrganizer;
  }

  async createGoogleOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
    organizer.isVerified = true;
    organizer.isGoogle = true;

    return this.orgRepository.createOrganizer(organizer);
  }

  async signInOrganizer(email: string, password: string): Promise<OrgEntity | null> {
    const organizer = await this.orgRepository.findOrganizerByEmail(email);
    if (!organizer) {
      throw new Error('Organizer not found');
    }

    if (!organizer.isVerified) {
      throw new Error('Organizer not verified');
    }

    const isPasswordValid = await this.orgRepository.validatePassword(email, password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    //making otp and password empty strings in jwt
    if (organizer) {
      organizer.password = '';
      organizer.otp = '';
    }
    return organizer;
  }

  async signInGoogle(email: string): Promise<OrgEntity | null> {
    const organizer = await this.orgRepository.findOrganizerByEmail(email);
    if (!organizer) {
      throw new Error('Organizer not found');
    }
    if (!organizer.isVerified) {
      throw new Error('Organizer not verified');
    }
    if (!organizer.isGoogle) {
      throw new Error('Organizer not signed up with Google auth');
    }
    return organizer;
  }


  async updateProfile(userId: string, profileData: Partial<OrgEntity>): Promise<OrgEntity> {

    const existingOrganizer = await this.orgRepository.findOrganizerById(userId);
    if (!existingOrganizer) {
      throw new Error('Organizer not found');
    }

    const updatedOrganizer = {
      ...existingOrganizer,
      ...profileData,
    };

    const savedOrganizer = await this.orgRepository.updateOrganizer(updatedOrganizer);

    return savedOrganizer;
  }


  async saveLocation(organizerId: string, location: { lat: number; lng: number }): Promise<OrgEntity | null> {
    const existingOrganizer = await this.orgRepository.findProfileById(organizerId);
    
    if (!existingOrganizer) {
      throw new Error('Organizer not found');
    }

    const updatedOrganizer = await this.orgRepository.updateLocation(organizerId, location);
    
    return updatedOrganizer;
  }

  
  async viewProfile(organizerId: string): Promise<OrgEntity | null> {
    const organizerProfile = await this.orgRepository.findProfileById(organizerId);
    return organizerProfile;
  }

  //generating presigned url for s3 bucket

  async getPresignedUrl(fileName: string, fileType: string, operation: 'upload' | 'download', expiresIn?: number): Promise<string> {
    const getPresignedUrlUseCase = new GetPresignedUrlUseCase();
    return getPresignedUrlUseCase.execute(fileName, fileType, operation, expiresIn);
  }

  async createPost(userId: string, postData: Partial<OrgPostEntity>): Promise<OrgPostEntity> {
    const existingOrganizer = await this.orgRepository.findOrganizerById(userId);
    if (!existingOrganizer) {
      throw new Error('Organizer not found');
    }

    const organizerId = new mongoose.Types.ObjectId(userId);

    const newPost: OrgPostEntity = {
      ...postData,
      organizerId: organizerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...postData,
    };

    // Remove any undefined properties
    Object.keys(newPost).forEach(key => {
      if (newPost[key as keyof OrgPostEntity] === undefined) {
        delete newPost[key as keyof OrgPostEntity];
      }
    });

    return await this.orgRepository.createPost(newPost);

  }

  async checkPostData(organizerId: string): Promise<boolean> {
    const post = await this.orgRepository.findOrganizerbyPost(organizerId);
    const result = post && post.main && post.parking && post.indoor && post.stage && post.dining ? true : false;
    return result;
  }

  async getCompletePostDetails(organizerId: string): Promise<EventHallWithOrganizerId | null> {
    return await this.orgRepository.getHallWithOrganizerDetailsId(organizerId);
  }

  async updatePostDetails(organizerId: string, section: string, data: any): Promise<any> {
    if (!organizerId || !section || !data) {
      throw new Error('Invalid input parameters');
    }

    const result = await this.orgRepository.updatePostDetails(organizerId, section, data);

    return result;
  }

  async createRulesAndRestrictions(rules: string, organizerId:string): Promise<OrgEntity | null> {
    try {
      const  orgObjectId = new Types.ObjectId(organizerId);
      console.log(orgObjectId, 'orgObjectId')
      const existingOrganizer = await this.orgRepository.findById(orgObjectId);

      if (!existingOrganizer) {
        console.log('Organizer not found');
        return null;
      }
      return await this.orgRepository.saveRulesAndRestrictions({rules, organizerId: orgObjectId});
    } catch (error) {
      console.error('Invalid ObjectId:', error);
      return null; 
    }
  }

  async cancellationPolicy(policy: string, organizerId: string): Promise<OrgEntity | null> {
    try {
      const orgObjectId = new Types.ObjectId(organizerId);
      const existingOrganizer = await this.orgRepository.findById(orgObjectId);

      if(!existingOrganizer){
        console.log('organizer not found');
        return null;
      }
      return await this.orgRepository.cancellationPolicy({ policy, organizerId:orgObjectId})
    } catch (error) {
      return null;
    }
  }

}
