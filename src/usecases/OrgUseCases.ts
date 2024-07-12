import { OrgRepository } from '../entity/repository/orgRepository';
import { OrgEntity } from '../entity/models/OrgEntity';

export class OrgUseCases {
  constructor(private orgRepository: OrgRepository) {}

  async registerOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
    // console.log('Received organizer data in use case:', organizer);
    return this.orgRepository.createOrganizer(organizer);
  }

//   async findOrganizerByEmail(email: string): Promise<OrgEntity | null> {
//     console.log('Searching for organizer with email:', email);
//     return this.orgRepository.findOrganizerByEmail(email);
//   }

//   async updateOrganizer(organizer: OrgEntity): Promise<OrgEntity> {
//     console.log('Updating organizer with data:', organizer);
//     return this.orgRepository.updateOrganizer(organizer);
//   }
}
