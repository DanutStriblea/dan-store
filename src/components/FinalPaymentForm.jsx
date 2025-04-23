import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importăm useNavigate
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import PropTypes from "prop-types";

const CustomPaymentForm = ({ orderId, amount, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate(); // Inițializez hook-ul useNavigate

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [cardholderName, setCardholderName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
      // Convertim amount la bani (Stripe cere ca suma să fie în subunități)
      const convertedAmount = Math.round(amount * 100);
      console.log("Amount convertit în bani:", convertedAmount);

      // Apel către backend pentru a crea PaymentIntent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: convertedAmount, orderId }),
      });

      const data = await response.json();

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || "Eroare la crearea PaymentIntent.");
      }

      const clientSecret = data.clientSecret;
      console.log("Client Secret primit:", clientSecret);

      // Confirmă plata cu Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: cardholderName,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      console.log("Plată confirmată:", paymentIntent);

      // Redirecționează utilizatorul către pagina de confirmare folosind useNavigate
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
      {/* Overlay cu fundal întunecat și efect de blur */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      {/* Containerul popup-ului; lățime puțin mai îngustă */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Butonul "X" în dreapta sus */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>

        <form
          onSubmit={handleSubmit}
          className="mx-auto p-6 border rounded shadow bg-white"
        >
          {/* Antet: Text și logo-uri aliniate */}
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

CustomPaymentForm.propTypes = {
  orderId: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomPaymentForm;
