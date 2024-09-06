export interface BookingEventHall {
    organizerId: string;
    userId: string;
    eventName: string;
    eventType: 'day' | 'night' | 'full'; 
    date: string;
    userName: string;
    contactNumber: string;
    email: string;
}
