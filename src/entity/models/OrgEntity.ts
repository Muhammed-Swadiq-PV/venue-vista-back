
export interface OrgEntity {
    id ?: String;
    name: string;
    email: string;
    password?: string;
    otp?: String;
    isVerified?: boolean;
    token?: string;
    isGoogle?: boolean;
    isBlocked?: boolean;
    profile?:{
        eventHallName?: string;
        phoneNumber?: string;
        district?:string;
        city?: string;
        buildingfloor?: string;
        pincode?: string;
        ownerIdCard?: Buffer;
        eventHallLicense?: Buffer;
        isApproved?: boolean;
    }
}
