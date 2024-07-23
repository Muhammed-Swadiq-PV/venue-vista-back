import { UserEntity } from '../models/UserEntity';

export interface UserRepository {
  createUser(user: UserEntity): Promise<UserEntity>;
  findUserByEmail(email: string): Promise<UserEntity | null>;
  validatePassword(email: string, password: string): Promise<boolean>;
  updateUser(user: UserEntity): Promise<UserEntity>;
  getAllUsers(): Promise<UserEntity[]>;
  manageUsers(id: string, updateData: Partial<UserEntity>): Promise<UserEntity | null>;
}
