import { useLocation } from "react-router-dom";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const OrderConfirmation = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");

  // Extrage email-ul din contextul de autentificare
  const { user } = useContext(AuthContext);
  const email = user?.email || "adresa de e-mail nu a fost furnizată";

  // Extrage numele transmis prin location.state (din FinalOrderDetails)
  const nameFromState = location.state?.name;

  // Codul afișat din orderId (primele 8 caractere)
  const displayOrderId = orderId ? orderId.substring(0, 8) : "N/A";

  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);

  // Forțăm scroll-ul la poziția 0 după montarea componentei, folosind setTimeout
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100);
  }, []);

  // Golește coșul după confirmarea comenzii
  useEffect(() => {
    clearCart();
    window.history.replaceState(null, "", window.location.href);
  }, []);

  // Previne revenirea pe pagina anterioară
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Folosim un ref pentru a preveni trimiterea dublă a emailului
  const emailSentRef = useRef(false);

  // Trimite emailul de confirmare (DOAR dacă avem orderId și email)
  useEffect(() => {
    const sendConfirmationEmail = async () => {
      try {
        const orderTotal = location.state?.orderTotal || 0;
        const productsOrdered = location.state?.productsOrdered || [];

        if (!orderTotal || productsOrdered.length === 0) {
          console.error("Datele comenzii sunt incomplete:", {
            orderTotal,
            productsOrdered,
          });
          return;
        }

        const response = await fetch("/api/send-confirmation-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            email,
            name: nameFromState || user?.name || "Client Fără Nume",
            order_number: orderId?.substring(0, 8) || "Comandă Necunoscută",
            order_total: orderTotal,
            created_at: new Date().toISOString(),
            products_ordered: productsOrdered,
          }),
        });

        if (!response.ok) {
          throw new Error("Eroare la trimiterea emailului de confirmare.");
        }

        console.log("✅ Email de confirmare trimis cu succes!");
      } catch (error) {
        console.error(
          "❌ Eroare la trimiterea emailului de confirmare:",
          error
        );
      }
    };

    if (orderId && email && !emailSentRef.current) {
      emailSentRef.current = true;
      sendConfirmationEmail();
    }
  }, [orderId, email]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 p-4">
      <div className="bg-white shadow-lg shadow-gray-400 rounded-lg p-8 max-w-lg w-full">
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-500 md:h-16 md:w-16"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-center text-green-600 mb-6 md:text-3xl">
          Vă mulțumim pentru comandă!
        </h1>
        <div className="mb-4">
          <p className="text-gray-700 text-center">
            O confirmare a fost trimisă pe adresa:
          </p>
          <p className="text-gray-700 text-center font-bold">{email}</p>
        </div>
        <div>
          <p className="text-gray-700 text-center">
            Numărul comenzii dumneavoastră este:
          </p>
          {orderId && (
            <p className="text-gray-700 text-center font-bold">
              {displayOrderId}
            </p>
          )}
        </div>
        <div className="flex justify-center mt-6">
          <div className="flex justify-between items-center w-full max-w-md mx-auto mt-6">
            <button
              onClick={() => navigate("/")}
              className="w-30 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
            >
              Înapoi acasă
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="w-30 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
            >
              Către comenzi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
