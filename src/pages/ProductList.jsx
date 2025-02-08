import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { products } from "../data";
import FavoriteButton from "../components/FavoriteButton";
import CartButton from "../components/CartButton";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";

const ProductList = ({ searchTerm }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const [addedToCart, setAddedToCart] = useState({});

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
              <CartButton
                addedToCart={!!addedToCart[product.id]}
                onAddToCart={() => handleAddToCart(product)}
                onRemoveFromCart={() => handleRemoveFromCart(product)}
              />
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
  searchTerm: PropTypes.string,
};

export default ProductList;
