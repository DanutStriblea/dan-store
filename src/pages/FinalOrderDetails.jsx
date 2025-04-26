import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../stripeConfig";
import FinalPaymentForm from "../components/FinalPaymentForm";
import OrderSummary from "../components/OrderSummary";
import PaymentMethod from "../components/PaymentMethod";
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
  // State pentru sumarul metodei de plată (ex: "Card (salvat)")
  const [paymentSummary, setPaymentSummary] = useState("");

  // Extragem datele din location.state: orderId, orderData, paymentMethod și cardType
  const {
    orderId,
    orderData,
    paymentMethod: initialPaymentMethod,
    cardType,
  } = location.state || {};

  if (!orderId || !orderData || !initialPaymentMethod || !cardType) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Informații lipsă pentru finalizarea comenzii
        </h1>
        <p>
          Ne pare rău, se pare că datele comenzii nu au fost transmise corect.
        </p>
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

  // Funcția de trimitere a comenzii
  const handleSubmitOrder = async () => {
    console.log("Trimitem comanda pentru orderId:", orderId);

    if (initialPaymentMethod === "Card" && cardType === "newCard") {
      // Pentru cardurile noi se afișează formularul de plată
      setShowPaymentForm(true);
    } else if (initialPaymentMethod === "Card" && cardType === "savedCard") {
      try {
        // Se presupune că în orderData există ID-ul cardului salvat în card_encrypted_data
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
    } else if (initialPaymentMethod === "Ramburs") {
      console.log(
        "Procesăm comanda și livrarea la curier pentru orderId:",
        orderId
      );
      navigate(`/order-confirmation?orderId=${orderId}`);
    }
  };

  const handleModifica = (section) => {
    navigate("/order-details", { state: { section } });
  };

  return (
    <div className="max-w-3xl mx-auto bg-blue-100 p-6">
      <h1 className="text-2xl text-sky-900 font-bold mb-6">Rezumat Comandă</h1>

      {/* Grid cu 3 carduri: Adresa livrare, Adresa facturare și Metoda plată */}
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
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 active:scale-95 transition duration-200 text-sm"
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
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 active:scale-95 transition duration-200 text-sm"
            onClick={() => handleModifica("billing")}
          >
            Modifică
          </button>
        </div>
        {/* Metoda plată (sate din PaymentMethod) */}
        <div className="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1">Metoda plată</h2>
            <p className="text-xs text-gray-500 mb-2">{paymentSummary}</p>
          </div>
          <button
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 active:scale-95 transition duration-200 text-sm"
            onClick={() => handleModifica("payment")}
          >
            Modifică
          </button>
        </div>
      </div>

      {/* Sumarul comenzii */}
      <div className="mb-6">
        <OrderSummary
          orderId={orderId}
          deliveryCost={deliveryCost}
          containerClass="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between"
          titleClass="text-l font-semibold mb-2"
        />
      </div>

      {/* Butonul "Trimite Comandă" */}
      <div className="flex justify-center mt-4">
        <button
          className="w-60 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
          onClick={handleSubmitOrder}
        >
          Trimite Comandă
        </button>
      </div>

      {/* Formularul Stripe pentru carduri noi (afișat doar dacă e cazul) */}
      {showPaymentForm &&
        initialPaymentMethod === "Card" &&
        cardType === "newCard" && (
          <div className="mt-6">
            <h2 className="text-l text-center text-gray-600 ml-2 font-bold mb-2">
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

      {/* Componenta PaymentMethod este redată aici pentru a actualiza sumarul, însă suma actualizată apare în gridul de mai sus */}
      <PaymentMethod orderId={orderId} onPaymentSelected={setPaymentSummary} />
    </div>
  );
};

export default FinalOrderDetails;
