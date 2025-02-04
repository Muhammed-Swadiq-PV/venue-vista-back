import { ObjectId } from "mongodb";

export interface OrgEntity {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  password?: string;
  otp?: string;
  isVerified?: boolean;
  isGoogle?: boolean;
  isBlocked?: boolean;
  eventHallName?: string;
  phoneNumber?: string;
  district?: string;
  city?: string;
  buildingFloor?: string;
  pincode?: string;
  ownerIdCardUrl?: string;
  eventHallLicenseUrl?: string;
  isProfileVerified?: boolean;
  isProfileApproved?: boolean;
  isProfileUpdated?: boolean;
  location?: {
    lat?: number;
    lng?: number;
  };
  rulesAndRestrictions?: string;
  paymentPolicy?: string;
}

export type NewOrgEntity = OrgEntity & {
  _id: ObjectId; 
};
