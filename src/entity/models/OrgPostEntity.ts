// src/entity/models/OrgPostEntity.ts

import mongoose from "mongoose";

export interface OrgPostEntity {
  organizerId: mongoose.Types.ObjectId;
  main?: VenueSection;
  parking?: ParkingSection;
  indoor?: IndoorSection;
  stage?: VenueSection;
  dining?: DiningSection;
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueSection {
  images: string[];
  description: string;
}

export interface ParkingSection extends VenueSection {
  carParkingSpace: number;
  bikeParkingSpace: number;
}

export interface IndoorSection extends VenueSection {
  seatingCapacity: number;
}

export interface DiningSection extends VenueSection {
  diningCapacity: number;
}