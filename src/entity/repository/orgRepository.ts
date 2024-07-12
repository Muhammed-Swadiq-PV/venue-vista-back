// src/entity/repository/orgRepository.ts
import { OrgEntity } from '../models/OrgEntity';

export interface OrgRepository {
    createOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
    // findOrganizerByEmail(email: string): Promise<OrgEntity | null>;
    // updateOrganizer(organizer: OrgEntity): Promise<OrgEntity>;
}
