import BookingPriceModel from "../../entity/models/weeklyBookingModel";
import BookingModel from "../../entity/models/bookingSchema";
import { BookingRepository } from "../../entity/repository/bookingRepository";
import { BookingEntity} from "../../interfaces/bookingEventHall";


export class HallBookingRepository implements BookingRepository {

    async findPriceByDate(organizerId: string, date: Date): Promise<any | null> {
        const priceDetails = await BookingPriceModel.findOne({
            organizerId,
            bookingDate: date
        }).select('prices');

        return priceDetails ? priceDetails.prices : null;
    }

    async findWeeklyPrice(organizerId: string, dayOfWeek: string): Promise<any | null> {
        const weeklyPriceDetails = await BookingPriceModel.findOne({
            organizerId
        }).select(`weeklyPrices.${dayOfWeek}`);

        if (weeklyPriceDetails && weeklyPriceDetails.weeklyPrices && weeklyPriceDetails.weeklyPrices[dayOfWeek]) {
            return weeklyPriceDetails.weeklyPrices[dayOfWeek];
        }
          
          return null;
    }

// Booking Repository
async createBooking(bookingData: BookingEntity): Promise<{ bookingId: string; status: string }> {
    try {

        const newBooking = new BookingModel({
            organizerId: bookingData.organizerId,
            userId: bookingData.userId,
            eventName: bookingData.eventName,
            userName: bookingData.userName,
            contactNumber: bookingData.contactNumber,
            email: bookingData.email,
            bookingTime: bookingData.bookingTime,
            eventType: bookingData.eventType,
            bookingDate: bookingData.bookingDate,
            bookedAt: bookingData.bookedAt,
            status: bookingData.status || 'pending', 
        });

        const savedBooking = await newBooking.save();

        return { bookingId: savedBooking._id.toString(), status: savedBooking.status };
    } catch (error) {
        console.error('Error saving booking:', error);
        throw new Error('Failed to create booking');
    }
}

async updateBooking(BookingId: string, updateData: Partial<BookingEntity>): Promise<{ bookingId: string; status: string }> {
    try {
        const updatedBooking = await BookingModel.findByIdAndUpdate(
          BookingId,
          { $set: updateData }, 
          { new: true } 
        );
    
        if (!updatedBooking) {
          throw new Error('Booking not found');
        }
    
        return { bookingId: updatedBooking._id.toString(), status: updatedBooking.status };
      } catch (error) {
        console.error('Error updating booking:', error);
        throw new Error('Failed to update booking');
      }
}

}

