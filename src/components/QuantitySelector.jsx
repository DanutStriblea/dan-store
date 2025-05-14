import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

const QuantitySelector = ({ id, initialQuantity = 1, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  // 🔄 Sincronizăm valoarea inițială când se schimbă `initialQuantity`
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const updateQuantityWithAnimation = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
      onQuantityChange(id, newQuantity); // Important: Pass the correct id
    }
  };

  const handleDecrement = () => {
    updateQuantityWithAnimation(quantity - 1);
  };

  const handleIncrement = () => {
    updateQuantityWithAnimation(quantity + 1);
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className="px-2 py-2.5 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Scade cantitatea"
        >
          <FaMinus size={12} />
        </button>

        <div className="w-10 px-1 py-1 text-center bg-white">
          <span className="font-medium">{quantity}</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= 100}
          className="px-2 py-2.5 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Crește cantitatea"
        >
          <FaPlus size={12} />
        </button>
      </div>
    </div>
  );
};

QuantitySelector.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialQuantity: PropTypes.number,
  onQuantityChange: PropTypes.func.isRequired, // Funcția de actualizare transmisă din `Cart.jsx`
};

export default QuantitySelector;
