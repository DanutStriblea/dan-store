import { useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const OrderConfirmation = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");

  // Extragem și email-ul din context
  const { user } = useContext(AuthContext);
  const email = user?.email || "adresa de e-mail nu a fost furnizată";

  // Generează un cod scurt pentru orderId
  const displayOrderId = orderId ? orderId.substring(0, 8) : "N/A";

  const navigate = useNavigate();

  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    clearCart(); // Golește coșul după confirmarea comenzii
    window.history.replaceState(null, "", window.location.href);
  }, []);

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
          <button
            onClick={() => navigate("/")}
            className="w-full bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
          >
            Înapoi acasă
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
