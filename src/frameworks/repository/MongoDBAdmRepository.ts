import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { AdmEntity } from '../../entity/models/AdmEntity';
import { admRepository } from '../../entity/repository/admRepository';

interface AdmDocument extends AdmEntity, Document {}

const AdmSchema: Schema<AdmDocument> = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const AdmModel: Model<AdmDocument> = mongoose.model<AdmDocument>('Admin', AdmSchema);

export class MongoDBAdmRepository implements admRepository {
    async findAdminByEmail(email: string): Promise<AdmEntity | null> {
        // console.log(email, 'email in repository','type', typeof email)
        // const admnd= await AdmModel.find()
        // console.log('admnsssss in repository',admnd)

        const admin = await AdmModel.findOne({ email }).exec();
        // console.log(admin, 'admin found in repository');
        return admin;
    }

    async validatePassword(email: string, password: string): Promise<boolean> {
        const admin = await AdmModel.findOne({ email }).exec();
        if (!admin) return false;
        return bcryptjs.compare(password, admin.password);
    }
}
