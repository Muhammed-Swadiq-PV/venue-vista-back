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

  async signInUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await this.userRepository.validatePassword(email, password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    return user;
  }
}
