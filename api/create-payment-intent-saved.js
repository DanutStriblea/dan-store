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
  } // Verificăm metoda de plată
  let paymentMethod;
  try {
    // Recuperăm informații despre metoda de plată
    paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    console.log("Metoda de plată recuperată:", paymentMethod.id);

    // Verificăm dacă metoda de plată este deja atașată clientului
    if (paymentMethod.customer && paymentMethod.customer !== customerId) {
      // Metoda este deja atașată altui client - nu putem utiliza această metodă de plată
      return res.status(400).json({
        error:
          "Acest card este asociat cu alt cont. Vă rugăm folosiți alt card.",
      });
    }
  } catch (error) {
    console.error("Eroare la verificarea metodei de plată:", error.message);
    return res.status(500).json({
      error:
        "Metodă de plată invalidă. Vă rugăm selectați alt card sau introduceți un card nou.",
    });
  }
  try {
    // Abordare diferită în funcție de situație:
    let paymentIntent;

    // Verificăm dacă metoda de plată este deja atașată clientului
    if (paymentMethod.customer === customerId) {
      console.log(
        "Metoda de plată este deja atașată clientului. Folosim direct."
      );

      // Folosim metoda simplificată când metoda de plată este deja atașată
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "ron",
        customer: customerId,
        payment_method: paymentMethodId,
        confirmation_method: "automatic",
        confirm: true,
        use_stripe_sdk: true,
      });
    } else {
      console.log(
        "Metoda de plată nu este atașată clientului. Creăm PaymentIntent fără atașare."
      );

      // Prima dată creăm un PaymentIntent fără a-l confirma
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "ron",
        customer: customerId,
        setup_future_usage: "off_session",
        metadata: { orderId },
      });

      // Apoi confirmăm PaymentIntent separat, specificând metoda de plată
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: paymentMethodId,
      });
    }

    return res.status(200).json({ paymentIntent });
  } catch (err) {
    console.error("Eroare la crearea/confirmarea PaymentIntent:", err);
    return res.status(500).json({ error: err.message });
  }
}
