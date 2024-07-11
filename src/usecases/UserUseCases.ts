import { UserRepository } from '../entity/repository/userRepository';
import { UserEntity } from '../entity/models/UserEntity';

export class UserUseCases {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    const existingUser = await this.userRepository.findUserByEmail(user.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    return this.userRepository.createUser(user);
  }
}
