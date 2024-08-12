
export interface SectionDetails {
    images: string[];
    description: string;
}

export interface EventHallDetails {
    _id: string;
    organizerId: string;
    main: SectionDetails;
    parking: SectionDetails;
    indoor: SectionDetails;
    stage: SectionDetails;
    dining: SectionDetails;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizerDetails {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    buildingFloor: string;
    city: string;
    district: string;
}

export interface EventHallWithOrganizerDetails {
    eventHalls: EventHallDetails[];
    organizers: OrganizerDetails[];
}
