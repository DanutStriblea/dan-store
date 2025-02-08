import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return <h1 className="text-center mt-8">Coșul tău este gol.</h1>;
  }

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  const handleQuantityChange = (id, value) => {
    const newQuantity = Number(value);
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="w-full sm:max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl sm:text-3xl font-bold mb-3">
        Coșul tău de cumpărături
      </h1>
      <hr className="border-t-2 border-gray-200 mb-8" />

      <div className="space-y-4">
        {cartItems.map((item, index) => (
          <div key={item.id}>
            <div className="flex flex-col sm:flex-row items-start justify-between">
              <Link to={`/product/${item.id}`}>
                <div className="flex items-start mb-4 sm:mb-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain mr-4"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold">{item.title}</h2>
                    <p className="text-sm text-gray-700">{item.description}</p>
                  </div>
                </div>
              </Link>

              <div className="flex items-center justify-between w-full sm:w-auto space-x-4">
                <p className="text-gray-700 font-semibold">
                  {item.price * item.quantity} RON
                </p>

                <div className="flex items-center">
                  <label
                    htmlFor={`quantity-input-${item.id}`}
                    className="text-sm text-gray-700 mr-2"
                  >
                    Cantitate:
                  </label>
                  <input
                    type="number"
                    id={`quantity-input-${item.id}`}
                    name={`quantity-${item.id}`}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, e.target.value)
                    }
                    className="w-16 p-2 border rounded-md bg-gray-100"
                    min="1"
                  />
                </div>

                <button
                  className="bg-red-600 text-white px-2 py-2 rounded-md transform transition duration-250 hover:bg-red-700 active:scale-105 active:bg-red-800 w-24 sm:w-auto"
                  onClick={() => removeFromCart(item.id)}
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
          Preț Total: {calculateTotal()} RON
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mt-6">
        <button
          className="bg-sky-900 text-white px-3 py-2 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-full sm:w-auto mb-4 sm:mb-0"
          onClick={handleNavigateHome}
        >
          Înapoi la cumpărături
        </button>
        <button className="bg-sky-900 text-white px-3 py-2 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-full sm:w-auto">
          Comandă
        </button>
      </div>
    </div>
  );
};

export default Cart;
