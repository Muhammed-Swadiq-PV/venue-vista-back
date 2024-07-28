// src/entity/repository/orgRepository.ts
import { OrgEntity } from '../models/OrgEntity';
import { OrgPostEntity } from '../models/OrgPostEntity';

export interface OrgRepository {
    createOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    findOrganizerByEmail(email:string): Promise<OrgEntity| null> ;
    findOrganizerById(id:string): Promise<OrgEntity | null> ;
    validatePassword(email: string, password: string): Promise<boolean>;
    updateOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    updateProfile(userId: string, profileData: Partial<OrgEntity>): Promise<void>;
    updateOrganizerByEmail(email: string, profileData: Partial<OrgEntity>): Promise<OrgEntity | null>;

    // Post-related methods
    createPost(post: OrgPostEntity): Promise<OrgPostEntity>;
    // findPostsByOrganizerId(organizerId: string): Promise<OrgPostEntity[]>;
    // updatePost(postId: string, post: Partial<OrgPostEntity>): Promise<OrgPostEntity | null>;
    // deletePost(postId: string): Promise<void>;
}
