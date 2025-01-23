import { UserRepository } from '../entity/repository/userRepository';
import { OrgRepository } from '../entity/repository/orgRepository';
import { BookingRepository } from '../entity/repository/bookingRepository';
import { UserEntity } from '../entity/models/UserEntity';
import { generateOTP, sendOtpEmail } from '../utils/otpGenerator';
import { EventHallWithOrganizerDetails } from '../interfaces/eventHallwithOrganizer'
import { EventHallWithOrganizerId } from '../interfaces/eventHallWithOrganizerId';
import { EventHallAndOrganizerArray } from '../interfaces/eventHallForSearch';
import { BookingEntity } from '../interfaces/bookingEventHall';

import { StripePaymentService } from '../frameworks/payment/StripePayment';

import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

export class UserUseCases {
  private userRepository: UserRepository;
  private orgRepository: OrgRepository;
  private bookingRepository: BookingRepository;

  constructor(userRepository: UserRepository, orgRepository: OrgRepository, bookingRepository: BookingRepository) {
    this.userRepository = userRepository;
    this.orgRepository = orgRepository;
    this.bookingRepository = bookingRepository;
  }

  async createUser(user: UserEntity): Promise<UserEntity> {


    const existingUser = await this.userRepository.findUserByEmail(user.email);
    if (existingUser && existingUser.isVerified) {
      throw new Error('Email already exists');
    }

    if (existingUser && !existingUser.isVerified) {
      const otp = generateOTP();
      existingUser.otp = otp;
      await this.userRepository.updateUser(existingUser);
      await sendOtpEmail(existingUser.name, existingUser.email, otp);
      throw new Error('User already exists but is not verified. OTP has been sent.');
    }

    const otp = generateOTP();
    user.otp = otp;
    user.isVerified = false;
    user.isGoogle = false;

    const newUser = await this.userRepository.createUser(user);
    await sendOtpEmail(newUser.name, newUser.email, otp);

    return newUser;
  }

  async createGoogleUser(user: UserEntity): Promise<UserEntity> {
    user.isVerified = true;
    user.isGoogle = true;
    return this.userRepository.createUser(user);
  }



  async resendOtp(email: string): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('User is already verified');
    }

    const otp = generateOTP();
    user.otp = otp;
    await this.userRepository.updateUser(user);
    await sendOtpEmail(user.name, user.email, otp);
  }

  async verifyUser(email: string, otp: string): Promise<UserEntity> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    user.isVerified = true;
    user.otp = undefined; // Clear OTP after successful verification

    return this.userRepository.updateUser(user);
  }

  async signInUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isVerified) {
      throw new Error('User not verified');
    }

    const isPasswordValid = await this.userRepository.validatePassword(email, password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    return user;
  }

  async signInGoogle(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isVerified) {
      throw new Error('User not verified');
    }
    if (!user.isGoogle) {
      throw new Error('User not signed up with Google auth');
    }
    return user;
  }

  async fetchHallWithOrganizerDetails(page: number, limit: number): Promise<{ details: EventHallWithOrganizerDetails | null, totalPages: number }> {
    return await this.orgRepository.getHallWithOrganizerDetails(page, limit);
  }

  async searchEventHallByName(searchTerm: string): Promise<EventHallAndOrganizerArray | null> {
    try {
      const eventHallDetails = await this.orgRepository.findOrganizerWithEventHallByName(searchTerm);
      return eventHallDetails;
    } catch (error) {
      throw new Error('could not retrieve event hall details');
    }
  }

  // get ids of the eventhalls that near to user location
  async fetchOrganizersByLocation(latitude: number, longitude: number): Promise<any> {
    try {
      return await this.orgRepository.findOrganizersByLocation(latitude, longitude);
    } catch (error) {
      console.error('Error fetching organizers in use case:', error);
      throw new Error('Failed to fetch organizers');
    }
  }

  // get complete details of the venues that already sending from the front
  completeDetailsOfNearestOrganizers = async (ids: string[]): Promise<EventHallWithOrganizerDetails[]> => {
    try {
      const eventHallDetails = await Promise.all(ids.map(id =>
        this.orgRepository.completeDetailsOfNearestOrganizers(id)
      ));

      console.log(eventHallDetails, 'event hall details')

      // Filter out any null results
      return eventHallDetails.filter(details => details !== null) as EventHallWithOrganizerDetails[];
    } catch (error) {
      throw new Error('Error fetching organizer details');
    }
  };

  async getOrganizerName(orgId: string): Promise<{ organizerId: string; organizerName: string } | null> {
    try {
      const organizerIdName = await this.orgRepository.getOrganizerName(orgId);

      if (!organizerIdName) {
        console.log('no organizer in the id');
        return null;
      }
      return {
        organizerId: organizerIdName.organizerId,
        organizerName: organizerIdName.organizerName,
      }
    } catch (error) {
      console.error('Error fetching organizer name', error);
      throw new Error('Failed to fetch organizer name');
    }
  }

  async getOrganizerNameAndRules(organizerId: string): Promise<{ organizerName: string } | null> {
    try {
      const organizerName = await this.orgRepository.getOrganizerNameAndRules(organizerId);

      if (!organizerName) {
        return null;
      }
      return organizerName;
    } catch (error) {
      console.error('Error fetching organizer name', error);
      throw new Error('Failed to fetch organizer name');
    }
  }

  async getOrganizerDetails(postId: string): Promise<{
    carParkingSpace: number;
    bikeParkingSpace: number;
    indoorSeatingCapacity: number;
    diningCapacity: number;
    } | null> {
    try {
      const details = await this.orgRepository.getOrganizerDetails(postId);


      if (!details) {
        return null;
      }
      return details;
    } catch (error) {
      console.error('Error fetching organizer post details', error);
      throw new Error('Failed to fetch organizer post details');
    }
  }

  async fetchHallWithOrganizerWithId(hallId: string): Promise<EventHallWithOrganizerId | null> {

    const organizerId = await this.orgRepository.getOrganizerIdfrompostId(hallId);

    if (!organizerId) {
      console.log('No organizer id for the post id');
      return null;
    }

    return await this.orgRepository.getHallWithOrganizerDetailsId(organizerId);
  }

  async createBooking(bookingData: BookingEntity): Promise<{ bookingId: string; status: string }> {
    try {
        const { bookingId, status } = await this.bookingRepository.createBooking(bookingData);    
        // Return the bookingId and status
        // console.log(bookingId, 'bookingId in usecase')
        return { bookingId, status };
    } catch (error) {
        console.error('Error creating booking:', error);
        throw new Error('Failed to create booking');
    }
}

