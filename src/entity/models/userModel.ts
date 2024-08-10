import mongoose, { Schema, Document, Model } from "mongoose";
import { UserEntity } from "./UserEntity";

const userSchema: Schema<UserEntity & Document> = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    isVerified: { type: Boolean, default: false },
    isGoogle: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    address: {type: String},
    city: {type:String},
    pin: {type:String},
    district: {type:String},
    mobileNumber: {type:String},
}, { timestamps: true });


const UserModel: Model<UserEntity & Document> = mongoose.model('User', userSchema);

export default UserModel;