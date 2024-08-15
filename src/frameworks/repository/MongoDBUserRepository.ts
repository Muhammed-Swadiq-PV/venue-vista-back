import { UserRepository } from '../../entity/repository/userRepository';
import { UserEntity } from '../../entity/models/UserEntity';
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import UserModel from '../../entity/models/userModel';




export class MongoDBUserRepository implements UserRepository {



  async createUser(user: UserEntity): Promise<UserEntity> {
    let newUser: UserEntity;

    if (user.isGoogle) {
      if (!user.password) {
        throw new Error('Password is required for Google authenticated users');
      }

      const hashedPassword = await bcryptjs.hash(user.password, 10);

      newUser = {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        isVerified: true,
        isGoogle: true,
        isBlocked: false,
      };
    } else {
      if (!user.password) {
        throw new Error('Password is required');
      }

      const hashedPassword = await bcryptjs.hash(user.password, 10);

      newUser = {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        otp: user.otp,
        isVerified: user.isVerified || false,
        isGoogle: user.isGoogle || false,
      };
    }

    //save new user in database
    const savedUser = await this.saveUser(newUser);

    return savedUser;
  }

  //method for storing data in dbs
  async saveUser(user: UserEntity): Promise<UserEntity> {
    const userModel = new UserModel(user);
    const savedUser = await userModel.save();
    return savedUser.toObject();
  }



  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await UserModel.findOne({ email }).exec();
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    if (!user || !user.password) {
      return false;
    }
    return await bcryptjs.compare(password, user.password);
  }

  async updateUser(user: UserEntity): Promise<UserEntity> {
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        email: user.email,
        password: user.password,
        otp: user.otp,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
      },
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser.toObject();
  }

  async getAllUsers(page: number, limit: number): Promise<{ users: UserEntity[], totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const [users, totalCount] = await Promise.all([
        UserModel.find().sort({ updatedAt: - 1 }).skip(skip).limit(limit).exec(),
        UserModel.countDocuments().exec()
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      return {
        users: users.map(user => user.toObject()),
        totalPages
      };
    } catch (error) {
      throw new Error('Error fetching user');
    }
  }

  async manageUsers(id: string, updateData: Partial<UserEntity>): Promise<UserEntity | null> {
    try {
      const userId = new ObjectId(id);
      const user = await UserModel.findById(userId).exec();

      if (!user) {
        throw new Error('User not found');
      }

      // Determine the new value for isBlocked
      const newIsBlocked = updateData.isBlocked !== undefined ? updateData.isBlocked : user.isBlocked;

      // Create the update object with the new isBlocked value
      const updateObject: Partial<UserEntity> = {
        isBlocked: newIsBlocked, // Ensure isBlocked is set explicitly
      };

      const result = await UserModel.findOneAndUpdate(
        { _id: userId },
        { $set: updateObject },
        { new: true }
      ).exec();
      return result ? result.toObject() : null;
    } catch (error) {
      throw new Error('Failed to update user');
    }
  }

  // get profile details id changing to ObjectId
  async getProfile(userId: string): Promise<UserEntity | null> {
    try {
      const objectId = new mongoose.Types.ObjectId(userId);
      const profile = await UserModel.findById(objectId);

      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, profileData: Partial<UserEntity>): Promise<UserEntity | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(userId, profileData, { new: true });
      return updatedUser ? updatedUser.toObject() : null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Could not update user profile');
    }
  }

}
