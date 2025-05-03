import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
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

  // State pentru datele comenzii: totalul și lista de produse
  const [orderTotal, setOrderTotal] = useState(null);
  const [productsOrdered, setProductsOrdered] = useState([]);

  // La montare, preluăm datele din location.state (dacă există) sau din localStorage
  useEffect(() => {
    if (
      location.state &&
      location.state.orderTotal &&
      location.state.productsOrdered
    ) {
      console.log("Preluăm datele din location.state");
      setOrderTotal(location.state.orderTotal);
      setProductsOrdered(location.state.productsOrdered);
      localStorage.setItem("orderTotal", location.state.orderTotal);
      localStorage.setItem(
        "productsOrdered",
        JSON.stringify(location.state.productsOrdered)
      );
    } else {
      console.log("Preluăm datele din localStorage");
      const storedOrderTotal = localStorage.getItem("orderTotal");
      const storedProductsOrdered = localStorage.getItem("productsOrdered");
      if (storedOrderTotal) {
        setOrderTotal(Number(storedOrderTotal));
      }
      if (storedProductsOrdered) {
        try {
          const parsedProducts = JSON.parse(storedProductsOrdered);
          setProductsOrdered(parsedProducts);
        } catch (error) {
          console.error(
            "Eroare la parsarea productsOrdered din localStorage:",
            error
          );
        }
      }
    }
    // Debug: afișăm valorile curente
    console.log(
      "orderTotal:",
      orderTotal,
      " productsOrdered:",
      productsOrdered
    );
  }, [location.state]);

  // Amânăm clearCart pentru a permite preluarea datelor de comandă
  useEffect(() => {
    // Amânăm golirea coșului cu 5 secunde
    const timer = setTimeout(() => {
      clearCart();
      // Opțional: curățăm și localStorage, dacă nu mai este nevoie de datele comenzii
      // localStorage.removeItem("orderTotal");
      // localStorage.removeItem("productsOrdered");
    }, 5000);
    return () => clearTimeout(timer);
  }, [clearCart]);

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

  // Trimite emailul de confirmare (doar dacă datele sunt complete)
  useEffect(() => {
    const sendConfirmationEmail = async () => {
      if (!orderTotal || productsOrdered.length === 0) {
        console.error("Datele comenzii sunt incomplete:", {
          orderTotal,
          productsOrdered,
        });
        return;
      }
      try {
        const response = await fetch("/api/send-confirmation-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            email,
            name: nameFromState || user?.name || "Client Fără Nume",
            order_number: orderId
              ? orderId.substring(0, 8)
              : "Comandă Necunoscută",
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
  }, [orderId, email, orderTotal, productsOrdered, nameFromState, user?.name]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-500"
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
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
          Vă mulțumim pentru comandă!
        </h1>
        <div className="mb-4">
          <p className="text-gray-700 text-center">
            V-am trimis o confirmare pe adresa de e-mail:
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
              className="w-40 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
            >
              Înapoi acasă
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="w-40 bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
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
