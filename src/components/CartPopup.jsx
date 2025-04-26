// CartPopup.jsx
import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { CartContext } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";

const CartPopup = ({ forceVisible }) => {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Dacă suntem pe pagina de coș, ascundem popup-ul
    if (location.pathname === "/cart") {
      setVisible(false);
      return;
    }

    // Dacă primim forțarea vizibilității (de la hover), o folosim
    if (typeof forceVisible !== "undefined") {
      setVisible(forceVisible);
    } else if (cartItems.length > 0) {
      // Comportamentul normal: afișează popup-ul pentru 4 secunde
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [cartItems, forceVisible, location.pathname]);

  if (!visible) return null;

  return (
    <div
      // Adăugăm și evenimente pentru popup, astfel încât dacă cursorul intră în popup,
      // acesta nu dispare (acestea sunt opționale, deoarece și containerul părinte din Header2 le gestionează)
      onMouseEnter={() => {
        if (typeof forceVisible !== "undefined") setVisible(true);
      }}
      onMouseLeave={() => {
        if (typeof forceVisible !== "undefined") setVisible(false);
      }}
      onClick={() => navigate("/cart")}
      className="fixed top-16 right-8 text-sky-950 bg-sky-50 border-2 border-gray-200 rounded shadow-lg p-6 cursor-pointer z-50 min-w-[250px]"
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
        className="bg-sky-900 text-white px-4 py-1.5 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-auto mx-auto block text-m mt-4"
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
