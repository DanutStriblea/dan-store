import { useState, useContext } from "react";
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
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

// Folosim import.meta.env pentru variabilele de mediu în Vite
const API_URL = import.meta.env.VITE_API_URL || "";

const FinalPaymentForm = ({
  orderId,
  amount,
  orderData,
  onClose,
  onCardSaved,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [cardholderName, setCardholderName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  /* Funcția saveCardInDatabase:
     - Inserează full card-ul în tabela saved_cards.
     - Actualizează localStorage cu noile detalii ale cardului.
     - Calculează stringul de plată dorit.
     - Updatează recordul din submitted_orders (folosind orderId) pentru a seta coloana payment_method
       la noul string obținut. 
  */
  const saveCardInDatabase = async (paymentMethod) => {
    if (!paymentMethod || !paymentMethod.card) {
      throw new Error("Invalid payment method provided for saving.");
    }
    const { id, card } = paymentMethod;
    if (!card.brand || !card.last4 || !card.exp_month || !card.exp_year) {
      throw new Error("Incomplete card details. All fields are required.");
    }

    // Inserăm cardul în tabela saved_cards
    const { error } = await supabase.from("saved_cards").insert([
      {
        card_id: id,
        card_brand: card.brand,
        card_last4: card.last4,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        name_on_card: cardholderName,
      },
    ]);

    if (error) {
      console.error("Error saving card to database:", error.message);
    } else {
      console.log("Card successfully saved to database!");

      // Actualizez localStorage cu noile detalii ale cardului
      localStorage.setItem("selectedCard", id);
      localStorage.setItem(
        "savedCardDetails",
        JSON.stringify({
          card_brand: card.brand,
          card_last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
        })
      );

      // Calculez stringul de plată dorit (ex.: "mastercard •••• 4444 Expira în aprilie 2044")
      const formattedExp = new Date(
        Number(card.exp_year),
        Number(card.exp_month) - 1
      ).toLocaleString("ro-RO", { month: "long", year: "numeric" });
      const newPaymentMethodString = `${card.brand} •••• ${card.last4} Expira în ${formattedExp}`;

      // Update în tabelul submitted_orders pentru recordul cu id-ul orderId
      const { error: updateError } = await supabase
        .from("submitted_orders")
        .update({ payment_method: newPaymentMethodString })
        .eq("id", orderId);

      if (updateError) {
        console.error(
          "Error updating submitted_orders with new payment method:",
          updateError.message
        );
      } else {
        console.log(
          "submitted_orders updated successfully with new payment method."
        );
      }

      // Notificăm componenta părinte că un card a fost salvat
      if (typeof onCardSaved === "function") {
        onCardSaved();
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!cardholderName.trim()) {
      setErrorMessage("Numele deținătorului cardului este obligatoriu.");
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage("Vă rugăm să acceptați termenii și condițiile.");
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    const cardNumberElement = elements.getElement(CardNumberElement);
    try {
      if (saveCard) {
        const setupResponse = await fetch(
          `${API_URL}/api/create-setup-intent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user ? user.email : "" }),
          }
        );
        const setupData = await setupResponse.json();
        if (!setupResponse.ok || !setupData.clientSecret) {
          throw new Error(setupData.error || "Eroare la crearea SetupIntent.");
        }
        const setupClientSecret = setupData.clientSecret;
        console.log("SetupIntent Client Secret:", setupClientSecret);
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
        let fullPaymentMethod = setupIntent.payment_method;
        if (typeof fullPaymentMethod === "string" || !fullPaymentMethod.card) {
          const retrieveResponse = await fetch(
            `${API_URL}/api/retrieve-payment-method`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentMethodId: fullPaymentMethod }),
            }
          );
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
        const convertedAmount = Math.round(amount * 100);
        console.log("Amount convertit (în subunități):", convertedAmount);
        const paymentResponse = await fetch(
          `${API_URL}/api/create-payment-intent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: convertedAmount, orderId }),
          }
        );
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
      // Navigăm către pagina de Order Confirmation, transmițând datele comenzii prin state
      navigate(`/order-confirmation?orderId=${orderId}`, {
        state: {
          orderTotal: amount,
          productsOrdered: cartItems.map((item) => ({
            product_id: item.product_id,
            product_name: item.products?.title || "Unknown",
            quantity: item.quantity,
            price: item.product_price,
          })),
          name: orderData?.deliveryAddress?.name,
        },
      });
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
                  className="h-7 mt-1.5"
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
          <div className="mb-3">
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
  orderData: PropTypes.shape({
    deliveryAddress: PropTypes.shape({
      name: PropTypes.string,
      // se pot adăuga și alte câmpuri după necesitate
    }),
  }).isRequired,
  onClose: PropTypes.func,
  onCardSaved: PropTypes.func,
};

export default FinalPaymentForm;
