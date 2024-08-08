// src/entity/models/OrgPostModel.ts

import mongoose, { Schema, Document } from 'mongoose';
import { OrgPostEntity, VenueSection, ParkingSection, IndoorSection, DiningSection } from './OrgPostEntity';
import { OrgPostDocument } from './OrgPostDocument';

const VenueSectionSchema = new Schema<VenueSection>({
  images: [String],
  description: String,
}, { _id: false });

const ParkingSectionSchema = new Schema<ParkingSection>({
  images: [String],
  description: String,
  carParkingSpace: { type: Number, required: true },
  bikeParkingSpace: { type: Number, required: true },
}, { _id: false });

const IndoorSectionSchema = new Schema<IndoorSection>({
  images: [String],
  description: String,
  seatingCapacity: { type: Number, required: true },
}, { _id: false });

const DiningSectionSchema = new Schema<DiningSection>({
  images: [String],
  description: String,
  diningCapacity: { type: Number, required: true },
}, { _id: false });

const OrgPostSchema = new Schema<OrgPostDocument>({
  organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
  main: { type: VenueSectionSchema, required: false },
  parking: { type: ParkingSectionSchema, required: false },
  indoor: { type: IndoorSectionSchema, required: false },
  stage: { type: VenueSectionSchema, required: false },
  dining: { type: DiningSectionSchema, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OrgPostModel = mongoose.model<OrgPostDocument & Document>('OrgPost', OrgPostSchema);

export default OrgPostModel;