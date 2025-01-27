import { BookingEntity } from "../../interfaces/bookingEventHall";

export interface BookingRepository{

    findPriceByDate(organizerId: string, date: Date): Promise<any | null>

    findWeeklyPrice(organizerId: string, dayOfWeek: string): Promise<any | null>

    createBooking(bookingData: BookingEntity): Promise<{ bookingId: string; status: string }>;

    updateBooking(BookingId: string, updateData: Partial<BookingEntity>): Promise<{ bookingId: string; status: string }>;

    getUserBookings(userId: string): Promise<BookingEntity[]>;
}