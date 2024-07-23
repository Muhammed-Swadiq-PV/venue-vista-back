// import { MongoDBAdmRepository } from '../frameworks/repository/MongoDBAdmRepository';
import { admRepository } from '../entity/repository/admRepository';
import { UserRepository } from '../entity/repository/userRepository';
import { AdmEntity } from '../entity/models/AdmEntity';
import { UserEntity } from '../entity/models/UserEntity';

export class AdmUseCases {
    private admRepository: admRepository;
    private userRepository: UserRepository;

    constructor(admRepository: admRepository , userRepository: UserRepository) {
        this.admRepository = admRepository;
        this.userRepository = userRepository;
    }

    async signin(email: string, password: string): Promise<AdmEntity | null> {
        const admin = await this.admRepository.findAdminByEmail(email);
            // console.log(admin, 'admin in usecase')
        if (!admin) {
            throw new Error('Admin not found');
        }

        const isPasswordValid = await this.admRepository.validatePassword(email, password);
        // console.log(isPasswordValid,'is passwordvalid')
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        return admin; 
    }

    // get user details for view and block or unblock
    async fetchUsers(): Promise<any[]> {
        try {
            // console.log('request coming in usecase');
            const users = await this.userRepository.getAllUsers();
            // console.log(users, 'users getting from database to usecase');
            return users;
        } catch (error) {
            console.error('Error in AdmUseCases:', error);
            throw new Error('Failed to fetch users');
        }
    }
}
