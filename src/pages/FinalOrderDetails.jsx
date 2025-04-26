// FinalOrderDetails.jsx
import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../stripeConfig";
import FinalPaymentForm from "../components/FinalPaymentForm";
import OrderSummary from "../components/OrderSummary";
import { CartContext } from "../context/CartContext";

const formatAddress = (addressObj) => {
  if (!addressObj) return "N/A";
  const { name, address, city, county } = addressObj;
  return `${name ? name + " - " : ""}${address ? address : ""}${
    city ? ", " + city : ""
  }${county ? " (" + county + ")" : ""}`;
};

const FinalOrderDetails = () => {
  const { cartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Extragem datele din location.state – asigură-te că acestea conțin:
  // orderId, orderData, paymentMethod (ex: "Card" sau "Ramburs") și cardType (ex: "savedCard" sau "newCard")
  const { orderId, orderData, paymentMethod, cardType } = location.state || {};

  if (!orderId || !orderData || !paymentMethod || !cardType) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Informații lipsă pentru finalizarea comenzii
        </h1>
        <p>Ne pare rău, datele comenzii nu au fost transmise corect.</p>
        <button
          className="mt-4 bg-sky-800 text-white py-2 px-4 rounded"
          onClick={() => navigate("/order-details")}
        >
          Înapoi la Detalii Comandă
        </button>
      </div>
    );
  }

  const totalProductCost = cartItems.reduce(
    (sum, item) => sum + item.product_price,
    0
  );
  const deliveryCost = 25;
  const totalAmount = totalProductCost + deliveryCost;

  // Funcția de a construi textul pentru metoda de plată:
  const getPaymentText = () => {
    if (paymentMethod === "Card") {
      if (cardType === "newCard") {
        return "Plătește cu alt card";
      } else {
        // Pentru cardurile salvate, presupunem că orderData conține selectedCardDetails
        if (orderData.selectedCardDetails) {
          const { brand, last4, exp_month, exp_year } =
            orderData.selectedCardDetails;
          const formattedExp = new Date(
            Number(exp_year),
            Number(exp_month) - 1
          ).toLocaleString("ro-RO", { month: "long", year: "numeric" });
          return `${brand} •••• ${last4} Expira in ${formattedExp}`;
        } else {
          return "Card salvat";
        }
      }
    } else if (paymentMethod === "Ramburs") {
      return "Ramburs la curier";
    }
    return "";
  };

  const paymentText = getPaymentText();

  const handleSubmitOrder = async () => {
    console.log("Trimitem comanda pentru orderId:", orderId);
    if (paymentMethod === "Card" && cardType === "newCard") {
      setShowPaymentForm(true);
    } else if (paymentMethod === "Card" && cardType === "savedCard") {
      try {
        const selectedSavedCard = orderData.card_encrypted_data;
        if (!selectedSavedCard) {
          throw new Error("Nu a fost selectat niciun card salvat.");
        }
        const convertedAmount = Math.round(totalAmount * 100);
        const response = await fetch("/api/create-payment-intent-saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: convertedAmount,
            orderId,
            paymentMethodId: selectedSavedCard,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.error || "Eroare la procesarea plății cu cardul salvat."
          );
        }
        console.log("Plată procesată cu succes:", data.paymentIntent);
        navigate(`/order-confirmation?orderId=${orderId}`);
      } catch (err) {
        console.error("Eroare la procesarea plății:", err.message);
      }
    } else if (paymentMethod === "Ramburs") {
      console.log("Procesăm comanda Ramburs pentru orderId:", orderId);
      navigate(`/order-confirmation?orderId=${orderId}`);
    }
  };

  const handleModifica = (section) => {
    navigate("/order-details", { state: { section } });
  };

  return (
    <div className="max-w-3xl mx-auto bg-blue-100 p-6">
      <h1 className="text-2xl text-sky-900 font-bold mb-6">Rezumat Comandă</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Adresa livrare */}
        <div className="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1">Adresa livrare</h2>
            <p className="text-xs text-gray-500 mb-2">
              {formatAddress(orderData.deliveryAddress)}
            </p>
          </div>
          <button
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-100 transition duration-200 text-sm"
            onClick={() => handleModifica("delivery")}
          >
            Modifică
          </button>
        </div>
        {/* Adresa facturare */}
        <div className="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1">Adresa facturare</h2>
            <p className="text-xs text-gray-500 mb-2">
              {formatAddress(orderData.billingAddress)}
            </p>
          </div>
          <button
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-100 transition duration-200 text-sm"
            onClick={() => handleModifica("billing")}
          >
            Modifică
          </button>
        </div>
        {/* Metoda plată */}
        <div className="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1">Metoda plată</h2>
            <p className="text-xs text-gray-500 mb-2">{paymentText}</p>
          </div>
          <button
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-100 transition duration-200 text-sm"
            onClick={() => handleModifica("payment")}
          >
            Modifică
          </button>
        </div>
      </div>

      <div className="mb-6">
        <OrderSummary
          orderId={orderId}
          deliveryCost={deliveryCost}
          containerClass="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between"
          titleClass="text-l font-semibold mb-2"
        />
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="w-60 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
          onClick={handleSubmitOrder}
        >
          Trimite Comandă
        </button>
      </div>

      {showPaymentForm &&
        paymentMethod === "Card" &&
        cardType === "newCard" && (
          <div className="mt-6">
            <h2 className="text-l text-center text-gray-600 font-bold mb-2">
              Introduceți datele cardului
            </h2>
            <Elements stripe={stripePromise}>
              <FinalPaymentForm
                orderId={orderId}
                amount={totalAmount}
                onClose={() => setShowPaymentForm(false)}
              />
            </Elements>
          </div>
        )}
    </div>
  );
};

export default FinalOrderDetails;
