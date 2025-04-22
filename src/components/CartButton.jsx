import PropTypes from "prop-types";
import { useContext, useRef } from "react";
import { CartContext } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";

const CartButton = ({
  product,
  quantity = 1,
  setQuantity,
  showText = true,
}) => {
  const { isInCart, addToCart, removeFromCart, resetQuantity } =
    useContext(CartContext);
  const inCart = isInCart(product.id);

  // Ref pentru containerul iconiței
  const iconRef = useRef(null);

  const handleCartClick = () => {
    if (inCart) {
      removeFromCart(product.id);
      resetQuantity(product.id); // Resetarea cantității în local storage
      setQuantity(1); // Resetarea cantității la 1 după eliminare
    } else {
      addToCart(product, quantity);
      setQuantity(1); // Resetarea cantității la 1 după adăugare
    }
  };

  // Funcția de animație pentru iconița de coș, cu timpii inițiali
  const animateIcon = () => {
    if (iconRef.current) {
      iconRef.current.style.transition = "transform 0.15s ease-out";
      iconRef.current.style.transform = "scale(1.1)";
      setTimeout(() => {
        iconRef.current.style.transform = "scale(0.9)";
      }, 150);
      setTimeout(() => {
        iconRef.current.style.transform = "scale(1.2)";
      }, 300);
      setTimeout(() => {
        iconRef.current.style.transform = "scale(1)";
      }, 600);
    }
  };

  return (
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        // Apelăm animația pe iconiță înainte de logica de click
        animateIcon();
        handleCartClick();
      }}
      onMouseUp={() => null}
      onTouchEnd={() => null}
      className={`flex items-center space-x-3 transition-transform duration-200 transform hover:scale-110 active:scale-125 ${
        inCart ? "text-sky-900" : "text-gray-400"
      }`}
    >
      {/* Învelim iconița într-un container cu dimensiuni fixe și ref */}
      <span
        ref={iconRef}
        className="inline-flex items-center justify-center"
        style={{
          width: "20px",
          height: "20px",
          overflow: "hidden",
          transformOrigin: "center",
        }}
      >
        <FaShoppingCart className="cursor-pointer w-full h-full active:text-sky-800" />
      </span>
      {showText && <span>{inCart ? "Remove from Cart" : "Add to Cart"}</span>}
    </button>
  );
};

CartButton.propTypes = {
  product: PropTypes.object.isRequired,
  quantity: PropTypes.number,
  setQuantity: PropTypes.func.isRequired,
  showText: PropTypes.bool,
};

export default CartButton;
