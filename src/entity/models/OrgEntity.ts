export interface OrgEntity {
    id ?: string;
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
}
