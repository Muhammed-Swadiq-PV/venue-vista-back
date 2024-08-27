// import mongoose, { Schema, model, Document,  Types } from "mongoose";

// export interface BookingPrices {
//     dayPrice: number;
//     nightPrice: number;
//     fullDayPrice: number;
//     totalPrice?: number;
// }

// export interface BookingEntity extends Document {
//     organizerId: Schema.Types.ObjectId;
//     userId: Schema.Types.ObjectId;
//     bookingDate: Date;
//     bookingTime: 'day' | 'night' | 'full'; // Type of booking
//     eventName: string;
//     bookedAt: Date; // When the booking was made
//     prices: BookingPrices;
// }

// const BookingSchema = new Schema<BookingEntity>({
//     organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
//     userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     bookingDate: { type: Date, required: true },
//     bookingTime: { type: String, enum: ['day', 'night', 'full'], required: true },
//     eventName: { type: String, required: true },
//     bookedAt: { type: Date, default: Date.now },
//     prices: {
//       dayPrice: { type: Number, required: true },
//       nightPrice: { type: Number, required: true },
//       fullDayPrice: { type: Number, required: true },
//       totalAmount: { type: Number, required: true }, // Optional field for total amount
//     },
//   });
  
//   const BookingModel = model<BookingEntity>('Booking', BookingSchema);
  
//   export default BookingModel;