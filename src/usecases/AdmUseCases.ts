// import { MongoDBAdmRepository } from '../frameworks/repository/MongoDBAdmRepository';
import { admRepository } from '../entity/repository/admRepository';
import { UserRepository } from '../entity/repository/userRepository';
import { OrgRepository } from '../entity/repository/orgRepository';
import { AdmEntity } from '../entity/models/AdmEntity';
import { UserEntity } from '../entity/models/UserEntity';
import { OrgEntity } from '../entity/models/OrgEntity';

export class AdmUseCases {
    private admRepository: admRepository;
    private userRepository: UserRepository;
    private orgRepository: OrgRepository;

    constructor(admRepository: admRepository, userRepository: UserRepository, orgRepository: OrgRepository) {
        this.admRepository = admRepository;
        this.userRepository = userRepository;
        this.orgRepository = orgRepository;
    }

    async signin(email: string, password: string): Promise<AdmEntity | null> {
        const admin = await this.admRepository.findAdminByEmail(email);
        // console.log(admin, 'admin in usecase')
        if (!admin) {
            throw new Error('Admin not found');
        }

        const isPasswordValid = await this.admRepository.validatePassword(email, password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        return admin;
    }

    // get user details for view and block or unblock
    async fetchUsers(page: number, limit: number): Promise<{ users: UserEntity[], totalPages: number }> {
        try {
            const users = await this.userRepository.getAllUsers(page, limit);
            return users;
        } catch (error) {
            console.error('Error in AdmUseCases:', error);
            throw new Error('Failed to fetch users');
        }
    }

    // Block or unblock a user
    async blockUser(id: string, isBlocked: boolean): Promise<UserEntity | null> {
        try {
            const updatedUser = await this.userRepository.manageUsers(id, { isBlocked });
            if (!updatedUser) {
                throw new Error('User not found');
            }
            return updatedUser;
        } catch (error) {
            console.error('Error in blockUser use case:', error);
            throw new Error('Failed to update user status');
        }
    }

    async fetchOrganizers(page: number, limit: number) {
        return await this.orgRepository.fetchOrganizers(page, limit);
    }

    async blockOrganizer(id: string, isBlocked: boolean): Promise<OrgEntity | null> {
        try {
            const updatedOrganizer = await this.orgRepository.manageOrganizer(id, { isBlocked });
            if (!updatedOrganizer) {
                throw new Error('organizer not found');
            }
            return updatedOrganizer;
        } catch (error) {
            throw new Error('Failed to update organizer status');
        }
    }

    async fetchPendingOrganizers(): Promise<any[]> {
        try {
            const organizers = await this.orgRepository.getPendingOrganizers();
            return organizers;
        } catch (erorr) {
            throw new Error('Failed to fetch organizers');
        }
    }

    async fetchPendingOrganizerWithId(id: string): Promise<OrgEntity | null> {
        try {
            const organizer = await this.orgRepository.getPendingOrganizerWithId(id);
            return organizer;
        } catch (error: any) {
            throw new Error('Error fetching organizer: ' + error.message);
        }
    }

    async approveOrganizer(id: string): Promise<OrgEntity | null> {
        try {
            const organizer = await this.orgRepository.approveOrganizer(id);
            return organizer;
        } catch (error: any) {
            throw new Error('Error approving organizer:' + error.message);

        }
    }

    async disApproveOrganizer(id: string): Promise<OrgEntity | null> {
        try {
            const organizer = await this.orgRepository.disApproveOrganizer(id);
            return organizer;
        } catch (error: any) {
            throw new Error('Error disapproving organizer:' + error.message);
        }
    }
}
