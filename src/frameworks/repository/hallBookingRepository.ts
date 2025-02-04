import BookingPriceModel from "../../entity/models/weeklyBookingModel";
import BookingModel from "../../entity/models/bookingSchema";
import { BookingRepository } from "../../entity/repository/bookingRepository";
import { BookingEntity} from "../../interfaces/bookingEventHall";
import { OrgRepository } from "../../entity/repository/orgRepository";
import { NewOrgEntity,OrgEntity } from "../../entity/models/OrgEntity";


export class HallBookingRepository implements BookingRepository {
    private orgRepository: OrgRepository;

    constructor(orgRepository: OrgRepository){
        this.orgRepository = orgRepository;
    }

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

async getUserBookings(userId: string): Promise<BookingEntity[]> {
    try {
      const bookings = await BookingModel.find({ userId,isPaymentPaid: true }).exec() as BookingEntity[];
  
      // Get unique organizer IDs
      const organizerIds = [...new Set(bookings.map((booking) => booking.organizerId))];
      
      // Fetch all organizers in one go
      const organizers = await this.orgRepository.findOrganizersByIds(organizerIds);
  
      // Map organizers by ID for quick lookup
      const organizerMap = organizers.reduce((map: Record<string, NewOrgEntity>, organizer: OrgEntity) => {
        if (organizer._id) { // Check if _id is defined
          map[organizer._id.toString()] = organizer as NewOrgEntity; // Cast to NewOrgEntity
        }
        return map;
      }, {} as Record<string, NewOrgEntity>);
      
  

    const bookingsWithOrganizerDetails = bookings.map((booking) => ({
        ...booking.toObject(), 
        organizerDetails: {
          name: organizerMap[booking.organizerId.toString()]?.name || null,
          email: organizerMap[booking.organizerId.toString()]?.email || null,
          buildingFloor: organizerMap[booking.organizerId.toString()]?.buildingFloor || null,
          city: organizerMap[booking.organizerId.toString()]?.city || null,
          district: organizerMap[booking.organizerId.toString()]?.district || null,
          phoneNumber: organizerMap[booking.organizerId.toString()]?.phoneNumber || null,
          pincode: organizerMap[booking.organizerId.toString()]?.pincode || null,
          rulesAndRestrictions: organizerMap[booking.organizerId.toString()]?.rulesAndRestrictions || null,
          paymentPolicy: organizerMap[booking.organizerId.toString()]?.paymentPolicy || null,
        },
      }));
      return bookingsWithOrganizerDetails;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw new Error('Failed to fetch user bookings');
    }
  }


  async findBookingById(bookingId: string): Promise<BookingEntity | null> {
    try {
      const booking = await BookingModel.findById(bookingId).lean();
      return booking || null; 
    } catch (error) {
      console.error(`Error finding booking with ID ${bookingId}:`, error);
      throw new Error("Failed to retrieve booking.");
    }
  }
  
  async updateCancellation(bookingId: string, booking: Partial<BookingEntity>): Promise<BookingEntity | null> {
    try {
        const updatedBooking = await BookingModel.findByIdAndUpdate(
            bookingId,
            {$set: booking},
            {new: true},
        ).lean();
        return updatedBooking;
    } catch (error) {
        throw new Error("Failed to update booking cancellation");
    }
  }

}

