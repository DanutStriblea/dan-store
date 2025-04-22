import { createContext, useState } from "react";
import PropTypes from "prop-types";

// Creăm contextul pentru selectorul de cantitate
export const QuantityContext = createContext();

export const QuantityProvider = ({ children }) => {
  const [quantities, setQuantities] = useState({});

  const updateQuantity = (id, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: quantity,
    }));
  };

  return (
    <QuantityContext.Provider value={{ quantities, updateQuantity }}>
      {children}
    </QuantityContext.Provider>
  );
};

QuantityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
