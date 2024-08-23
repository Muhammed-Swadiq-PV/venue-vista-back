interface EventHall {
    _id: string;
    organizerId: string;
    main: {
      images: string[];
      description: string;
    };
    parking: {
      images: string[];
      description: string;
    };
    indoor: {
      images: string[];
      description: string;
    };
    stage: {
      images: string[];
      description: string;
    };
    dining: {
      images: string[];
      description: string;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  interface Organizer {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    buildingFloor: string;
    city: string;
    district: string;
  }
  
  export type EventHallAndOrganizerArray  = [EventHall, Organizer][];
  