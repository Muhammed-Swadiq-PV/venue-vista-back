import Stripe from "stripe";
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-09-30.acacia",
})

export class StripePaymentService {
    static async createPaymentIntent(amount: number, currency: string, payment_method_id: string) {
      try {
        console.log('inside stripe')
        console.log('Payment Method ID:', payment_method_id);
        console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

        const paymentIntent = await stripe.paymentIntents.create({
          amount, // Amount in smallest currency unit (e.g., paise for INR)
          currency,
          payment_method: payment_method_id,
          confirm: true,
          payment_method_types: ['card'],
        //   automatic_payment_methods: {
        //     enabled: true, // Enables automatic payment methods
        // },
        });
        // console.log(paymentIntent, 'payment intent inside stripe payment')
        return paymentIntent;
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        throw new Error(`Stripe Error: ${error.message}`);
      }
    }
  
    static async confirmPayment(paymentIntentId: string) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
          return { success: true, paymentIntent };
        }
        return { success: false, paymentIntent };
      } catch (error: any) {
        throw new Error(`Stripe Error: ${error.message}`);
      }
    }

    static async retrievePaymentIntent(paymentIntentId: string) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
      } catch (error) {
        console.error('Error retrieving payment intent:', error);
        throw error;
      }
    }
    
  }