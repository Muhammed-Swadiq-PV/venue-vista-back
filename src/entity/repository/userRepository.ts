import { UserEntity } from '../models/UserEntity';

export interface UserRepository {
  createUser(user: UserEntity): Promise<UserEntity>;
  findUserByEmail(email: string): Promise<UserEntity | null>;
  validatePassword(email: string, password: string): Promise<boolean>;
  updateUser(user: UserEntity): Promise<UserEntity>;
  getAllUsers(page: number, limit: number): Promise<{ users: UserEntity[], totalPages: number }>;
  manageUsers(id: string, updateData: Partial<UserEntity>): Promise<UserEntity | null>;
  //trying to get complete profile data
  getProfile(userId: string): Promise<UserEntity | null>;
  updateUserProfile(userId: string, profileData: Partial<UserEntity>): Promise<UserEntity | null>;
}
