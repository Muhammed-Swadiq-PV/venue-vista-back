import mongoose, { Document, Schema, model } from 'mongoose';
import { OrgEntity } from '../../entity/models/OrgEntity';
import { OrgRepository } from '../../entity/repository/orgRepository';

const orgSchema = new Schema({
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  eventHallName: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  buildingFloor: { type: String, required: true },
  pincode: { type: String, required: true },
  ownerIdCard: { type: String, required: true },
  eventHallLicence: { type: String, required: true },
//   isApproved: { type: Boolean, default: false },
//   otp: { type: String, required: true },
});

interface OrgDocument extends Document, Omit<OrgEntity, '_id'> {}

const OrgModel = model<OrgDocument>('Organizer', orgSchema);

export class MongoDBOrgRepository implements OrgRepository {
  async createOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
    console.log('Received data in createOrganizer:', organizer);
    const newOrg = new OrgModel(organizer);
    const savedOrg = await newOrg.save();
    console.log('+++++++++++++++++',savedOrg)
    return savedOrg.toObject() as OrgEntity;
  }

//   async findOrganizerByEmail(email: string): Promise<OrgEntity | null> {
//     const org = await OrgModel.findOne({ email }).exec();
//     console.log(org,'lksdjdklj')
//     return org ? (org.toObject() as OrgEntity) : null;
//   }

//   async updateOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
//     const updatedOrg = await OrgModel.findByIdAndUpdate(organizer._id, organizer, { new: true }).exec();
    
//     if (!updatedOrg) {
//       throw new Error('Organizer not found');
//     }

//     return updatedOrg.toObject() as OrgEntity;
//   }
}
