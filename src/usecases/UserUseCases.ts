import { UserRepository } from '../entity/repository/userRepository';
import { UserEntity } from '../entity/models/UserEntity';

export class UserUseCases {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.createUser(user);
  }
}
