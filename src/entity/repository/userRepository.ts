import { UserEntity } from '../models/UserEntity';

export interface UserRepository {
  createUser(user: UserEntity): Promise<UserEntity>;
}
