import RefreshTokenRepository from "../frameworks/repository/RefreshTokenRepository";

class RefreshTokenService {
    async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
      await RefreshTokenRepository.saveRefreshToken(userId, refreshToken);
    }
  }
  
  export default new RefreshTokenService();