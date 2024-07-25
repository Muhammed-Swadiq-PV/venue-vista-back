import { UserRepository } from '../../entity/repository/userRepository';
import { UserEntity } from '../../entity/models/UserEntity';
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';

const userSchema: Schema<UserEntity & Document> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  isGoogle:{type:Boolean, default: false},
  isBlocked:{type:Boolean, default: false}
});


const UserModel: Model<UserEntity & Document> = mongoose.model('User', userSchema);


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

  async getAllUsers(): Promise<UserEntity[]> {
    try {
      // console.log('request coming inside userRepository');
      const users = await UserModel.find().exec();
      return users.map(user => user.toObject());
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async manageUsers(id: string, updateData: Partial<UserEntity>): Promise<UserEntity | null> {
    try {
      const userId = new ObjectId(id);
      const user = await UserModel.findById(userId).exec();
      console.log(user, 'user before blocking')
  
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
      console.log(result, 'result in manageusers')
      return result ? result.toObject() : null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }
  
}
