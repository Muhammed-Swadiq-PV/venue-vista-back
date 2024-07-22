// src/entity/repository/orgRepository.ts
import { OrgEntity } from '../models/OrgEntity';

export interface OrgRepository {
    createOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    findOrganizerByEmail(email:string): Promise<OrgEntity| null> ;
    findOrganizerById(id:string): Promise<OrgEntity | null> ;
    validatePassword(email: string, password: string): Promise<boolean>;
    updateOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    updateProfile(userId: string, profileData: Partial<OrgEntity>): Promise<void>;
}
