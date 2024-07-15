import { UserRepository } from '../entity/repository/userRepository';
import { UserEntity } from '../entity/models/UserEntity';
import { generateOTP, sendOtpEmail } from '../utils/otpGenerator';

export class UserUseCases {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    const existingUser = await this.userRepository.findUserByEmail(user.email);
    if (existingUser && existingUser.isVerified) {
      throw new Error('Email already exists');
    }

    if (existingUser && !existingUser.isVerified) {
      const otp = generateOTP();
      existingUser.otp = otp;
      await this.userRepository.updateUser(existingUser);
      await sendOtpEmail(existingUser.name, existingUser.email, otp); // Send OTP email
      throw new Error('User already exists but is not verified. OTP has been sent.');
    }

    const otp = generateOTP();
    user.otp = otp;
    user.isVerified = false;

    const newUser = await this.userRepository.createUser(user);
    await sendOtpEmail(newUser.name, newUser.email, otp); // Send OTP email

    return newUser;
  }

  async verifyUser(email: string, otp: string): Promise<UserEntity> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    user.isVerified = true;
    user.otp = undefined; // Clear OTP after successful verification

    return this.userRepository.updateUser(user);
  }

  async signInUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isVerified) {
      throw new Error('User not verified');
    }

    const isPasswordValid = await this.userRepository.validatePassword(email, password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    return user;
  }
}
