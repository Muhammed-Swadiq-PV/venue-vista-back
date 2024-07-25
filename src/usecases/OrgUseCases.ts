import { OrgRepository } from '../entity/repository/orgRepository';
import { OrgEntity } from '../entity/models/OrgEntity';
import { generateOTP, sendOtpEmail } from '../utils/otpGenerator';

export class OrgUseCases {
  private orgRepository: OrgRepository;
  constructor(orgRepository: OrgRepository) {
    this.orgRepository = orgRepository;
  }

  async createOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
    
    const existingOrganizer = await this.orgRepository.findOrganizerByEmail(organizer.email);

    if(existingOrganizer && existingOrganizer.isVerified){
      throw new Error('Email already exists');
    }

    if(existingOrganizer && !existingOrganizer.isVerified){
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

  async signInOrganizer(email: string, password: string): Promise<OrgEntity| null> {
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
    // console.log('Inside updateProfile use case');
    // console.log('userId:', userId);
    // console.log('profileData:', profileData);
  
    const existingOrganizer = await this.orgRepository.findOrganizerById(userId);
    if (!existingOrganizer) {
      throw new Error('Organizer not found');
    }
  
    // console.log('Existing organizer:', existingOrganizer);
  
    const updatedOrganizer = {
      ...existingOrganizer,
      ...profileData,
    };
  
    // console.log('Updated organizer (before save):', updatedOrganizer);
  
    const savedOrganizer = await this.orgRepository.updateOrganizer(updatedOrganizer);
    // console.log('Saved organizer:', savedOrganizer);
  
    return savedOrganizer;
  }

}
