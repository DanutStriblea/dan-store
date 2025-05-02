/* eslint-env node */
require("dotenv").config(); // Încarcă variabilele din .env

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Importă funcția de trimitere a emailului de confirmare creată cu Resend
const sendConfirmationEmail = require("./sendConfirmationEmail");

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
    const { email } = req.body;

    // Opțional: pune aici logica pentru atașarea sau crearea unui customer în Stripe
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
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

// Endpoint nou pentru trimiterea emailului de confirmare a comenzii
app.post("/api/send-confirmation-email", async (req, res) => {
  try {
    // Se așteaptă un obiect "order" în corpul request-ului
    const order = req.body;
    console.log("Date primite pentru trimiterea emailului:", order);
    const response = await sendConfirmationEmail(order);
    console.log("Răspuns de la funcția sendConfirmationEmail:", response);
    res.status(200).json({ message: "Email de confirmare trimis cu succes!" });
  } catch (error) {
    console.error("Eroare la trimiterea emailului de confirmare:", error);
    res
      .status(500)
      .json({ error: "Eroare la trimiterea emailului de confirmare." });
  }
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
