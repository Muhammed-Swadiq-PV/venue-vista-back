import BookingModel from "../../entity/models/weeklyBookingModel";
import { BookingRepository } from "../../entity/repository/bookingRepository";
import { BookingEventHall } from "../../interfaces/bookingEventHall";


export class HallBookingRepository implements BookingRepository {

    async findPriceByDate(organizerId: string, date: Date): Promise<any | null> {
        const priceDetails = await BookingModel.findOne({
            organizerId,
            bookingDate: date
        }).select('prices');

        return priceDetails ? priceDetails.prices : null;
    }

    async findWeeklyPrice(organizerId: string, dayOfWeek: string): Promise<any | null> {
        const weeklyPriceDetails = await BookingModel.findOne({
            organizerId
        }).select(`weeklyPrices.${dayOfWeek}`);

        if (weeklyPriceDetails && weeklyPriceDetails.weeklyPrices && weeklyPriceDetails.weeklyPrices[dayOfWeek]) {
            return weeklyPriceDetails.weeklyPrices[dayOfWeek];
        }
          
          return null;
    }

    async createBooking(bookingData: BookingEventHall): Promise<string> {
        const booking = new BookingModel(bookingData);
        const savedBooking = await booking.save();
        return savedBooking._id.toString(); // Return the booking ID after saving
    }
}