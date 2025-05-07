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
    // Add a check to skip attaching the payment method if it is already attached
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer && paymentMethod.customer === customerId) {
      console.log(
        "Payment method is already attached to the customer. Skipping attachment."
      );
    } else {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    }
  } catch (error) {
    if (
      error.code !== "resource_already_exists" &&
      !error.message.includes("already attached") &&
      !error.message.includes("has already been attached")
    ) {
      console.error("Error attaching PaymentMethod:", error.message);
      return res.status(500).json({ error: error.message });
    }
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