async createPayment(amount: number, currency: string, payment_method_id: string,) {
  const paymentIntent = await StripePaymentService.createPaymentIntent(amount, currency, payment_method_id);
      // console.log(paymentIntent, 'payment intent in usecase')
  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  };
} catch (error: any) {
  console.error('Error during payment intent creation:', error);
  throw new Error('Failed to create payment intent');
}

async confirmPayment(paymentIntentId: string, BookingId: string) {
  try {
    const paymentIntent = await StripePaymentService.retrievePaymentIntent(paymentIntentId);
    
    // Map Stripe payment status to our defined statuses(in booking entity)
    const mapPaymentStatus = (status: Stripe.PaymentIntent.Status): 'succeeded' | 'failed' | 'refunded' => {
      switch (status) {
        case 'succeeded':
          return 'succeeded';
        case 'canceled':
          return 'failed';
        case 'requires_payment_method':
          return 'failed';
        default:
          return 'failed';
      }
    };

    const paymentDetails = {
      paymentId: paymentIntent.id,
      paymentAmount: paymentIntent.amount / 100, // Convert from cents to standard unit
      currency: paymentIntent.currency,
      paymentStatus: mapPaymentStatus(paymentIntent.status),
    };

    await this.bookingRepository.updateBooking(BookingId, {
      isPaymentPaid: paymentDetails.paymentStatus === 'succeeded',
      status: paymentDetails.paymentStatus === 'succeeded' ? 'confirmed' : 'pending',
      paymentDetails,
    });

    return {
      message: 'Payment confirmed and booking updated successfully.',
      BookingId,
      paymentDetails,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw new Error('Payment confirmation failed.');
  }
}



  async getProfile(userId: string): Promise<UserEntity | null> {
    return this.userRepository.getProfile(userId);
  }

  async updateUserProfile(userId: string, profileData: Partial<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.updateUserProfile(userId, profileData);
  }

  async getPriceDetails(organizerId: string, selectedDate: Date): Promise<any> {
    const date = new Date(selectedDate);
    const dayOfWeek = date.toLocaleDateString('en-IN', { weekday: 'long' });
    const specificPrice = await this.bookingRepository.findPriceByDate(organizerId, date);

    if (specificPrice) {
      return specificPrice;
    }

    const weeklyPrice = await this.bookingRepository.findWeeklyPrice(organizerId, dayOfWeek);

    return weeklyPrice;
  }


}
