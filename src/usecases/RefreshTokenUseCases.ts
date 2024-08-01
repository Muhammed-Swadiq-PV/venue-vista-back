import mongoose from 'mongoose';
import { RefreshToken } from '../entity/models/RefreshTokenModel';

export const saveRefreshToken = async (organizerId: string, refreshToken: string): Promise<void> => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      organizerId: new mongoose.Types.ObjectId(organizerId),
      expiresAt,
    });

    await newRefreshToken.save();
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw new Error('Failed to save refresh token');
  }
};