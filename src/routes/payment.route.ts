import express from "express";
import { createPaymentIntent } from "../controllers/payment.controller";

const paymentRoute = express.Router();

// POST /api/payments/create-payment-intent
paymentRoute.post("/create-payment-intent", createPaymentIntent);

export default paymentRoute;
