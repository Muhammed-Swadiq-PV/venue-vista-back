import mongoose, { Schema, Document } from 'mongoose';

interface IRefreshToken extends Document {
  token: string;
  organizerId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const RefreshTokenSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true },
  organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
  expiresAt: { type: Date, required: true },
});

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);