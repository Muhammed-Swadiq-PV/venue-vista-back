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
    buildingfloor?: string;
    pincode?: string;
    ownerIdCard?: Buffer;
    eventHallLicense?: Buffer;
    isProfileVerified?: boolean;
}
