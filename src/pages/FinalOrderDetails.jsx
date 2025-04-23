import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../stripeConfig";
import FinalPaymentForm from "../components/FinalPaymentForm";
import OrderSummary from "../components/OrderSummary";
import { CartContext } from "../context/CartContext";

/**
 * Helper care formatează un obiect de adresă într-un șir.
 * Se presupune că obiectul de adresă conține proprietățile:
 * - name
 * - address (strada)
 * - city
 * - county
 */
const formatAddress = (addressObj) => {
  if (!addressObj) return "N/A";
  const { name, address, city, county } = addressObj;
  return `${name ? name + " - " : ""}${address ? address : ""}${
    city ? ", " + city : ""
  }${county ? " (" + county + ")" : ""}`;
};

const FinalOrderDetails = () => {
  // Apelăm useContext la început pentru a nu apela Hook-uri condițional!
  const { cartItems } = useContext(CartContext);

  const location = useLocation();
  const navigate = useNavigate();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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

  // Calculăm totalul produselor din coș (presupunem că prețurile sunt deja în RON)
  const totalProductCost = cartItems.reduce(
    (sum, item) => sum + item.product_price,
    0
  );
  const deliveryCost = 25; // Costul livrării
  const totalAmount = totalProductCost + deliveryCost; // suma totală în RON

  // Funcția de navigare pentru butonul "Trimite Comanda"
  const handleSubmitOrder = () => {
    console.log("Trimitem comanda pentru orderId:", orderId);
    if (paymentMethod === "Card" && cardType === "newCard") {
      setShowPaymentForm(true);
    } else {
      console.log("Procesăm comanda pentru orderId:", orderId);
      // Adaugă logica pentru finalizarea comenzii (apel către backend etc.)
    }
  };

  // Funcția handleModifica: navighează la OrderDetails, trimițând secțiunea de editare
  const handleModifica = (section) => {
    navigate("/order-details", { state: { section } });
  };

  return (
    <div className="max-w-3xl mx-auto bg-blue-100 p-6">
      <h1 className="text-2xl text-sky-900 font-bold mb-6">Rezumat Comandă</h1>

      {/* Rândul superior: 3 carduri separate */}
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

      {/* Cardul full-width cu sumarul comenzii */}
      <div className="mb-6">
        <OrderSummary
          orderId={orderId}
          deliveryCost={deliveryCost}
          containerClass="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between"
          titleClass="text-l font-semibold mb-2"
        />
      </div>

      {/* Butonul "Trimite Comanda" */}
      <div className="flex justify-center mt-4">
        <button
          className="w-60 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
          onClick={handleSubmitOrder}
        >
          Trimite Comanda
        </button>
      </div>

      {/* Formularul Stripe pentru datele cardului */}
      {showPaymentForm && paymentMethod === "Card" && (
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
