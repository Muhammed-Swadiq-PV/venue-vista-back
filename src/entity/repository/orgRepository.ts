// src/entity/repository/orgRepository.ts
import { OrgEntity } from '../models/OrgEntity';
import { OrgPostEntity } from '../models/OrgPostEntity';
import { EventHallWithOrganizerDetails } from '../../interfaces/eventHallwithOrganizer';
import { EventHallWithOrganizerId } from '../../interfaces/eventHallWithOrganizerId';


export interface OrgRepository {
    createOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    findOrganizerByEmail(email: string): Promise<OrgEntity | null>;
    findOrganizerById(id: string): Promise<OrgEntity | null>;
    validatePassword(email: string, password: string): Promise<boolean>;
    updateOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    updateProfile(userId: string, profileData: Partial<OrgEntity>): Promise<void>;
    updateOrganizerByEmail(email: string, profileData: Partial<OrgEntity>): Promise<OrgEntity | null>;

    // Post-related methods
    createPost(post: OrgPostEntity): Promise<OrgPostEntity>;
    //for admin related tasks
    getAllOrganizers(): Promise<OrgEntity[]>;
    manageOrganizer(id: string, updateData: Partial<OrgEntity>): Promise<OrgEntity | null>;
    getPendingOrganizers(): Promise<OrgEntity[]>;
    getPendingOrganizerWithId(id: string): Promise<OrgEntity | null>;
    approveOrganizer(id: string): Promise<OrgEntity | null>;
    disApproveOrganizer(id: string): Promise<OrgEntity | null>;
    //for user related tasks
    getHallWithOrganizerDetails(): Promise<EventHallWithOrganizerDetails | null>;

    getHallWithOrganizerDetailsId(organizerId: string): Promise<EventHallWithOrganizerId| null>;

    getPendingOrganizerDetailsWithId(hallId: string): Promise<EventHallWithOrganizerDetails | null>;
    findOrganizerbyPost(organizerId: string): Promise<OrgPostEntity | null>;
}
