import { MongoDBAdmRepository } from '../frameworks/repository/MongoDBAdmRepository';
import { AdmEntity } from '../entity/models/AdmEntity';

export class AdmUseCases {
    private admRepository: MongoDBAdmRepository;

    constructor(admRepository: MongoDBAdmRepository) {
        this.admRepository = admRepository;
    }

    async signin(email: string, password: string): Promise<AdmEntity | null> {
        const admin = await this.admRepository.findAdminByEmail(email);
            console.log(admin, 'admin in usecase')
        if (!admin) {
            throw new Error('Admin not found');
        }

        const isPasswordValid = await this.admRepository.validatePassword(email, password);
        console.log(isPasswordValid,'is passwordvalid')
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        return admin; 
    }
}
