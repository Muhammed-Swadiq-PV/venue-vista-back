// src/entity/models/OrgEntity.ts
export interface OrgEntity {
    _id?: string; // Include _id as optional
    ownerName: string;
    email: string;
    phoneNumber: string;
    password: string;
    eventHallName: string;
    state: string;
    district: string;
    city: string;
    buildingFloor: string;
    pincode: string;
    ownerIdCard: string;
    eventHallLicence: string;
    isApproved?: boolean;
    otp?: string;
}
