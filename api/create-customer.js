/* eslint-env node */
/* global process */

import dotenv from "dotenv";
dotenv.config({ path: process.cwd() + "/.env" });

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
    console.error("Eroare la crearea clientului Stripe:", err);
    return res.status(500).json({ error: err.message });
  }
}
