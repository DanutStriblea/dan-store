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

  // Verificăm dacă avem ID-uri de adrese salvate în localStorage
  const savedDeliveryId = localStorage.getItem("selected_delivery_address_id");
  const savedBillingId = localStorage.getItem("selected_billing_address_id");

  // Dacă avem ID-uri salvate, le includem în upsert
  const { error } = await supabase.from("order_details").upsert({
    id: tempOrderId,
    user_id: session.data.session.user.id,
    delivery_address_id: savedDeliveryId || null,
    billing_address_id: savedBillingId || null,
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
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [cardType, setCardType] = useState("newCard");
  const [showError, setShowError] = useState(false);

  const { isAddressesReady, fetchAddresses, deliveryAddress, billingAddress } =
    useContext(AddressContext);

  // Efect pentru a reseta mesajul de eroare când adresele devin disponibile
  useEffect(() => {
    if (deliveryAddress && billingAddress && showError) {
      setShowError(false);
    }
  }, [deliveryAddress, billingAddress, showError]);

  useEffect(() => {
    const forceSyncData = async () => {
      setLoading(true);
      try {
        // Inițializăm ID-ul comenzii
        await initializeOrderId(setOrderId, setLoading);

        // Încărcăm adresele
        const adrese = await fetchAddresses();

        // După încărcarea adreselor, verificăm dacă avem adrese valide
        if (!adrese || adrese.length === 0) {
          // Dacă nu avem adrese, ștergem referințele din localStorage
          localStorage.removeItem("selected_delivery_address_id");
          localStorage.removeItem("selected_billing_address_id");
          console.log(
            "Nu există adrese în baza de date. Resetăm selecțiile anterioare."
          );
        }

        // Actualizăm cheia de refresh pentru a forța re-renderarea componentei
        setRefreshKey((prevKey) => prevKey + 1);
      } catch (err) {
        console.error("Eroare în timpul actualizării datelor:", err.message);
      } finally {
        setLoading(false);
      }
    };

    forceSyncData();
  }, [fetchAddresses]);

  if (loading || !orderId || !isAddressesReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleNextStep = () => {
    if (
      !orderId ||
      !deliveryAddress ||
      !billingAddress ||
      !paymentMethod ||
      !cardType
    ) {
      console.error("Datele comenzii sunt incomplete. Nu putem continua.");
      setShowError(true); // Activăm afișarea mesajului de eroare
      // Facem scroll la începutul paginii pentru a vedea eroarea
      window.scrollTo({
        top: document.querySelector("button").offsetTop - 50,
        behavior: "smooth",
      });
      return;
    }

    // Resetăm starea de eroare
    setShowError(false);

    // Dacă am ajuns aici, înseamnă că datele sunt complete, resetăm eroarea
    setShowError(false);
    let computedPaymentSummary = "";
    const storedPaymentMethod =
      localStorage.getItem("paymentMethod") || paymentMethod;
    const storedCardType = localStorage.getItem("selectedCard") || cardType;
    const savedCardDetailsString = localStorage.getItem("savedCardDetails");

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
          computedPaymentSummary = `${cardDetails.card_brand} •••• ${cardDetails.card_last4} Expira in ${formattedExp}`;
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
          deliveryAddress,
          billingAddress,
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
      <div>
        <DeliveryMethod
          orderId={orderId}
          deliveryMethod="courier"
          setDeliveryMethod={() => {}}
        />
      </div>
      <BillingDetails orderId={orderId} fetchAddresses={fetchAddresses} />
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

      {showError && (
        <p className="text-red-600 text-lg mt-3 text-center">
          Trebuie să adaugi o adresă de livrare.
        </p>
      )}
    </div>
  );
};

export default OrderDetails;
