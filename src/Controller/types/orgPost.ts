import { Request } from 'express';

export interface VenueSection {
  images: string[]; // Array of image URLs
  description: string;
}

// Define the structure of the request body for creating a post
export interface CustomPostRequest extends Request {
  body: {
    main: VenueSection;
    parking: VenueSection;
    indoor: VenueSection;
    stage: VenueSection;
    dining: VenueSection;
  };
}

// Extend for JWT if needed
export interface CustomPostRequestWithJwt extends CustomPostRequest {
  user?: { id: string; [key: string]: any };
}
