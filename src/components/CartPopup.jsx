import { useState, useEffect, useContext, useRef } from "react";
import PropTypes from "prop-types";
import { CartContext } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";

const CartPopup = ({ forceVisible }) => {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  // visible controlează dacă popup-ul este activ (pentru opacitate)
  const [visible, setVisible] = useState(false);
  // shouldRender controlează dacă elementul trebuie montat în DOM
  const [shouldRender, setShouldRender] = useState(false);
  const timerRef = useRef(null);
  const prevCartCountRef = useRef(cartItems.length);

  // Effect pentru auto-popup declanșat de modificarea coșului (atunci când nu avem hover)
  useEffect(() => {
    if (location.pathname === "/cart") {
      setVisible(false);
      return;
    }
    if (!forceVisible) {
      if (cartItems.length !== prevCartCountRef.current) {
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setVisible(false);
          timerRef.current = null;
        }, 3000);
      }
      prevCartCountRef.current = cartItems.length;
    }
  }, [cartItems, location.pathname, forceVisible]);

  // Effect pentru a gestiona controlul prin hover
  useEffect(() => {
    if (forceVisible === true) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setVisible(true);
      return;
    }
    if (forceVisible === false) {
      setVisible(false);
    }
  }, [forceVisible]);

  // Effect pentru a menține elementul montat în DOM în timpul tranziției
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 250); // Durata tranziției CSS (300ms)
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div
      onMouseEnter={() => {
        // La intrarea mouse-ului, se anulează orice timer și se setează visible
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setVisible(true);
      }}
      onMouseLeave={() => {
        // La ieșirea mouse-ului, se aplică un delay de 1 secundă înainte de a seta visible la false
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        timerRef.current = setTimeout(() => {
          setVisible(false);
          timerRef.current = null;
        }, 1000);
      }}
      onClick={() => navigate("/cart")}
      className={`fixed top-16 right-8 text-sky-950 bg-sky-50 border-2 border-gray-200 rounded shadow-lg p-6 cursor-pointer z-50 min-w-[250px] 
                  transition-opacity duration-300 ${
                    visible ? "opacity-300" : "opacity-0"
                  }`}
    >
      <h3 className="text-sm font-semibold mb-2 text-left">Produse în coș</h3>
      <ul className="space-y-2">
        {cartItems.map((item) => (
          <li
            key={item.product_id}
            className="flex items-center space-x-2 p-2 border-b border-gray-200"
          >
            <img
              src={
                item.products?.images
                  ? item.products.images[0]
                  : "/default-image.png"
              }
              alt={item.products?.title || "Produs"}
              className="w-10 h-10 object-cover rounded"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-800">
                {item.products?.title}
              </span>
              <span className="text-xs text-gray-600">
                {item.product_price} RON
              </span>
              <span className="text-xs text-gray-600">x {item.quantity}</span>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate("/cart");
        }}
        className="bg-sky-900 text-white px-4 py-1.5 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-auto mx-auto block text-sm mt-4"
      >
        Mergi la cos
      </button>
    </div>
  );
};

CartPopup.propTypes = {
  forceVisible: PropTypes.bool,
};

export default CartPopup;
