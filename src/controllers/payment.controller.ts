import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

// Initialize Stripe with test secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  //   apiVersion: "2025-8-27",
});

// Controller function
export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("[createPaymentIntent] Error:", error);
    res.status(500).json({ error: error.message });
  }
};
