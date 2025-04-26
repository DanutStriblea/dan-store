// OrderDetails.jsx
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { AddressContext } from "../context/AddressContext";
import DeliveryMethod from "../components/DeliveryMethod";
import BillingDetails from "../components/BillingDetails";
import PaymentMethod from "../components/PaymentMethod";
import OrderSummary from "../components/OrderSummary";
import { supabase } from "../supabaseClient";

// Funcție pentru inițializarea orderId
const initializeOrderId = async (setOrderId, setLoading) => {
  let tempOrderId = localStorage.getItem("tempOrderId");
  if (!tempOrderId) {
    tempOrderId = uuidv4();
    localStorage.setItem("tempOrderId", tempOrderId);
    console.log("Generat un nou Order ID:", tempOrderId);
  } else {
    console.log("Folosim Order ID existent din localStorage:", tempOrderId);
  }

  const session = await supabase.auth.getSession();
  if (!session?.data?.session?.user) {
    console.error("Utilizatorul nu este valid, sesiune invalidă.");
    setLoading(false);
    return;
  }

  const { error } = await supabase.from("order_details").upsert({
    id: tempOrderId,
    user_id: session.data.session.user.id,
    delivery_address_id: null,
    billing_address_id: null,
  });

  if (error) {
    console.error("Eroare la upsert-ul order_details:", error.message);
  } else {
    console.log("Order details upsert cu succes pentru id:", tempOrderId);
  }
  setOrderId(tempOrderId);
  setLoading(false);
};

const OrderDetails = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    addresses,
    favoriteAddress,
    isAddressesReady,
    fetchAddresses,
    error,
  } = useContext(AddressContext);

  const [deliveryMethod, setDeliveryMethod] = useState("courier");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);

  // Stări legate de plată – acestea sunt setate din PaymentMethod.jsx prin props
  const [paymentMethod, setPaymentMethod] = useState("Card"); // Valoare default: "Card"
  const [cardType, setCardType] = useState("newCard"); // Presupunem implicit că se dorește introducerea unui nou card

  useEffect(() => {
    const forceSyncData = async () => {
      setLoading(true);
      try {
        await initializeOrderId(setOrderId, setLoading);
        await fetchAddresses();
        setRefreshKey((prevKey) => prevKey + 1);
      } catch (err) {
        console.error("Eroare în timpul actualizării datelor:", err.message);
      } finally {
        setLoading(false);
      }
    };

    forceSyncData();
  }, [fetchAddresses]);

  if (error) {
    return (
      <div className="p-4 text-center">
        Eroare: {error} – Te rugăm să te autentifici pentru a putea vedea
        adresele.
      </div>
    );
  }

  if (loading || !orderId || !isAddressesReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Funcția de navigare către FinalOrderDetails
  const handleNextStep = () => {
    console.log("Navigare către FinalOrderDetails:", {
      orderId,
      selectedAddress,
      billingAddress,
      paymentMethod,
      cardType,
    });

    if (
      !orderId ||
      !selectedAddress ||
      !billingAddress ||
      !paymentMethod ||
      !cardType
    ) {
      console.error("Datele comenzii sunt incomplete. Nu putem continua.");
      return;
    }

    // Citește din localStorage valorile persistente pentru metoda de plată
    const storedPaymentMethod =
      localStorage.getItem("paymentMethod") || paymentMethod;
    const storedCardType = localStorage.getItem("selectedCard") || cardType;
    const savedCardDetailsString = localStorage.getItem("savedCardDetails");

    let computedPaymentSummary = "";
    if (storedPaymentMethod === "Card") {
      if (storedCardType === "newCard") {
        computedPaymentSummary = "Plătește cu alt card";
      } else {
        if (savedCardDetailsString) {
          const cardDetails = JSON.parse(savedCardDetailsString);
          const formattedExp = new Date(
            Number(cardDetails.exp_year),
            Number(cardDetails.exp_month) - 1
          ).toLocaleString("ro-RO", { month: "long", year: "numeric" });
          computedPaymentSummary = `${cardDetails.card_brand} •••• ${cardDetails.last4} Expira in ${formattedExp}`;
        } else {
          computedPaymentSummary = "Card salvat";
        }
      }
    } else if (storedPaymentMethod === "Ramburs") {
      computedPaymentSummary = "Ramburs la curier";
    } else {
      computedPaymentSummary = storedPaymentMethod;
    }

    navigate("/final-order-details", {
      state: {
        orderId,
        orderData: {
          deliveryAddress: selectedAddress,
          billingAddress: billingAddress,
          // Dacă dorești, poți transmite și detaliile cardului selectat:
          selectedCardDetails: savedCardDetailsString
            ? JSON.parse(savedCardDetailsString)
            : null,
        },
        paymentMethod: storedPaymentMethod,
        cardType: storedCardType,
        paymentSummary: computedPaymentSummary,
      },
    });
  };

  return (
    <div
      key={refreshKey}
      className="container mx-auto px-4 sm:px-10 p-4 sm:p-10 max-w-screen-sm sm:max-w-screen-md"
    >
      <h1 className="text-2xl font-bold mb-4 text-sky-800">Detalii Comandă</h1>
      <DeliveryMethod
        orderId={orderId}
        deliveryMethod={deliveryMethod}
        setDeliveryMethod={setDeliveryMethod}
        selectedAddress={selectedAddress}
        addresses={addresses}
        favoriteAddress={favoriteAddress}
        setSelectedAddress={setSelectedAddress}
        fetchAddresses={fetchAddresses}
      />
      <BillingDetails
        billingAddress={billingAddress}
        addresses={addresses}
        orderId={orderId}
        setBillingAddress={setBillingAddress}
        fetchAddresses={fetchAddresses}
      />
      <PaymentMethod
        orderId={orderId}
        setPaymentMethod={setPaymentMethod}
        setCardType={setCardType}
      />
      <OrderSummary deliveryCost={25} orderId={orderId} />

      <button
        onClick={handleNextStep}
        className="mt-1 w-full bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
      >
        Pasul următor
      </button>
    </div>
  );
};

export default OrderDetails;
