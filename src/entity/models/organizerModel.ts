import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrgEntity } from './OrgEntity';

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
    isProfileApproved: { type: Boolean, default: false },
    isProfileUpdated: { type: Boolean, default: false },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number],
        required: false
      }
    }
  }, { timestamps: true });
  
  organizerSchema.index({ location: '2dsphere' });
  
  const OrgModel: Model<OrgEntity & Document> = mongoose.model('Organizer', organizerSchema);

  export default OrgModel;