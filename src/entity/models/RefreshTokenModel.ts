import mongoose, { Schema, Document } from 'mongoose';

interface IRefreshToken extends Document {
  token: string;
  userId?: mongoose.Types.ObjectId;
  organizerId?: mongoose.Types.ObjectId;
  adminEmail?: string;
  role: 'user' | 'organizer' | 'admin';
  expiresAt: Date;
}

const RefreshTokenSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: false },
  adminEmail: { type: String, required: false },
  role: { type: String, enum: ['user', 'organizer', 'admin'], required: true },
  expiresAt: { type: Date, required: true },
});

// Ensure at least one of userId, organizerId, or adminEmail is present
RefreshTokenSchema.path('userId').validate(function (value) {
  return value || this.organizerId || this.adminEmail;
}, 'Either userId, organizerId, or adminEmail must be present');

RefreshTokenSchema.path('organizerId').validate(function (value) {
  return value || this.userId || this.adminEmail;
}, 'Either userId, organizerId, or adminEmail must be present');

RefreshTokenSchema.path('adminEmail').validate(function (value) {
  return value || this.userId || this.organizerId;
}, 'Either userId, organizerId, or adminEmail must be present');

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
