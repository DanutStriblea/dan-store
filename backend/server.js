/* eslint-env node */
require("dotenv").config(); // Încarcă variabilele din .env

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 4242;

// Middleware pentru parsarea JSON-ului și activarea CORS
app.use(express.json());
app.use(cors());

// Endpoint pentru crearea PaymentIntent (pentru plățile imediate)
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // suma, de exemplu, 12500 pentru 125.00 RON
      currency: "ron",
      metadata: { orderId },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Eroare la crearea PaymentIntent:", err);
    res.status(500).json({ error: "Eroare la crearea PaymentIntent." });
  }
});

// Endpoint pentru crearea SetupIntent (pentru salvarea cardurilor noi)
app.post("/api/create-setup-intent", async (req, res) => {
  try {
    // Extragem date din body; pentru exemplu, emailul este opțional
    const { email } = req.body;

    // Dacă dorești, poți crea sau atașa un customer în Stripe folosind emailul.
    // Dacă nu ai un customer deja, poți crea unul:
    // const customer = await stripe.customers.create({ email });
    // apoi, poți folosi customer.id în setupIntent

    // Pentru un caz de bază, vom crea SetupIntent-ul fără a specifica customer:
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
      // Dacă ai un customer:
      // customer: customer.id,
    });

    res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error("Eroare la crearea SetupIntent:", err);
    res.status(500).json({ error: "Eroare la crearea SetupIntent." });
  }
});

// Endpoint pentru recuperarea PaymentMethod
app.post("/api/retrieve-payment-method", async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    if (!paymentMethodId) {
      return res.status(400).json({ error: "Missing paymentMethodId" });
    }
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    res.status(200).json(paymentMethod);
  } catch (err) {
    console.error("Error retrieving PaymentMethod:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
