import { OrgEntity } from '../../entity/models/OrgEntity';
import { OrgRepository } from '../../entity/repository/orgRepository';
import { OrgPostEntity } from '../../entity/models/OrgPostEntity';
import { OrgPostDocument } from '../../entity/models/OrgPostDocument';
import OrgPostModel from '../../entity/models/OrgPostModel';
import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';

import { EventHallWithOrganizerDetails } from '../../interfaces/eventHallwithOrganizer';


const organizerSchema: Schema<OrgEntity & Document> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  isGoogle: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  eventHallName: { type: String },
  phoneNumber: { type: String },
  district: { type: String },
  city: { type: String },
  buildingFloor: { type: String },
  pincode: { type: String },
  ownerIdCardUrl: { type: Schema.Types.Mixed },
  eventHallLicenseUrl: { type: Schema.Types.Mixed },
  isProfileVerified: { type: Boolean, default: false },
  isProfileUpdated: { type: Boolean, default: false }
});


const OrgModel: Model<OrgEntity & Document> = mongoose.model('Organizer', organizerSchema);

export class MongoDBOrgRepository implements OrgRepository {

  private orgModel: Model<OrgEntity & Document>;
  private postModel: Model<OrgPostDocument>;


  constructor(postModel: Model<OrgPostDocument>) {
    this.orgModel = OrgModel; // Use the defined model
    this.postModel = postModel;
  }

  
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

  async findOrganizerById(id: string): Promise<OrgEntity | null> {
    return await OrgModel.findById(id).exec();
  }

  async updateOrganizerByEmail(email: string, profileData: Partial<OrgEntity>): Promise<OrgEntity | null> {
    try {
      const result = await OrgModel.findOneAndUpdate({ email }, profileData, { new: true }).exec();
      if (!result) {
        throw new Error('Document not found or not updated');
      }
      return result as OrgEntity;
    } catch (error: any) {
      console.error('Update failed:', error.message);
      throw new Error('Failed to update organizer');
    }
  
  }

  async updateProfile(id: string, profileData: Partial<OrgEntity>): Promise<void> {
    try{
      // console.log(id, profileData, 'inside mongodborg repository when updating profile');
      const result = await OrgModel.findByIdAndUpdate(id, profileData, { new: true }).exec();
      if (!result) {
        throw new Error('Document not found or not updated');
    }
    // console.log('Update successful:', result);
    } catch(error: any){
      console.error('Update failed:', error);
    }
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const organizer = await this.findOrganizerByEmail(email);
    if (!organizer || !organizer.password) {
      return false;
    }
    return await bcryptjs.compare(password, organizer.password);
  }

  async updateOrganizer(organizer: Partial<OrgEntity> & { _doc?: any }): Promise<OrgEntity> {
    try {
      console.log('Updating organizer:', JSON.stringify(organizer, null, 2));
  
      // Extract the _id from _doc if it exists, otherwise use the id property
      const organizerId = organizer._doc?._id || organizer.id;
  
      if (!organizerId) {
        throw new Error('Organizer ID is missing');
      }
  
      // Create an update object with only the new fields
      const updateFields = {
        eventHallName: organizer.eventHallName,
        phoneNumber: organizer.phoneNumber,
        district: organizer.district,
        city: organizer.city,
        buildingFloor: organizer.buildingFloor,
        pincode: organizer.pincode,
        ownerIdCardUrl: organizer.ownerIdCardUrl,
        eventHallLicenseUrl: organizer.eventHallLicenseUrl,
        isProfileUpdated: false,
      };

      // console.log(updateFields, 'updatefields in mongodborgrepository')
  
      // Use findOneAndUpdate to update the document
      const result = await OrgModel.findOneAndUpdate(
        { _id: organizerId },
        { $set: updateFields },
        { new: true, runValidators: true }
      ).exec();
  
      if (!result) {
        throw new Error('Profile not found or not updated');
      }
  
      // console.log('Updated organizer:', JSON.stringify(result.toObject(), null, 2));
      return result.toObject();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }


  // get all organizers to show for admin
  async getAllOrganizers(): Promise<OrgEntity[]> {
    try {
      const users = await OrgModel.find().exec();
      return users.map(user => user.toObject());
      
    } catch (error) {
      throw new Error('Failed to fetch organizer');
    }
  }

  async manageOrganizer(id: string, updateData: Partial<OrgEntity> ): Promise<OrgEntity | null> {
    try {
      const userId = new ObjectId(id);
      const organizer = await OrgModel.findById(userId).exec();
      // console.log(organizer , 'organizer before blocking');

      if(!organizer){
        throw new Error ('organizer not found');
      }

      const newIsBlocked = updateData.isBlocked !== undefined ? updateData.isBlocked : organizer.isBlocked;

      const updateObject: Partial<OrgEntity> = {
        isBlocked: newIsBlocked, // Ensure isBlocked is set explicitly
      };

      const result = await OrgModel.findOneAndUpdate(
        { _id: userId },
        { $set: updateObject },
        { new: true }
      ).exec();

      return result ? result.toObject() : null;
    } catch (error) {
      throw new Error('Failed to update user');
    }
  }

  async createPost(post: OrgPostEntity): Promise<OrgPostEntity> {
    const newPost = new OrgPostModel(post);
    const savedPost = await newPost.save();
    return savedPost.toObject();
  }

  async getHallWithOrganizerDetails(): Promise<EventHallWithOrganizerDetails | null> {
    try {
        console.log('Request coming here');
        
        const result = await OrgPostModel.aggregate([
            {
                $lookup: {
                    from: 'organizers',
                    localField: 'organizerId',
                    foreignField: '_id',
                    as: 'organizerDetails'
                }
            },
            {
                $unwind: {
                    path: '$organizerDetails',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    _id: 1,
                    organizerId: 1,
                    main: 1,
                    parking: 1,
                    indoor: 1,
                    stage: 1,
                    dining: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'organizerDetails._id': 1,
                    'organizerDetails.name': 1,
                    'organizerDetails.email': 1,
                    'organizerDetails.phoneNumber': 1,
                    'organizerDetails.buildingFloor': 1,
                    'organizerDetails.city': 1,
                    'organizerDetails.district': 1
                }
            }
        ]).exec();

        if (result.length === 0) {
            console.log('No data found');
            return null;
        }

        const eventHallsWithOrganizerDetails: EventHallWithOrganizerDetails = {
            eventHalls: result.map(item => ({
                _id: item._id,
                organizerId: item.organizerId,
                main: item.main,
                parking: item.parking,
                indoor: item.indoor,
                stage: item.stage,
                dining: item.dining,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            })),
            organizers: result.map(item => ({
                _id: item.organizerDetails._id,
                name: item.organizerDetails.name,
                email: item.organizerDetails.email,
                phoneNumber: item.organizerDetails.phoneNumber,
                buildingFloor: item.organizerDetails.buildingFloor,
                city: item.organizerDetails.city,
                district: item.organizerDetails.district
            }))
        };

        return eventHallsWithOrganizerDetails;
    } catch (error) {
        console.error('Error fetching main event halls with organizer details:', error);
        throw new Error('Failed to fetch main event halls with organizer details');
    }
}
}


