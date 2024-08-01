
// In a separate file:
import { RefreshToken } from '../../entity/models/RefreshTokenModel';

class RefreshTokenRepository {
  async saveRefreshToken(organizerId: string, refreshToken: string): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      await RefreshToken.findOneAndUpdate(
        { organizerId: organizerId },
        { 
          token: refreshToken,
          expiresAt: expiresAt
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw new Error('Failed to save refresh token');
    }
  }
}

export default new RefreshTokenRepository();