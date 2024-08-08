export interface SectionDetails {
    images: string[];
    description: string;
  }
  
  export interface EventHallDetailsId {
    _id: string;
    organizerId: string;
    main: SectionDetails;
    parking: SectionDetails;
    indoor: SectionDetails;
    stage: SectionDetails;
    dining: SectionDetails;
    carParkingSpace: number; 
    bikeParkingSpace: number; 
    diningCapacity: number; 
    seatingCapacity: number; 
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface OrganizerDetailsId {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    buildingFloor: string;
    city: string;
    district: string;
  }
  
  export interface EventHallWithOrganizerId {
    eventHalls: EventHallDetailsId[];
    organizers: OrganizerDetailsId[];
  }
  