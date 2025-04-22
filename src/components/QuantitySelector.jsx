import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa";

const QuantitySelector = ({ id, initialQuantity = 1, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔄 Sincronizăm valoarea inițială când se schimbă `initialQuantity`
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleQuantityChange = (e) => {
    const newQuantity = Number(e.target.value);
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
      onQuantityChange(id, newQuantity); // Actualizăm cantitatea în `Cart.jsx`
      setIsUpdating(true);
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);
    }
  };

  return (
    <div className="flex items-center">
      <label
        htmlFor={`quantity-select-${id}`}
        className="text-sm text-gray-700 mr-2"
      >
        Cantitate:
      </label>
      <select
        id={`quantity-select-${id}`}
        name={`quantity-${id}`}
        value={quantity}
        onChange={handleQuantityChange}
        className="w-14 p-2 border rounded-md bg-gray-100"
      >
        {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      {isUpdating && <FaSyncAlt className="ml-2 text-blue-500 animate-spin" />}
    </div>
  );
};

QuantitySelector.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialQuantity: PropTypes.number,
  onQuantityChange: PropTypes.func.isRequired, // Funcția de actualizare transmisă din `Cart.jsx`
};

export default QuantitySelector;
