import { Schema, model } from "mongoose";
import { BookingWeeklyEntity } from "../../interfaces/weeklyPrices";

const BookingSchema = new Schema<BookingWeeklyEntity>({
    organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, enum: ['day', 'night', 'full'], required: true },
    eventName: { type: String, required: true },
    bookedAt: { type: Date, default: Date.now },
    prices: {
        dayPrice: { type: Number, required: true },
        nightPrice: { type: Number, required: true },
        fullDayPrice: { type: Number, required: true },
        totalPrice: { type: Number }, // Optional field
    },
    weeklyPrices: {
        Monday: {
            dayPrice: { type: Number, required: true },
            nightPrice: { type: Number, required: true },
            fullDayPrice: { type: Number, required: true },
        },
        Tuesday: {
            dayPrice: { type: Number, required: true },
            nightPrice: { type: Number, required: true },
            fullDayPrice: { type: Number, required: true },
        },
        Wednesday: {
            dayPrice: { type: Number, required: true },
            nightPrice: { type: Number, required: true },
            fullDayPrice: { type: Number, required: true },
        },
        Thursday: {
            dayPrice: { type: Number, required: true },
            nightPrice: { type: Number, required: true },
            fullDayPrice: { type: Number, required: true },
        },
        Friday: {
            dayPrice: { type: Number, required: true },
            nightPrice: { type: Number, required: true },
            fullDayPrice: { type: Number, required: true },
        },
        Saturday: {
            dayPrice: { type: Number, required: true },
            nightPrice: { type: Number, required: true },
            fullDayPrice: { type: Number, required: true },
        },
        Sunday: {
            dayPrice: { type: Number, required: true },
            nightPrice: { type: Number, required: true },
            fullDayPrice: { type: Number, required: true },
        },
    }
});

const BookingModel = model<BookingWeeklyEntity>('Booking', BookingSchema);

export default BookingModel;
