import { Request } from 'express';

// Define the structure of the request body
export interface CustomRequest extends Request {
    body: {
        eventHallName?: string;
        phoneNumber?: string;
        district?: string;
        city?: string;
        buildingFloor?: string;
        pincode?: string;
        ownerIdCardUrl?: string;  // URL for owner ID card
        eventHallLicenseUrl?: string;  // URL for event hall license
    };
}

// Extend for JWT if needed
export interface CustomRequestWithJwt extends CustomRequest {
    user?: { id: string; [key: string]: any };
}
