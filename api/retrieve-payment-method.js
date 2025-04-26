/* eslint-env node */
/* global process */
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { paymentMethodId } = req.body;
  if (!paymentMethodId) {
    return res.status(400).json({ error: "Missing paymentMethodId" });
  }

  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return res.status(200).json(paymentMethod);
  } catch (err) {
    console.error("Error retrieving PaymentMethod:", err);
    return res.status(500).json({ error: "Error retrieving PaymentMethod." });
  }
}
// This code defines an API endpoint that retrieves a payment method from Stripe using its ID.
// actualizezi apoi functia const handleSubmit din FinalPaymentForm.jsx pentru a apela acest endpoint
