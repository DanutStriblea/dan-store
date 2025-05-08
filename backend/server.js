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
      amount, // de exemplu, 12500 pentru 125.00 RON
      currency: "ron",
      metadata: { orderId },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Eroare la crearea PaymentIntent:", err);
    res.status(500).json({ error: "Eroare la crearea PaymentIntent." });
  }
});

// Endpoint pentru crearea SetupIntent (ptsalvarea cardurilor noi)
app.post("/api/create-setup-intent", async (req, res) => {
  try {
    const { email } = req.body;

    // Opțional: se poate atașa sau crea un customer în Stripe aici
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

// Endpoint pentru trimiterea emailului de confirmare a comenzii
app.post("/api/send-confirmation-email", async (req, res) => {
  try {
    // Se așteaptă un obiect "order" în corpul cererii
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

// Endpoint pentru procesarea plății cu cardul salvat
app.post("/api/create-payment-intent-saved", async (req, res) => {
  const { amount, orderId, paymentMethodId, customerId } = req.body;

  if (!amount || !orderId || !paymentMethodId || !customerId) {
    return res.status(400).json({
      error: "Missing amount, orderId, paymentMethodId, or customerId",
    });
  }

  // Înainte de a crea PaymentIntent, se încearcă atașarea PaymentMethod-ului la client
  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  } catch (error) {
    // Dacă PaymentMethod-ul este deja atașat, se poate ignora eroarea
    if (
      error.code !== "resource_already_exists" &&
      !error.message.includes("already attached")
    ) {
      console.error("Error attaching PaymentMethod:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // suma în subunități (de exemplu, centime)
      currency: "ron",
      payment_method: paymentMethodId,
      customer: customerId,
      confirm: true,
      off_session: true,
    });

    return res.status(200).json({ paymentIntent });
  } catch (err) {
    console.error("Error creating PaymentIntent with saved card:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint pentru crearea unui client în Stripe
app.post("/api/create-customer", async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
