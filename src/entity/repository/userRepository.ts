import { UserEntity } from '../models/UserEntity';

export interface UserRepository {
  createUser(user: UserEntity): Promise<UserEntity>;
  findUserByEmail(email: string): Promise<UserEntity | null>;
  validatePassword(email: string, password: string): Promise<boolean>;
}
