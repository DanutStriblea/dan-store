import { useState, useEffect, useContext, useRef } from "react";
import PropTypes from "prop-types";
import { FavoriteContext } from "../context/FavoriteContext";
import { useNavigate, useLocation } from "react-router-dom";

const FavoritePopup = ({ forceVisible }) => {
  const { favoriteItems } = useContext(FavoriteContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Folosim location.hash dacă există (hash routing) altfel location.pathname
  const currentRoute = location.hash ? location.hash : location.pathname;

  // Condiție care indică când nu se afișează popup-ul:
  const hidePopup =
    currentRoute.includes("/login") ||
    currentRoute.includes("/logout") ||
    currentRoute.includes("/order-confirmation") ||
    favoriteItems.length === 0;

  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timerRef = useRef(null);
  const prevFavoriteCountRef = useRef(favoriteItems.length);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 250); // Durata tranziției CSS
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  // Eliminăm logica care afișa popup-ul automat la schimbarea favoriteItems
  useEffect(() => {
    if (
      currentRoute.includes("/favorite") ||
      currentRoute.includes("/login") ||
      currentRoute.includes("/logout") ||
      currentRoute.includes("/order-confirmation")
    ) {
      setVisible(false);
      return;
    }
    prevFavoriteCountRef.current = favoriteItems.length; // Actualizăm referința fără a seta vizibilitatea
  }, [favoriteItems, currentRoute]);

  // Actualizează vizibilitatea în funcție de forceVisible
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

  if (!shouldRender || hidePopup) return null;

  return (
    <div
      onMouseEnter={() => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setVisible(true);
      }}
      onMouseLeave={() => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        timerRef.current = setTimeout(() => {
          setVisible(false);
          timerRef.current = null;
        }, 200); // Delay similar cu CartPopup
      }}
      onClick={() => navigate("/favorite")}
      className={`fixed top-16 right-8 text-sky-950 bg-slate-100 border-2 border-gray-200 rounded shadow-lg p-6 cursor-pointer z-[9000] min-w-[250px] 
                  transition-opacity duration-200 ${visible ? "opacity-200" : "opacity-0"}`}
    >
      <h3 className="text-sm font-semibold mb-2 text-left">Produse favorite</h3>
      <ul className="space-y-2">
        {favoriteItems.map((item) => {
          // Încearcă să preia imaginea din diverse proprietăți
          const imageSrc = item.products?.images
            ? item.products.images[0]
            : item.product?.images
              ? item.product.images[0]
              : item.images
                ? item.images[0]
                : "/default-image.png";
          const altText =
            item.products?.title ||
            item.product?.title ||
            item.title ||
            "Produs";
          // Derivă prețul din mai multe posibile proprietăți
          const price =
            item.products?.price || item.product?.price || item.price || null;
          return (
            <li
              key={item.product_id}
              className="flex items-center space-x-2 p-2 border-b border-gray-200"
            >
              <img
                src={imageSrc}
                alt={altText}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-800">
                  {item.products?.title ||
                    item.product?.title ||
                    item.title ||
                    "Produs"}
                </span>
                {price && (
                  <span className="text-xs text-gray-600">{price} RON</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate("/favorite");
        }}
        className="bg-sky-900 text-white px-4 py-1.5 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-auto mx-auto block text-sm mt-4"
      >
        Vezi favorite
      </button>
    </div>
  );
};

FavoritePopup.propTypes = {
  forceVisible: PropTypes.bool,
};

export default FavoritePopup;
