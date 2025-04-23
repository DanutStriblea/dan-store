/* eslint-env node */
/* global process */

import dotenv from "dotenv";
dotenv.config({ path: process.cwd() + "/.env" });

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export default async function handler(req, res) {
  // Permite doar metoda POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { amount, orderId } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // suma în cele mai mici unități monetare (ex: bani)
      currency: "ron",
      metadata: { orderId },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Eroare la crearea PaymentIntent:", err);
    return res.status(500).json({ error: "Eroare la crearea PaymentIntent." });
  }
}
