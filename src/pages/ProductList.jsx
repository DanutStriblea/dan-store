import { Link } from "react-router-dom"; // Importăm Link pentru a naviga către detaliile produsului
import PropTypes from "prop-types";
import { products } from "../data"; // Importăm lista de produse din data.js
import FavoriteButton from "../components/FavoriteButton"; // Importăm componenta FavoriteButton
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext"; // Importăm CartContext
import { FaShoppingCart } from "react-icons/fa"; // Importăm iconița de coș

const ProductList = ({ searchTerm }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext); // Folosim CartContext
  const [addedToCart, setAddedToCart] = useState({}); // Stare pentru a urmări produsele adăugate în coș

  useEffect(() => {
    const cartStatus = {};
    cartItems.forEach((item) => {
      cartStatus[item.id] = true;
    });
    setAddedToCart(cartStatus);
  }, [cartItems]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedToCart((prevState) => ({ ...prevState, [product.id]: true }));
  };

  const handleRemoveFromCart = (product) => {
    removeFromCart(product.id);
    setAddedToCart((prevState) => ({ ...prevState, [product.id]: false }));
  };

  const filteredProducts = searchTerm
    ? products.filter((product) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
        );
      })
    : products;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 p-3">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <div
            key={product.id}
            className="relative w-full h-full border rounded-md p-4 shadow hover:shadow-lg transition flex flex-col items-center justify-between bg-gray-100"
          >
            <Link
              to={`/product/${product.id}`}
              className="w-full h-full flex flex-col items-center justify-between"
            >
              <div className="w-full h-32 sm:h-40 lg:h-60 flex justify-center items-center">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <h3 className="text-lg font-semibold mt-2 text-center">
                {product.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 text-center">
                {product.description}
              </p>
              <p className="text-base font-bold mt-2 text-center">
                {product.price} RON
              </p>
            </Link>
            <div className="absolute bottom-2 right-2 flex space-x-2 items-center sm:bottom-2 sm:right-2">
              <FavoriteButton product={product} showText={false} />
              <button
                onClick={() =>
                  addedToCart[product.id]
                    ? handleRemoveFromCart(product)
                    : handleAddToCart(product)
                }
                className="text-sky-900 hover:text-sky-700 active:text-sky-800 transition-colors duration-200 transform active:scale-105"
              >
                <FaShoppingCart
                  className={
                    addedToCart[product.id] ? "fill-current" : "stroke-current"
                  }
                />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center col-span-full">Niciun produs găsit.</p>
      )}
    </div>
  );
};

ProductList.propTypes = {
  searchTerm: PropTypes.string, // Fără `.isRequired`
};

export default ProductList;
