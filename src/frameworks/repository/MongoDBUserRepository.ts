import { UserRepository } from '../../entity/repository/userRepository';
import { UserEntity ,UserGoogleEntity} from '../../entity/models/UserEntity';
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema: Schema<UserEntity & Document> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
});

// const googleUserSchema: Schema<UserGoogleEntity & Document> = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
// });

const UserModel: Model<UserEntity & Document> = mongoose.model('User', userSchema);
// const GoogleUserModel: Model<UserGoogleEntity & Document> = mongoose.model('GoogleUser', googleUserSchema);

export class MongoDBUserRepository implements UserRepository {
  async createUser(user: UserEntity): Promise<UserEntity> {
    if (!user.password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await bcryptjs.hash(user.password, 10);
    const newUser = new UserModel({
      name: user.name,
      email: user.email,
      password: hashedPassword,
      otp: user.otp,
      isVerified: user.isVerified,
    });

    await newUser.save();
    return newUser.toObject();
  }

  // async createUserGoogle(user: UserEntity): Promise<UserEntity> {
  //   let existingUser = await UserModel.findOne({ email: user.email });

  //   if (existingUser) {
  //     existingUser.name = user.name;
  //     return existingUser.save();
  //   } else {
  //     const newUser = new UserModel({
  //       name: user.name,
  //       email: user.email,
  //     });

  //     await newUser.save();
  //     return newUser.toObject();
  //   }
  // }

  

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
