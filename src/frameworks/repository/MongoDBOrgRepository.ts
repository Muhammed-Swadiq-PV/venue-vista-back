import { OrgEntity } from '../../entity/models/OrgEntity';
import { OrgRepository } from '../../entity/repository/orgRepository';
import { OrgPostEntity } from '../../entity/models/OrgPostEntity';
import { OrgPostDocument } from '../../entity/models/OrgPostDocument';
import OrgPostModel from '../../entity/models/OrgPostModel';
import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document, Model, Types, mongo } from 'mongoose';
import OrgModel from '../../entity/models/organizerModel';
import bcryptjs from 'bcryptjs';
import { EventHallDetails, OrganizerDetails, EventHallWithOrganizerDetails } from '../../interfaces/eventHallwithOrganizer';
import { EventHallWithOrganizerId } from '../../interfaces/eventHallWithOrganizerId';
import { EventHallAndOrganizerArray } from '../../interfaces/eventHallForSearch';
import { BookingWeeklyEntity, BookingPrices } from '../../interfaces/weeklyPrices';



export class MongoDBOrgRepository implements OrgRepository {

  private orgModel: Model<OrgEntity & Document>;
  private postModel: Model<OrgPostDocument>;
  private BookingModel: Model<BookingWeeklyEntity>


  constructor(
    orgModel: Model<OrgEntity & Document>,
    postModel: Model<OrgPostDocument>,
    BookingModel: Model<BookingWeeklyEntity>
  ) {
    this.orgModel = orgModel;
    this.postModel = postModel;
    this.BookingModel = BookingModel;
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
    try {
      const result = await OrgModel.findByIdAndUpdate(id, profileData, { new: true }).exec();
      if (!result) {
        throw new Error('Document not found or not updated');
      }
    } catch (error: any) {
      console.error('Update failed:', error);
    }
  }

