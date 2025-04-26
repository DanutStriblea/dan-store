import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../stripeConfig";
import FinalPaymentForm from "../components/FinalPaymentForm";
import OrderSummary from "../components/OrderSummary";
import PaymentMethod from "../components/PaymentMethod";
import { CartContext } from "../context/CartContext";

/**
 * Helper care formatează un obiect de adresă într-un șir.
 */
const formatAddress = (addressObj) => {
  if (!addressObj) return "N/A";
  const { name, address, city, county } = addressObj;
  return `${name ? name + " - " : ""}${address ? address : ""}${
    city ? ", " + city : ""
  }${county ? " (" + county + ")" : ""}`;
};

const FinalOrderDetails = () => {
  // Preluăm articolele din coș
  const { cartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  // State pentru a ține evidența cardului salvat selectat
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);

  // Extragem datele din location.state
  const { orderId, orderData, paymentMethod, cardType } = location.state || {};

  if (!orderId || !orderData || !paymentMethod || !cardType) {
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

  // Calculăm suma totală
  const totalProductCost = cartItems.reduce(
    (sum, item) => sum + item.product_price,
    0
  );
  const deliveryCost = 25;
  const totalAmount = totalProductCost + deliveryCost;

  // Funcția de trimitere a comenzii
  const handleSubmitOrder = async () => {
    console.log("Trimitem comanda pentru orderId:", orderId);
    if (paymentMethod === "Card") {
      // Dacă se folosește un card salvat (și selectedSavedCard nu este "newCard")
      if (selectedSavedCard && selectedSavedCard !== "newCard") {
        try {
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
          // Aici se poate afișa un mesaj de eroare
        }
      }
      // Dacă se selectează "newCard", atunci se afișează formularul de plată
      else if (selectedSavedCard === "newCard") {
        setShowPaymentForm(true);
      }
    } else if (paymentMethod === "Ramburs") {
      console.log("Procesăm comanda Ramburs pentru orderId:", orderId);
      navigate(`/order-confirmation?orderId=${orderId}`);
    }
  };

  // Funcția pentru navigare la pagina de modificare a detaliilor
  const handleModifica = (section) => {
    navigate("/order-details", { state: { section } });
  };

  return (
    <div className="max-w-3xl mx-auto bg-blue-100 p-6">
      <h1 className="text-2xl text-sky-900 font-bold mb-6">Rezumat Comandă</h1>

      {/* Rândul superior cu cele 3 carduri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        <div className="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1">Metoda plată</h2>
            <p className="text-xs text-gray-500 mb-2">
              {paymentMethod === "Card"
                ? `Card (${cardType === "newCard" ? "nou" : "salvat"})`
                : paymentMethod}
            </p>
          </div>
          <button
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 active:scale-95 transition duration-200 text-sm"
            onClick={() => handleModifica("payment")}
          >
            Modifică
          </button>
        </div>
      </div>

      {/* Componenta PaymentMethod care oferă opțiuni de plată */}
      <PaymentMethod
        orderId={orderId}
        onSelectCard={(cardId) => setSelectedSavedCard(cardId)}
      />

      {/* Sumarul comenzii */}
      <div className="mb-6">
        <OrderSummary
          orderId={orderId}
          deliveryCost={deliveryCost}
          containerClass="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between"
          titleClass="text-l font-semibold mb-2"
        />
      </div>

      {/* Butonul de trimitere a comenzii */}
      <div className="flex justify-center mt-4">
        <button
          className="w-60 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
          onClick={handleSubmitOrder}
        >
          Trimite Comanda
        </button>
      </div>

      {/* Formularul Stripe pentru carduri noi */}
      {showPaymentForm &&
        paymentMethod === "Card" &&
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
    </div>
  );
};

export default FinalOrderDetails;
