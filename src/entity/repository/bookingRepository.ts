import { BookingEventHall } from "../../interfaces/bookingEventHall";

export interface BookingRepository{

    findPriceByDate(organizerId: string, date: Date): Promise<any | null>

    findWeeklyPrice(organizerId: string, dayOfWeek: string): Promise<any | null>

    createBooking(bookingData: BookingEventHall): Promise<string>;
}