// UserUseCases.ts

import { UserRepository } from '../entity/repository/userRepository';
import { UserEntity } from '../entity/models/UserEntity';
import bcrypt from 'bcrypt';

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

    const hashedPassword = await bcrypt.hash(user.password, 10); // Hash password
    const newUser: UserEntity = {
      ...user,
      password: hashedPassword,
    };

    return this.userRepository.createUser(newUser);
  }

  async signInUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    console.log(password, user.password)
    // Correctly using bcrypt.compare() to compare the plaintext password with the hashed password
    const isPasswordValid =await bcrypt.compare(password, user.password);
    console.log(isPasswordValid)
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
  
    return user;
  }
}
