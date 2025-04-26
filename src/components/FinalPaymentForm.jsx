import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import PropTypes from "prop-types";
import { supabase } from "../supabaseClient";

const FinalPaymentForm = ({ orderId, amount, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [cardholderName, setCardholderName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  // Funcție pentru salvarea cardului în Supabase
  const saveCardInDatabase = async (paymentMethod) => {
    console.log("PaymentMethod primit:", paymentMethod);

    // Dacă nu avem niciun obiect, aruncăm eroare
    if (!paymentMethod) {
      throw new Error("PaymentMethod invalid primit pentru salvare.");
    }

    // Dacă paymentMethod este un string (ID-ul PaymentMethod), nu avem detaliile cardului
    if (typeof paymentMethod === "string") {
      const id = paymentMethod;
      const { error } = await supabase.from("saved_cards").insert([
        {
          card_id: id, // modificare: folosește "card_id" în loc de "payment_method_id"
          card_brand: null,
          card_last4: null,
          exp_month: null,
          exp_year: null,
        },
      ]);
      if (error) {
        console.error("Eroare la salvarea cardului în DB:", error.message);
      } else {
        console.log("Card salvat cu succes în DB!", id);
      }
      return;
    }

    // Dacă paymentMethod este un obiect dar fără proprietatea "card"
    if (!paymentMethod.card) {
      throw new Error("PaymentMethod invalid primit pentru salvare.");
    }
    const { id, card } = paymentMethod;
    const { error } = await supabase.from("saved_cards").insert([
      {
        card_id: id, // modificare: folosește "card_id" în loc de "payment_method_id"
        card_brand: card.brand,
        card_last4: card.last4,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
      },
    ]);
    if (error) {
      console.error("Eroare la salvarea cardului în DB:", error.message);
    } else {
      console.log("Card salvat cu succes în DB!");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!acceptedTerms) {
      setErrorMessage("Vă rugăm să acceptați termenii și condițiile.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const cardNumberElement = elements.getElement(CardNumberElement);

    try {
      if (saveCard) {
        // Apelăm endpoint-ul pentru SetupIntent
        const setupResponse = await fetch("/api/create-setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const setupData = await setupResponse.json();
        if (!setupResponse.ok || !setupData.clientSecret) {
          throw new Error(setupData.error || "Eroare la crearea SetupIntent.");
        }
        const setupClientSecret = setupData.clientSecret;
        console.log("SetupIntent Client Secret:", setupClientSecret);

        // Confirmăm SetupIntent pentru a salva cardul
        const { error: confirmError, setupIntent } =
          await stripe.confirmCardSetup(setupClientSecret, {
            payment_method: {
              card: cardNumberElement,
              billing_details: { name: cardholderName },
            },
          });
        if (confirmError) {
          throw new Error(confirmError.message);
        }
        console.log("SetupIntent primit:", setupIntent);

        if (!setupIntent || !setupIntent.payment_method) {
          throw new Error("SetupIntent nu a returnat un PaymentMethod valid.");
        }
        console.log(
          "PaymentMethod extras din SetupIntent:",
          setupIntent.payment_method
        );

        // Preluăm detaliile complete ale PaymentMethod-ului, dacă este necesar:
        let fullPaymentMethod = setupIntent.payment_method;
        if (typeof fullPaymentMethod === "string" || !fullPaymentMethod.card) {
          const retrieveResponse = await fetch("/api/retrieve-payment-method", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentMethodId: fullPaymentMethod }),
          });
          const retrievedData = await retrieveResponse.json();
          if (!retrieveResponse.ok || !retrievedData.card) {
            throw new Error(
              retrievedData.error || "Error retrieving PaymentMethod details."
            );
          }
          fullPaymentMethod = retrievedData;
        }
        console.log("Full PaymentMethod details:", fullPaymentMethod);

        await saveCardInDatabase(fullPaymentMethod);
      } else {
        // Fluxul standard pentru procesarea plății cu PaymentIntent
        const convertedAmount = Math.round(amount * 100);
        console.log("Amount convertit (în subunități):", convertedAmount);
        const paymentResponse = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: convertedAmount, orderId }),
        });
        const paymentData = await paymentResponse.json();
        if (!paymentResponse.ok || !paymentData.clientSecret) {
          throw new Error(
            paymentData.error || "Eroare la crearea PaymentIntent."
          );
        }
        const paymentClientSecret = paymentData.clientSecret;
        console.log("PaymentIntent Client Secret:", paymentClientSecret);

        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(paymentClientSecret, {
            payment_method: {
              card: cardNumberElement,
              billing_details: { name: cardholderName },
            },
          });
        if (confirmError) {
          throw new Error(confirmError.message);
        }
        console.log("Plată confirmată:", paymentIntent);
      }

      navigate(
        `/order-confirmation?orderId=${orderId}&email=${encodeURIComponent(
          cardholderName
        )}`
      );
    } catch (err) {
      console.error("Eroare la procesarea plății:", err.message);
      setErrorMessage(err.message);
    }
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm">
        <button
          onClick={onClose}
          className="absolute top-1 right-3 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        <form
          onSubmit={handleSubmit}
          className="mx-auto p-6 border rounded shadow bg-white"
        >
          <div className="mb-6">
            <div className="flex items-center space-x-7">
              <h3 className="text-xl font-bold text-sky-900">
                Plătește în siguranță
              </h3>
              <div className="flex items-center space-x-2 ml-16">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                  alt="Visa"
                  className="h-4"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-4"
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Nume deținător card
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder=""
              className="w-full h-10 p-2 border rounded bg-gray-100 shadow-sm focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Număr card</label>
            <div className="p-2 border rounded bg-gray-100 shadow-sm focus:outline-none">
              <CardNumberElement options={{ placeholder: " " }} />
            </div>
          </div>
          <div className="mb-4 flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Data expirării
              </label>
              <div className="p-2 border rounded bg-gray-100 shadow-sm focus:outline-none">
                <CardExpiryElement options={{ placeholder: "ll / aa" }} />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                CVC / CCV
              </label>
              <div className="p-2 border rounded bg-gray-100 shadow-sm focus:outline-none">
                <CardCvcElement options={{ placeholder: "3 cifre" }} />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Sumă: {amount ? amount.toFixed(2) : "0.00"} RON
            </p>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-400">
                Accept termenii și condițiile
              </span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-400">
                Salvează acest card pentru plăți viitoare
              </span>
            </label>
          </div>
          {errorMessage && (
            <div className="mb-4 text-red-600">{errorMessage}</div>
          )}
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 shadow-md transition duration-200 active:scale-95"
          >
            {isProcessing ? "Procesare..." : "Plătește"}
          </button>
        </form>
      </div>
    </div>
  );
};

FinalPaymentForm.propTypes = {
  orderId: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FinalPaymentForm;
