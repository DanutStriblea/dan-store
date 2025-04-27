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

  const { amount, orderId, paymentMethodId, customerId } = req.body;
  if (!amount || !orderId || !paymentMethodId || !customerId) {
    return res.status(400).json({
      error: "Missing amount, orderId, paymentMethodId, or customerId",
    });
  }

  try {
    // Creăm PaymentIntent folosind cardul salvat.
    // Este necesar ca PaymentMethod-ul să fie deja asociat unui customer în Stripe.
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // suma în subunități (centime)
      currency: "ron", // moneda folosită
      payment_method: paymentMethodId,
      customer: customerId, // folosește customerId din corpul cererii
      confirm: true,
      off_session: true,
    });

    return res.status(200).json({ paymentIntent });
  } catch (err) {
    console.error("Error creating PaymentIntent with saved card:", err);
    return res.status(500).json({ error: err.message });
  }
}
