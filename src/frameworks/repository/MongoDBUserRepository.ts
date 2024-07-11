// MongoDBUserRepository.ts
import { UserRepository } from '../../entity/repository/userRepository';
import { UserEntity } from '../../entity/models/UserEntity';
import mongoose, { Schema, Document, Model } from 'mongoose';

const userSchema: Schema<UserEntity & Document> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const UserModel: Model<UserEntity & Document> = mongoose.model('User', userSchema);

export class MongoDBUserRepository implements UserRepository {
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await UserModel.findOne({ email });
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    const createdUser = await UserModel.create(user);
    return createdUser;
  }
}
