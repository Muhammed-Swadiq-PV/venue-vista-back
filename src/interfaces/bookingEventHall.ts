import { Document, Types } from "mongoose";

export interface BookingEntity extends Document {
    _id:Types.ObjectId;
    organizerId : Types.ObjectId;
    userId : Types.ObjectId;
    bookingDate : Date;
    bookedAt : Date;
    bookingTime : 'day' | 'night' | 'full';
    eventName : string ;
    userName : string;  
    contactNumber: string;
    email: string;
    eventType?: string;
    isPaymentPaid: boolean;
    status: 'pending' | 'confirmed' | 'canceled';
    paymentDetails?: {
        paymentId?: string;
        paymentAmount?: number;
        currency?: string;
        paymentStatus?: 'succeeded' | 'failed' | 'refunded';
    };
    refundDetails?: {
        refundStatus?: 'none' | 'requested' | 'refunded';
        refundAmount?: number;
        refundDate?: Date;
        refundTransactionId?: string;
    };
    cancellationDetails?: {
        cancellationReason?: string;
        cancellationDate?: Date;
    };
}