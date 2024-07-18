import { OrgEntity } from '../../entity/models/OrgEntity';
import { OrgRepository } from '../../entity/repository/orgRepository';
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';

const organizerSchema: Schema<OrgEntity & Document> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  isGoogle: { type: Boolean, default: false }
});

const OrgModel: Model<OrgEntity & Document> = mongoose.model('Organizer', organizerSchema);

export class MongoDBOrgRepository implements OrgRepository {
  async createOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
    let newOrganizer: OrgEntity;

    if (organizer.isGoogle) {

      if (!organizer.password) {
        throw new Error('Password is required for Google authenticated organizers');
      }
      const hashedPassword = await bcryptjs.hash(organizer.password, 10); 
      newOrganizer = {
        name: organizer.name,
        email: organizer.email,
        password: hashedPassword,
        isVerified: true,
        isGoogle: true,
      };
    } else {
      if (!organizer.password) {
        throw new Error('Password is required');
      }

      const hashedPassword = await bcryptjs.hash(organizer.password, 10);

      newOrganizer = {
        name: organizer.name,
        email: organizer.email,
        password: hashedPassword,
        otp: organizer.otp,
        isVerified: organizer.isVerified || false,
        isGoogle: organizer.isGoogle || false,
      };
    }

    const savedOrganizer = await this.saveOrganizer(newOrganizer);

    return savedOrganizer;
  }

  async saveOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
    const organizerModel = new OrgModel(organizer);
    const savedOrganizer = await organizerModel.save();
    return savedOrganizer.toObject();
  }

  async findOrganizerByEmail(email: string): Promise<OrgEntity | null> {
    return await OrgModel.findOne({ email }).exec();
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const organizer = await this.findOrganizerByEmail(email);
    if (!organizer || !organizer.password) {
      return false;
    }
    return await bcryptjs.compare(password, organizer.password);
  }

  async updateOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
    const updatedOrganizer = await OrgModel.findOneAndUpdate(
      { email: organizer.email },
      {
        name: organizer.name,
        email: organizer.email,
        password: organizer.password,
        otp: organizer.otp,
        isVerified: organizer.isVerified,
      },
      { new: true }
    ).exec();

    if (!updatedOrganizer) {
      throw new Error('User not found');
    }

    return updatedOrganizer.toObject();
  }
}
