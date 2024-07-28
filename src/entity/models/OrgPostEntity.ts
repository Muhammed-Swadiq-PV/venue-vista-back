// src/entity/models/OrgPostEntity.ts
export interface OrgPostEntity {
  organizerId: string;
  main?: VenueSection;
  parking?: VenueSection;
  indoor?: VenueSection;
  stage?: VenueSection;
  dining?: VenueSection;
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueSection {
  images: string[];
  description: string;
}