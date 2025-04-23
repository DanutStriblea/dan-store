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
  try {
    // Creează SetupIntent pentru a salva metoda de plată
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session", // Folosește "off_session" dacă intenționezi să folosești cardul ulterior fără prezența utilizatorului; altfel poți folosi "on_session"
    });
    return res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error("Eroare la crearea SetupIntent:", err);
    return res.status(500).json({ error: "Eroare la crearea SetupIntent." });
  }
}
