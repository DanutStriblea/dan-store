import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { products } from "../data";
import FavoriteButton from "../components/FavoriteButton";
import { CartContext } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const foundProduct = products.find(
      (product) => product.id === parseInt(id)
    );
    setProduct(foundProduct);
  }, [id]);

  if (!product) {
    return <h1 className="text-center mt-8">Produsul nu a fost găsit.</h1>;
  }

  const handleExit = () => {
    navigate(-1);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md relative">
      <button
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        onClick={handleExit}
      >
        ✕
      </button>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-8 overflow-y-auto">
        <div className="md:w-2/3">
          <div className="w-full h-64 sm:h-96 md:h-[500px] lg:h-[550px] bg-gray-50 flex items-center justify-center rounded-md">
            <img
              src={product.image}
              alt={product.title}
              className="h-[85%] md:h-[90%] lg:h-[95%] w-auto object-contain"
            />
          </div>
          <p className="text-gray-700 mt-4">{product.description}</p>
        </div>
        <div className="md:w-1/3 md:pl-8 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl font-bold mt-4 md:mt-0">
            {product.title}
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-sky-700 mt-4">
            {product.price} RON
          </p>
          <div className="mt-4">
            <label
              htmlFor={`quantity-input-${product.id}`}
              className="text-sm text-gray-700"
            >
              Cantitate:
            </label>
            <input
              type="number"
              id={`quantity-input-${product.id}`}
              name={`quantity-${product.id}`}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 ml-2 p-2 border rounded-md bg-gray-100"
              min="1"
            />
          </div>
          <button
            className="bg-sky-900 text-white px-3 py-2 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 mt-4"
            onClick={handleAddToCart}
          >
            Adaugă în coș
          </button>
          <p className="text-sm text-gray-600 mt-4">
            Livrare gratuită pentru comenzile de peste 300 RON. Curier rapid
            disponibil.
          </p>
          <FavoriteButton product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
