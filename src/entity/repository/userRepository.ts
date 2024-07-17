import { UserEntity, UserGoogleEntity } from '../models/UserEntity';

export interface UserRepository {
  createUser(user: UserEntity): Promise<UserEntity>;
  createUserGoogle(user: UserGoogleEntity): Promise<UserGoogleEntity>
  findUserByEmail(email: string): Promise<UserEntity | null>;
  validatePassword(email: string, password: string): Promise<boolean>;
  updateUser(user: UserEntity): Promise<UserEntity>;
}
