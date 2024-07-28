// src/entity/models/OrgPostModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { OrgPostEntity, VenueSection } from './OrgPostEntity';
import { OrgPostDocument } from './OrgPostDocument';

const VenueSectionSchema = new Schema<VenueSection>({
  images: [String],
  description: String,
}, { _id: false });

const OrgPostSchema = new Schema<OrgPostDocument>({
  organizerId: { type: String, required: true },
  main: { type: VenueSectionSchema, required: false },
  parking: { type: VenueSectionSchema, required: false },
  indoor: { type: VenueSectionSchema, required: false },
  stage: { type: VenueSectionSchema, required: false },
  dining: { type: VenueSectionSchema, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OrgPostModel = mongoose.model<OrgPostDocument & Document>('OrgPost', OrgPostSchema);

export default OrgPostModel;