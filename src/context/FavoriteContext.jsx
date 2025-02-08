import { createContext, useState } from "react";
import PropTypes from "prop-types"; // Importăm PropTypes

// Creăm contextul favorite
export const FavoriteContext = createContext();

const FavoriteProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]); // Starea pentru produsele favorite

  // Funcția pentru adăugarea produselor la favorite
  const addToFavorites = (product) => {
    setFavoriteItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems; // Dacă produsul există deja în favorite, nu facem nimic
      }
      return [...prevItems, product]; // Adăugăm produsul la lista de favorite
    });
  };

  // Funcția pentru eliminarea produselor din favorite
  const removeFromFavorites = (id) => {
    setFavoriteItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <FavoriteContext.Provider
      value={{ favoriteItems, addToFavorites, removeFromFavorites }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

FavoriteProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validăm prop-ul `children`
};

export default FavoriteProvider;
