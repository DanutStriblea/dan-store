import { useContext, useState, useEffect } from "react";
import { FavoriteContext } from "../context/FavoriteContext";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import CartButton from "../components/CartButton";

const Favorite = () => {
  const { favoriteItems, removeFromFavorites } = useContext(FavoriteContext);
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Favoritele mele</h1>
      {favoriteItems.length > 0 ? (
        <div className="space-y-4">
          {favoriteItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center space-x-4">
                <Link to={`/product/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </Link>
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.price} RON</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CartButton
                  addedToCart={!!addedToCart[item.id]}
                  onAddToCart={() => handleAddToCart(item)}
                  onRemoveFromCart={() => handleRemoveFromCart(item)}
                  className="text-2xl" // Adaugă o clasă suplimentară pentru a mări butonul
                />
                <Link
                  to={`/product/${item.id}`}
                  className="bg-sky-900 text-white px-3 py-2 rounded-md"
                >
                  Detalii
                </Link>
                <button
                  onClick={() => removeFromFavorites(item.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md"
                >
                  Elimină
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">Nu ai produse favorite.</p>
      )}
    </div>
  );
};

export default Favorite;
