//src/entity/models/orpostdocument.ts
import mongoose, { Schema, Document } from 'mongoose';
import { OrgPostEntity, VenueSection } from './OrgPostEntity';

export interface OrgPostDocument extends OrgPostEntity, Document {
  // You can add any additional methods here if needed
}