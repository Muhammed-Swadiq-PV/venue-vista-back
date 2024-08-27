import mongoose, { Types, Document } from "mongoose";

export interface BookingPrices {
    dayPrice: number;
    nightPrice: number;
    fullDayPrice: number;
    totalPrice?: number;
}

export interface WeeklyPrices {
    Monday: BookingPrices;
    Tuesday: BookingPrices;
    Wednesday: BookingPrices;
    Thursday: BookingPrices;
    Friday: BookingPrices;
    Saturday: BookingPrices;
    Sunday: BookingPrices;
}

export interface BookingWeeklyEntity extends Document {
    organizerId: Types.ObjectId;
    userId: Types.ObjectId;
    bookingDate: Date;
    bookingTime: 'day' | 'night' | 'full';
    eventName: string;
    bookedAt: Date;
    prices: BookingPrices;
    weeklyPrices?: WeeklyPrices;
}
