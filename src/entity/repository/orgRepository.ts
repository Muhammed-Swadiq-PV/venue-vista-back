// src/entity/repository/orgRepository.ts
import { OrgEntity } from '../models/OrgEntity';
import { OrgPostEntity } from '../models/OrgPostEntity';
import { EventHallWithOrganizerDetails } from '../../interfaces/eventHallwithOrganizer';
import { EventHallWithOrganizerId } from '../../interfaces/eventHallWithOrganizerId';
import { EventHallAndOrganizerArray } from '../../interfaces/eventHallForSearch';


export interface OrgRepository {
    createOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    findOrganizerByEmail(email: string): Promise<OrgEntity | null>;
    findOrganizerById(id: string): Promise<OrgEntity | null>;
    validatePassword(email: string, password: string): Promise<boolean>;
    updateOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    updateProfile(userId: string, profileData: Partial<OrgEntity>): Promise<void>;
    updateLocation(organizerId: string, location: { lat: number; lng: number }): Promise<OrgEntity | null>
    updateOrganizerByEmail(email: string, profileData: Partial<OrgEntity>): Promise<OrgEntity | null>;

    findProfileById(organizerId: string): Promise<OrgEntity | null>;

    // Post-related methods
    createPost(post: OrgPostEntity): Promise<OrgPostEntity>;

    //for admin related tasks

    fetchOrganizers(page: number, limit: number): Promise<{ organizers: OrgEntity[], totalPages: number }>

    manageOrganizer(id: string, updateData: Partial<OrgEntity>): Promise<OrgEntity | null>;
    getPendingOrganizers(): Promise<OrgEntity[]>;
    getPendingOrganizerWithId(id: string): Promise<OrgEntity | null>;
    approveOrganizer(id: string): Promise<OrgEntity | null>;
    disApproveOrganizer(id: string): Promise<OrgEntity | null>;
    //for user related tasks
    getHallWithOrganizerDetails(page: number, limit: number): Promise<{ details: EventHallWithOrganizerDetails | null, totalPages: number }>
    findOrganizersByLocation(latitude: number, longitude: number): Promise<any>
    completeDetailsOfNearestOrganizers(hallId: string): Promise<EventHallWithOrganizerDetails | null>
    // findOrganizerWithEventHallByName(name: string): Promise<EventHallWithOrganizerDetails | null>
    findOrganizerWithEventHallByName(name: string): Promise<EventHallAndOrganizerArray | null> 

    getOrganizerName(orgId: string): Promise<string | null>;
    getOrganizerIdfrompostId(hallId: string): Promise<string | null>;
    getHallWithOrganizerDetailsId(organizerId: string): Promise<EventHallWithOrganizerId | null>;

    getPendingOrganizerDetailsWithId(hallId: string): Promise<EventHallWithOrganizerDetails | null>;
    findOrganizerbyPost(organizerId: string): Promise<OrgPostEntity | null>;

    updatePostDetails(organizerId: string, section: string, data: any): Promise<any>
}