  async updateLocation(organizerId: string, location: { lat: number; lng: number }): Promise<OrgEntity | null> {
    try {
      const updatedOrganizer = await OrgModel.findByIdAndUpdate(
        organizerId,
        // { $set: { location } },
        { $set: { location: { type: 'Point', coordinates: [location.lng, location.lat] } } },
        { new: true, runValidators: true }
      ).exec();

      if (!updatedOrganizer) {
        console.error('Organizer not found');
        return null;
      }

      // console.log('Updated organizer:', updatedOrganizer); 
      return updatedOrganizer;
    } catch (error) {
      console.error('Error updating organizer:', error);
      throw error;
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
        isProfileUpdated: true,
      };


      // Use findOneAndUpdate to update the document
      const result = await OrgModel.findOneAndUpdate(
        { _id: organizerId },
        { $set: updateFields },
        { new: true, runValidators: true }
      ).exec();

      if (!result) {
        throw new Error('Profile not found or not updated');
      }

      return result.toObject();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async findProfileById(organizerId: string): Promise<OrgEntity | null> {
    const organizerProfile = await this.orgModel.findOne({ _id: organizerId });
    return organizerProfile ? organizerProfile.toObject() : null;
  };

  async findById(organizerId: ObjectId): Promise<OrgEntity | null> {
    try {
      const organizerProfile = await this.orgModel.findById(organizerId).exec();
      return organizerProfile as OrgEntity | null;
    } catch (error) {
      console.error('Error finding organizer by ID:', error);
      return null;
    }
  }

  async fetchOrganizers(page: number, limit: number): Promise<{ organizers: OrgEntity[], totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const [organizers, totalCount] = await Promise.all([
        this.orgModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
        this.orgModel.countDocuments().exec()
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      return {
        organizers: organizers.map(user => user.toObject()),
        totalPages
      };
    } catch (error) {
      throw new Error('Failed to fetch organizers');
    }
  }

  async manageOrganizer(id: string, updateData: Partial<OrgEntity>): Promise<OrgEntity | null> {
    try {
      const userId = new ObjectId(id);
      const organizer = await OrgModel.findById(userId).exec();

      if (!organizer) {
        throw new Error('organizer not found');
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

  // getting details for admin notification 
  async getPendingOrganizers(): Promise<OrgEntity[]> {
    try {
      const organizers = await OrgModel.find({
        isProfileVerified: false,
        isProfileUpdated: true,
        isVerified: true
      }).exec();
      return organizers.map(organizer => organizer.toObject());
    } catch (error) {
      throw new Error('Failed to fetch pending organizers');
    }
  }


  async getPendingOrganizerWithId(id: string): Promise<OrgEntity | null> {
    try {
      const organizer = await OrgModel.findById(id).exec();
      return organizer ? organizer.toObject() as OrgEntity : null;
    } catch (error: any) {
      throw new Error('Error fetching organizer from MongoDB: ' + error.message);
    }
  }

  async approveOrganizer(id: string): Promise<OrgEntity | null> {
    try {
      const organizer = await OrgModel.findById(id).exec();
      if (organizer) {
        organizer.isProfileVerified = true;
        organizer.isProfileApproved = true;

        await organizer.save();

        return organizer;
      }
      return null;
    } catch (error: any) {
      console.error('error updating organizer:', error);
      throw new Error('Error approving organizer:' + error.message);
    }
  }


  async disApproveOrganizer(id: string): Promise<OrgEntity | null> {
    try {
      const organizer = await OrgModel.findById(id).exec();
      if (organizer) {
        organizer.isProfileVerified = true;
        organizer.isProfileApproved = false;

        await organizer.save();

        return organizer;
      }
      return null;

    } catch (error: any) {
      console.error('error updating organizer:', error);
      throw new Error('Error disapproving organizer:' + error.message);
    }
  }




  async createPost(post: OrgPostEntity): Promise<OrgPostEntity> {
    const newPost = new OrgPostModel(post);
    const savedPost = await newPost.save();
    return savedPost.toObject();
  }

  // organizer creating rules and restrictions to show to user
  async saveRulesAndRestrictions(data: { rules: string, organizerId: ObjectId }): Promise<OrgEntity | null> {
    try {
      const organizer = await OrgModel.findById(data.organizerId).exec();

      if (!organizer) {
        console.log('Organizer not found');
        return null;
      }
      organizer.rulesAndRestrictions = data.rules;

      const updatedOrganizer = await organizer.save();
      return updatedOrganizer as OrgEntity;
    } catch (error) {
      console.error('Error saving rules and restrictions:', error);
      throw error;
    }
  }

  async cancellationPolicy(data: { policy: string, organizerId: ObjectId }): Promise<OrgEntity | null> {
    try {
      const organizer = await OrgModel.findById(data.organizerId).exec();

      if (!organizer) {
        console.log('organizer not found');
        return null;
      }
      organizer.paymentPolicy = data.policy;

      const updatedOrganizer = await organizer.save();
      return updatedOrganizer as OrgEntity;
    } catch (error) {
      console.error('Error saving payment cancellation policy: ', error);
      throw error;
    }
  }

  async getOrganizerIdfrompostId(hallId: string): Promise<string | null> {
    const post = await OrgPostModel.findById(hallId).select('organizerId').lean();
    return post ? (post.organizerId as Types.ObjectId).toString() : null;
  }

  // user related get task 
  async getHallWithOrganizerDetails(page: number, limit: number): Promise<{ details: EventHallWithOrganizerDetails | null, totalPages: number }> {
    try {
      const skip = (page - 1) * limit;

      const [result, totalCount] = await Promise.all([
        OrgPostModel.aggregate([
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
            $match: {
              'organizerDetails.isProfileApproved': true
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
          },
          { $skip: skip },
          { $limit: limit }
        ]).exec(),
        OrgPostModel.countDocuments().exec()
      ]);

      if (result.length === 0) {
        console.log('No data found');
        return { details: null, totalPages: 0 };
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

      const totalPages = Math.ceil(totalCount / limit);
      return { details: eventHallsWithOrganizerDetails, totalPages };
    } catch (error) {
      console.error('Error fetching main event halls with organizer details:', error);
      throw new Error('Failed to fetch main event halls with organizer details');
    }
  }

  async findOrganizersByLocation(latitude: number, longitude: number): Promise<any> {
    try {

      const organizers = await OrgModel.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [longitude, latitude] },
            $maxDistance: 10000 // 10 km radius
          }
        }
      }).select('_id').exec();

      return organizers;
    } catch (error) {
      console.error('Error fetching organizers:', error);
      throw new Error('Failed to fetch organizers');
    }
  }


  async findOrganizerWithEventHallByName(name: string): Promise<EventHallAndOrganizerArray | null> {
    try {
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
          $match: {
            'organizerDetails.isProfileApproved': true,
            'organizerDetails.name': { $regex: name, $options: 'i' }
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

      // Map results into a 2D array format
      const eventHallAndOrganizerArray: EventHallAndOrganizerArray = result.map(item => [
        {
          _id: item._id,
          organizerId: item.organizerId,
          main: {
            images: item.main.images,
            description: item.main.description
          },
          parking: {
            images: item.parking.images,
            description: item.parking.description
          },
          indoor: {
            images: item.indoor.images,
            description: item.indoor.description
          },
          stage: {
            images: item.stage.images,
            description: item.stage.description
          },
          dining: {
            images: item.dining.images,
            description: item.dining.description
          },
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        },
        {
          _id: item.organizerDetails._id,
          name: item.organizerDetails.name,
          email: item.organizerDetails.email,
          phoneNumber: item.organizerDetails.phoneNumber,
          buildingFloor: item.organizerDetails.buildingFloor,
          city: item.organizerDetails.city,
          district: item.organizerDetails.district
        }
      ]);

      return eventHallAndOrganizerArray;
    } catch (error) {
      console.error('Error fetching organizer and event hall details:', error);
      throw new Error('Failed to fetch organizer and event hall details');
    }
  }


  async completeDetailsOfNearestOrganizers(hallId: string): Promise<EventHallWithOrganizerDetails | null> {
    try {
      const result = await OrgPostModel.aggregate([
        { $match: { organizerId: new mongoose.Types.ObjectId(hallId) } },
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
          $match: {
            'organizerDetails.isProfileApproved': true
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

      const eventHallWithOrganizerDetails: EventHallWithOrganizerDetails = {
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

      return eventHallWithOrganizerDetails;
    } catch (error) {
      console.error('Error fetching hall details:', error);
      throw new Error('Failed to fetch hall details');
    }
  }

  async getOrganizerName(postId: string): Promise<{ organizerId: string; organizerName: string } | null> {
    try {

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new Error('Invalid Post ID format');
      }

      const objectId = new mongoose.Types.ObjectId(postId);
      const post = await this.postModel.findById(objectId).select('organizerId').exec();

      if (!post) {
        console.log('Post not found');
        return null;
      }

      const { organizerId } = post;

      const organizer = await this.orgModel.findById(organizerId).select('name').exec();
      if (!organizer) {
        console.log('Organizer not found');
        return null;
      }

      return { organizerId: organizerId.toString(), organizerName: organizer.name };
    } catch (error) {
      console.error('Error fetching organizer name:', error);
      throw new Error('Failed to fetch organizer name');
    }
  }

  async getOrganizerNameAndRules(organizerId: string): Promise<{ organizerName: string; phoneNumber?: string; rulesAndRestrictions?: string; paymentPolicy?: string } | null> {
    try {
      const objectId = new mongoose.Types.ObjectId(organizerId);
      const organizer = await this.orgModel.findById(objectId).select('name phoneNumber rulesAndRestrictions paymentPolicy').exec();

      if (!organizer) {
        console.log('Organizer not found');
        return null;
      }

      return { 
         organizerName: organizer.name,
         phoneNumber: organizer.phoneNumber,
        rulesAndRestrictions: organizer.rulesAndRestrictions || '',
        paymentPolicy: organizer.paymentPolicy || ''
      }
    } catch (error) {
      console.error('Error fetching organizer name:', error);
      throw new Error('Failed to fetch organizer name');
    }
  }

  async getOrganizerDetails(postId: string): Promise<{ carParkingSpace: number; bikeParkingSpace: number; indoorSeatingCapacity: number; diningCapacity: number} | null > {
    try {
      const objectId = new mongoose.Types.ObjectId(postId);
      const details = await this.postModel.findById(objectId).select('parking indoor dining').exec();

      if(!details){
        return null;
      }
      return {
        carParkingSpace: details.parking?.carParkingSpace || 0,
        bikeParkingSpace: details.parking?.bikeParkingSpace || 0,
        indoorSeatingCapacity: details.indoor?.seatingCapacity || 0,
        diningCapacity: details.dining?.diningCapacity || 0,
      };
    } catch (error) {
      console.error('Error fetching organizer details:', error);
      throw new Error('Failed to fetch organizer details');
    }
  }


  async getHallWithOrganizerDetailsId(organizerId: string): Promise<EventHallWithOrganizerId | null> {
    try {
      const result = await OrgPostModel.aggregate([
        {
          $match: {
            organizerId: new mongoose.Types.ObjectId(organizerId)
          }
        },
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
          $match: {
            'organizerDetails.isProfileApproved': true
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
            carParkingSpace: 1,
            bikeParkingSpace: 1,
            diningCapacity: 1,
            seatingCapacity: 1,
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

      // console.log(result, ' result in repository');

      if (result.length === 0) {
        console.log('No data found');
        return null;
      }

      const eventHallsWithOrganizerDetails: EventHallWithOrganizerId = {
        eventHalls: result.map(item => ({
          _id: item._id,
          organizerId: item.organizerId,
          main: item.main,
          parking: item.parking,
          indoor: item.indoor,
          stage: item.stage,
          dining: item.dining,
          carParkingSpace: item.carParkingSpace,
          bikeParkingSpace: item.bikeParkingSpace,
          diningCapacity: item.diningCapacity,
          seatingCapacity: item.seatingCapacity,
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
      console.error('Error fetching event halls with organizer details:', error);
      throw new Error('Failed to fetch event halls with organizer details');
    }
  }



  async getPendingOrganizerDetailsWithId(hallId: string): Promise<EventHallWithOrganizerDetails | null> {
    try {
      const result = await OrgPostModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(hallId) }
        },
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
          $match: {
            'organizerDetails.isProfileApproved': true
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
      console.error('Error fetching hall details with organizer:', error);
      throw new Error('Failed to fetch hall details with organizer');
    }
  }


  async findOrganizerbyPost(organizerId: string): Promise<OrgPostEntity | null> {
    return OrgPostModel.findOne({ organizerId })
  }

  async updatePostDetails(organizerId: string, section: string, data: any): Promise<any> {
    try {
      // Find the document to update
      const post = await this.postModel.findOne({ organizerId });

      if (!post) {
        throw new Error('Post not found');
      }

      // Update the specific section of the post
      switch (section.toLowerCase()) {
        case 'dining':
          post.dining = { ...post.dining, ...data };
          break;

        case 'indoor':
          post.indoor = { ...post.indoor, ...data };
          break;

        case 'parking':
          post.parking = { ...post.parking, ...data };
          break;

        case 'stage':
          post.stage = { ...post.stage, ...data };
          break;

        default:
          throw new Error('Unknown section');
      }

      // Save the updated post
      await post.save();

      // Return the updated post
      return post;
    } catch (error) {
      console.error('Error updating post in repository:', error);
      throw new Error('Error updating post');
    }
  }

  async addPriceBySelectDay({ date, organizerId, prices }: {
    date: Date;
    organizerId: Types.ObjectId;
    prices: BookingPrices
  }): Promise<BookingWeeklyEntity | null> {
    try {
      const filter = {
        organizerId: organizerId,
        bookingDate: date,
      };

      const update = {
        $set: {
          organizerId: organizerId,
          bookingDate: date,
          'prices.dayPrice': prices.dayPrice,
          'prices.nightPrice': prices.nightPrice,
          'prices.fullDayPrice': prices.fullDayPrice,
        },
      };

      const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      };

      const result = await this.BookingModel.findOneAndUpdate(filter, update, options);
      return result;
    } catch (error) {
      console.error('Error in addPriceBySelectDay:', error);
      return null;
    }
  }

  async getPriceBySelectDay(filter: { date: Date, organizerId: Types.ObjectId }): Promise<BookingWeeklyEntity | null> {
    try {
      const startOfDay = new Date(filter.date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(filter.date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Find booking details for the specific date and organizer
      const priceDetails = await this.BookingModel.findOne({
        bookingDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        organizerId: filter.organizerId
      }).exec();

      // If booking details are found, return them
      if (priceDetails) {
        return priceDetails;
      }

      // If no specific booking details are found, find a default document for the organizer
      const dayOfWeek = new Date(filter.date).toLocaleString('en-IN', { weekday: 'long' });
      const defaultPrices = await this.BookingModel.findOne({
        organizerId: filter.organizerId,
        [`weeklyPrices.${dayOfWeek}`]: { $exists: true }
      }).exec();

      // Return the default prices document if found
      if (defaultPrices) {
        const weeklyPrice = defaultPrices.weeklyPrices?.[dayOfWeek] || defaultPrices.prices;
        const mergedDocument = new this.BookingModel({
          organizerId: defaultPrices.organizerId,
          userId: defaultPrices.userId,
          bookingDate: filter.date,
          bookingTime: defaultPrices.bookingTime,
          eventName: defaultPrices.eventName,
          bookedAt: new Date(),
          prices: weeklyPrice,
          weeklyPrices: defaultPrices.weeklyPrices
        });
        return mergedDocument;
      }

      // If no price details are found, return null
      return null;
    } catch (error) {
      console.error('Error retrieving price:', error);
      return null;
    }
  }




  async getEventsByMonth({ month, year, organizerId }: { month: number, year: number, organizerId: ObjectId }): Promise<BookingWeeklyEntity[] | null> {
    try {
      const startDate = new Date(year, month - 1, 1); // 1st day of the month
      const endDate = new Date(year, month, 0); // Last day of the month

      const events = await this.BookingModel.find({
        organizerId,
        bookingDate: { $gte: startDate, $lte: endDate }
      }).exec();

      return events.length > 0 ? events : null;
    } catch (error) {
      console.error('Error fetching events by month:', error);
      throw new Error('Error fetching events from database');
    }
  }

  async createDefaultPrice(data: { organizerId: Types.ObjectId, weeklyPrices: Record<string, BookingPrices> }): Promise<BookingWeeklyEntity | null> {
    try {
      const updatedBooking = await this.BookingModel.findOneAndUpdate(
        { organizerId: data.organizerId },
        { $set: { weeklyPrices: data.weeklyPrices } },
        { upsert: true, new: true } // Create if not exists and return the updated document
      );
      return updatedBooking;
    } catch (error) {
      console.error('Error in createDefaultPrice repository method:', error);
      throw new Error('Database operation failed');
    }
  }


}


