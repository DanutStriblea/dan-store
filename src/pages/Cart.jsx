import { useState, useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import QuantitySelector from "../components/QuantitySelector";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, resetQuantity } =
    useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext); // Verificăm dacă utilizatorul este autentificat
  const [isLoading, setIsLoading] = useState(true); // Starea pentru spinner
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      // Simulăm o întârziere de încărcare pentru exemplu
      setTimeout(() => setIsLoading(false), 100);
    };

    fetchCartItems();
  }, []);

  const handleQuantityChange = (id, quantity) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
    resetQuantity(productId);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.product_price, 0);
  };

  // Funcția de redirecționare la continuarea comenzii cu redirect dinamic
  const handleContinueOrder = () => {
    if (!isAuthenticated) {
      // Salvăm destinația dorită pentru redirect după login
      localStorage.setItem("redirectAfterLogin", "/order-details");
      // Navigăm către pagina de login
      navigate("/login");
    } else {
      navigate("/order-details");
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      )}

      <div className="container mx-auto p-3">
        {cartItems.length === 0 && !isLoading && (
          <div className="text-center mt-8">
            <h1 className="text-xl sm:text-3xl font-bold mb-3">
              Coșul tău este gol
            </h1>
            <hr className="border-t  border-gray-200 mb-8" />
            <Link
              to="/"
              className="bg-sky-900 text-white px-3 py-2 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-full sm:w-auto text-center"
            >
              Înapoi la cumpărături
            </Link>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            <div className="w-full sm:max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md col-span-full">
              <h1 className="text-xl sm:text-3xl font-bold mb-3">
                Coșul tău de cumpărături
              </h1>
              <hr className="border-t border-gray-200 mb-8" />

              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.product_id}`}>
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                      <Link to={`/product/${item.product_id}`}>
                        <div className="flex items-start mb-4 sm:mb-0">
                          <img
                            src={
                              item.products?.images
                                ? item.products.images[0]
                                : ""
                            }
                            alt={item.products?.title || "Product Image"}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain mr-4 transition-transform duration-200 hover:scale-105 active:scale-110"
                          />
                          <div className="flex flex-col">
                            <h2 className="text-lg font-bold">
                              {item.products?.title || "Product Title"}
                            </h2>
                            <p className="text-sm text-gray-700">
                              {item.products?.description ||
                                "Product Description"}
                            </p>
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between w-full sm:w-auto space-x-4">
                        <p className="text-gray-700 font-semibold">
                          {item.product_price} RON
                        </p>

                        <QuantitySelector
                          id={item.product_id}
                          initialQuantity={item.quantity}
                          onQuantityChange={handleQuantityChange}
                        />

                        <button
                          className="bg-red-600 text-white px-2 py-2 rounded-md transform transition duration-250 hover:bg-red-700 active:scale-105 active:bg-red-800 w-24 sm:w-auto"
                          onClick={() => handleRemoveFromCart(item.product_id)}
                        >
                          Șterge
                        </button>
                      </div>
                    </div>

                    {index < cartItems.length - 1 && (
                      <hr className="my-4 border-t border-gray-200" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-right">
                <h2 className="text-xl font-bold">
                  Cost produse: {calculateTotal()} RON
                </h2>
              </div>

              <div className="mt-2 text-right">
                <h2 className="text-l">Cost livrare: in pasul urmator</h2>
              </div>

              <div className="flex flex-col sm:flex-row justify-between mt-6">
                <Link
                  to="/"
                  className="bg-sky-900 text-white px-3 py-2 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-full sm:w-auto mb-4 sm:mb-0 text-center"
                >
                  Înapoi la cumpărături
                </Link>
                <button
                  onClick={handleContinueOrder}
                  className="bg-sky-900 text-white px-3 py-2 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-full sm:w-auto"
                >
                  Continua comanda
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
