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

app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
