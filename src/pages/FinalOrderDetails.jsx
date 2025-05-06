/* global process */
import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../stripeConfig";
import FinalPaymentForm from "../components/FinalPaymentForm";
import OrderSummary from "../components/OrderSummary";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

// Configurare URL API – se folosește "http://localhost:4242" dacă variabila nu este setată
const API_URL =
  (typeof process !== "undefined" && process.env.REACT_APP_API_URL) ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4242";

const formatAddress = (addressObj) => {
  if (!addressObj) return "N/A";
  const { name, address, city, county } = addressObj;
  return `${name ? name + " - " : ""}${address ? address : ""}${
    city ? ", " + city : ""
  }${county ? " (" + county + ")" : ""}`;
};

const FinalOrderDetails = () => {
  const { cartItems } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Extragem datele din location.state transmise din OrderDetails.jsx
  const { orderId, orderData, paymentMethod, cardType, paymentSummary } =
    location.state || {};

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

  const totalProductCost = cartItems.reduce(
    (sum, item) => sum + item.product_price,
    0
  );
  const deliveryCost = 25;
  const totalAmount = totalProductCost + deliveryCost;

  const handleSubmitOrder = async () => {
    // Verificăm că utilizatorul este autentificat
    if (!user?.id) {
      console.error(
        "Utilizatorul nu este autentificat. Nu se poate plasa comanda."
      );
      return;
    }

    // Construim detaliile plății, folosind datele cardului salvat dacă există
    const storedCardDetailsString = localStorage.getItem("savedCardDetails");
    let paymentMethodDetails = paymentMethod;
    if (paymentMethod === "Card" && storedCardDetailsString) {
      try {
        const cardDetails = JSON.parse(storedCardDetailsString);
        if (
          cardDetails &&
          cardDetails.brand &&
          cardDetails.last4 &&
          cardDetails.exp_month &&
          cardDetails.exp_year
        ) {
          const formattedExp = new Date(
            Number(cardDetails.exp_year),
            Number(cardDetails.exp_month) - 1
          ).toLocaleString("ro-RO", { month: "long", year: "numeric" });
          paymentMethodDetails = `${cardDetails.brand} •••• ${cardDetails.last4} Expira în ${formattedExp}`;
        } else {
          console.error(
            "Card details are incomplete or missing required fields:",
            cardDetails
          );
        }
      } catch (error) {
        console.error(
          "Error parsing savedCardDetails from localStorage:",
          error
        );
      }
    }

    // Generăm un număr de comandă unic folosind o componentă din orderId și timestamp-ul actual
    const orderNumber = orderId.substring(0, 8) + "-" + Date.now();

    const orderDataToInsert = {
      id: uuidv4(),
      user_id: user.id,
      email: user.email,
      name: orderData?.deliveryAddress?.name || "Unknown User",
      order_number: orderNumber,
      phone_number: orderData?.deliveryAddress?.phone_number || "Unknown Phone",
      delivery_county: orderData?.deliveryAddress?.county || "Unknown County",
      delivery_city: orderData?.deliveryAddress?.city || "Unknown City",
      delivery_address:
        orderData?.deliveryAddress?.address || "Unknown Address",
      billing_county: orderData?.billingAddress?.county || "Unknown County",
      billing_city: orderData?.billingAddress?.city || "Unknown City",
      billing_address: orderData?.billingAddress?.address || "Unknown Address",
      payment_method: paymentMethodDetails,
      products_ordered: JSON.stringify(
        cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.products?.title || "Unknown",
          quantity: item.quantity,
          price: item.product_price,
        }))
      ),
      order_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      delivery_cost: deliveryCost,
      order_total: totalAmount,
      created_at: new Date().toISOString(),
    };

    // Upsert în tabelul submitted_orders din Supabase
    try {
      const { error } = await supabase
        .from("submitted_orders")
        .upsert(orderDataToInsert);
      if (error) {
        throw new Error(`Eroare la salvarea comenzii: ${error.message}`);
      }
      console.log("Comanda a fost salvată cu succes în baza de date.");
    } catch (err) {
      console.error("Eroare la salvarea comenzii:", err.message);
      return;
    }

    // Tratarea cazurilor de plată
    if (paymentMethod === "Card" && cardType === "newCard") {
      // Pentru plata cu un card nou, afișăm formularul Stripe
      setShowPaymentForm(true);
    } else if (paymentMethod === "Card" && cardType !== "newCard") {
      // Pentru plata cu cardul salvat, avem nevoie de un Stripe Customer valid.
      let customerId = user?.stripeCustomerId;
      if (!customerId) {
        // Dacă nu există, apelăm endpoint-ul pentru a crea un client Stripe
        try {
          const createCustomerResponse = await fetch(
            `${API_URL}/api/create-customer`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email }),
            }
          );
          const createCustomerData = await createCustomerResponse.json();
          if (!createCustomerResponse.ok || !createCustomerData.customerId) {
            throw new Error(
              createCustomerData.error || "Eroare la crearea clientului Stripe."
            );
          }
          customerId = createCustomerData.customerId;
          // Aici poți actualiza și contextul utilizatorului în Supabase cu noul customerId dacă este necesar
        } catch (error) {
          console.error("Eroare la crearea clientului Stripe:", error.message);
          return;
        }
      }
      // Continuăm cu plata folosind cardul salvat
      try {
        const selectedSavedCard = cardType; // cardType conține id-ul cardului salvat
        if (!selectedSavedCard) {
          throw new Error("Nu a fost selectat niciun card salvat.");
        }
        const convertedAmount = Math.round(totalAmount * 100);
        const response = await fetch(
          `${API_URL}/api/create-payment-intent-saved`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: convertedAmount,
              orderId,
              paymentMethodId: selectedSavedCard,
              customerId,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.error || "Eroare la procesarea plății cu cardul salvat."
          );
        }
        console.log("Plată procesată cu succes:", data.paymentIntent);
        navigate(`/order-confirmation?orderId=${orderId}`, {
          state: {
            orderTotal: totalAmount,
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
      }
    } else if (paymentMethod === "Ramburs") {
      // Pentru plata ramburs, navigăm către pagina de confirmare
      console.log("Procesăm comanda Ramburs pentru orderId:", orderId);
      navigate(`/order-confirmation?orderId=${orderId}`, {
        state: {
          orderTotal: totalAmount,
          productsOrdered: cartItems.map((item) => ({
            product_id: item.product_id,
            product_name: item.products?.title || "Unknown",
            quantity: item.quantity,
            price: item.product_price,
          })),
          name: orderData?.deliveryAddress?.name,
        },
      });
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
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 transition duration-200 text-sm"
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
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 transition duration-200 text-sm"
            onClick={() => handleModifica("billing")}
          >
            Modifică
          </button>
        </div>

        {/* Metoda plată */}
        <div className="p-4 border rounded-md bg-gray-100 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1">Metoda plată</h2>
            <p className="text-xs text-gray-500 mb-2">
              {paymentSummary
                ? paymentSummary
                : paymentMethod === "Card"
                  ? `Card (${cardType === "newCard" ? "nou" : "salvat"})`
                  : paymentMethod}
            </p>
          </div>
          <button
            className="mt-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 transition duration-200 text-sm"
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

      {/* Butonul "Trimite Comandă" */}
      <div className="flex justify-center mt-4">
        <button
          className="w-60 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
          onClick={handleSubmitOrder}
        >
          Trimite Comandă
        </button>
      </div>

      {/* Formularul Stripe pentru carduri noi (afișat doar dacă s-a ales "newCard") */}
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
                orderData={orderData}
                onClose={() => setShowPaymentForm(false)}
              />
            </Elements>
          </div>
        )}
    </div>
  );
};

export default FinalOrderDetails;
