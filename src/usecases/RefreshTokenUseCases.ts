import mongoose from 'mongoose';
import { RefreshToken } from '../entity/models/RefreshTokenModel';

export const saveRefreshToken = async (idOrEmail: string, refreshToken: string, role: 'user' | 'organizer' | 'admin'): Promise<void> => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      role,
      expiresAt,
    });

    if (role === 'user') {
      newRefreshToken.userId = new mongoose.Types.ObjectId(idOrEmail);
    } else if (role === 'organizer') {
      newRefreshToken.organizerId = new mongoose.Types.ObjectId(idOrEmail);
    } else if (role === 'admin') {
      newRefreshToken.adminEmail = idOrEmail;
    }

    await newRefreshToken.save();
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw new Error('Failed to save refresh token');
  }
};
