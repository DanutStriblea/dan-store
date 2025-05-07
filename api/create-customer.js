import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";

// Replace process.env usage with a direct constant for STRIPE_SECRET_KEY
const STRIPE_SECRET_KEY = "your-default-stripe-key";
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const customer = await stripe.customers.create({ email });
    return res.status(200).json({ customerId: customer.id });
  } catch (err) {
    console.error("Error creating customer:", err);
    return res.status(500).json({ error: err.message });
  }
}
