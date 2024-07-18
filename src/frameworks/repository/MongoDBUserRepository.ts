import { UserRepository } from '../../entity/repository/userRepository';
import { UserEntity } from '../../entity/models/UserEntity';
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema: Schema<UserEntity & Document> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  isGoogle:{type:Boolean, default: false}
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
      isVerified: true, // Google users are considered verified
      isGoogle: true,
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

  // Assuming you have a method to save newUser to your database
  const savedUser = await this.saveUser(newUser);

  return savedUser;
}

// Example method to save user to the database
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
      },
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser.toObject();
  }
}
