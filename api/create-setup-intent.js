/* eslint-env node */
/* global process */

import dotenv from "dotenv";
dotenv.config({ path: process.cwd() + "/.env" });

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export default async function handler(req, res) {
  // Acceptăm doar metodele POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Pentru un sistem de producție ar trebui să folosești customer-ul deja identificat
    // – aici, dacă clientul furnizează un email în corpul cererii, folosim acel email,
    // altfel folosim un email de test.
    const email = req.body.email || "test@example.com";
    const customer = await stripe.customers.create({ email });

    // Creăm SetupIntent pentru a salva metoda de plată,
    // asociind setup-ul cu customer-ul identificat și extinzând PaymentMethod-ul
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
      customer: customer.id,
      expand: ["payment_method"],
    });

    // Returnăm clientSecret-ul necesar pentru confirmarea pe client
    return res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error("Error creating SetupIntent:", err);
    return res.status(500).json({ error: "Error creating SetupIntent." });
  }
}
