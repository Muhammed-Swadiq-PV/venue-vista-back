
import { Schema, model } from 'mongoose';
import { BookingEntity } from '../../interfaces/bookingEventHall';

const BookingSchema = new Schema<BookingEntity>({
    organizerId: { type: Schema.Types.ObjectId, ref:'Organizer', required: true }, 
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingDate: { type: Date, required: true },
    bookedAt: { type: Date, required: true },
    bookingTime: { type: String, enum: ['day', 'night', 'full'], required: true },
    eventName: { type: String, required: true },
    userName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    eventType: { type: String },
    isPaymentPaid: { type: Boolean, default: false }, 
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
    paymentDetails: {
        paymentId: { type: String }, // Stripe Payment Intent ID
        paymentAmount: { type: Number },
        currency: { type: String },
        paymentStatus: { type: String, enum: ['succeeded', 'failed', 'refunded'] },
    },
    refundDetails: {
        refundStatus: { type: String, enum: ['none', 'requested', 'refunded'], default: 'none' },
        refundAmount: { type: Number },
        refundDate: { type: Date },
        refundTransactionId: { type: String }, // Stripe Refund ID
    },
    cancellationDetails: {
        cancellationReason: { type: String },
        cancellationDate: { type: Date },
    },
});

const BookingModel = model<BookingEntity>('Booking', BookingSchema);

export default BookingModel;