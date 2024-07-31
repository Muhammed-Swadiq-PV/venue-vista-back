// src/entity/models/OrgPostEntity.ts

import mongoose from "mongoose";

export interface OrgPostEntity {
  organizerId: mongoose.Types.ObjectId;
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