// import React from "react";
import PropTypes from "prop-types";
import { FaShoppingCart } from "react-icons/fa";

const CartButton = ({
  addedToCart,
  onAddToCart,
  onRemoveFromCart,
  className,
}) => {
  return (
    <button
      onClick={addedToCart ? onRemoveFromCart : onAddToCart}
      className={`transition-colors duration-200 transform active:scale-105 ${
        addedToCart
          ? "text-sky-900 hover:text-sky-700 active:text-sky-800"
          : "text-gray-400 hover:text-gray-600 active:text-gray-500"
      } ${className}`}
    >
      <FaShoppingCart
        className={addedToCart ? "fill-current" : "stroke-current"}
      />
    </button>
  );
};

CartButton.propTypes = {
  addedToCart: PropTypes.bool.isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onRemoveFromCart: PropTypes.func.isRequired,
  className: PropTypes.string,
};

CartButton.defaultProps = {
  className: "",
};

export default CartButton;
