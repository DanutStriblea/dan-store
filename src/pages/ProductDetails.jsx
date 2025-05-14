import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import FavoriteButton from "../components/FavoriteButton";
import QuantitySelector from "../components/QuantitySelector";
import { CartContext } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { cartItems, addToCart, removeFromCart, getQuantity, updateQuantity } =
    useContext(CartContext);

  const isInCart = cartItems.some((item) => item.product_id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      if (!id) {
        console.error("ID-ul produsului nu este definit:", id);
        navigate("/notfound");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Eroare la încărcarea produsului:", error);
        navigate("/notfound");
        return;
      }

      setProduct(data);
      // Folosim getQuantity pentru a seta cantitatea inițială, dar nu-l includem în dependințe
      setQuantity(getQuantity(id) || 1);
      setIsLoading(false);
    };

    fetchProduct();
    // Eliminăm getQuantity din lista de dependențe pentru a evita re-fetch-ul produsului
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-white">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return <h1 className="text-center mt-8">Produsul nu a fost găsit.</h1>;
  }

  const handleExit = () => {
    navigate(-1);
  };

  const handleQuantityChange = (id, value) => {
    setQuantity(value);
    updateQuantity(id, value);
  };

  const handleCartClick = () => {
    console.log("Adăugăm produsul cu cantitatea:", quantity);

    if (isInCart) {
      removeFromCart(product.id);
      setQuantity(1); // Resetează la 1 după eliminare din coș
    } else {
      if (quantity <= 0) {
        alert("Cantitatea trebuie să fie de cel puțin 1.");
        return;
      }

      addToCart(product, quantity);
      console.log("Produsul a fost adăugat cu cantitatea:", quantity);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleImageClick = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md relative">
      {/* Buton pentru ieșirea din pagina detaliilor */}
      <button
        className="absolute z-50 top-4 right-4 hover:text-gray-950 text-gray-700 font-bold py-2 px-4"
        onClick={handleExit}
      >
        ✕
      </button>

      {/* Modul Fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md shadow-md"
            onClick={closeFullscreen}
          >
            ✕
          </button>
          <div className="w-[90vw] h-[90vw] max-w-[800px] max-h-[800px] bg-gray-900 flex items-center justify-center rounded-md">
            <img
              src={product.images[currentImageIndex]}
              alt={product.title}
              className="w-full h-full object-contain rounded-md"
            />
          </div>
          <div className="flex items-center justify-center space-x-8 mt-4 lg:hidden">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md shadow-md"
              onClick={handlePrevImage}
            >
              &lt;
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md shadow-md"
              onClick={handleNextImage}
            >
              &gt;
            </button>
          </div>
          <button
            className="hidden lg:block absolute left-12 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-md shadow-md"
            onClick={handlePrevImage}
          >
            &lt;
          </button>
          <button
            className="hidden lg:block absolute right-12 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-md shadow-md"
            onClick={handleNextImage}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Conținut principal */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 overflow-y-auto">
        <div className="lg:w-2/3 relative">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l"
            onClick={handlePrevImage}
          >
            &lt;
          </button>
          <div
            className="w-full h-64 sm:h-96 md:h-[500px] lg:h-[550px] bg-gray-50 flex items-center justify-center rounded-md"
            onClick={handleImageClick}
          >
            <img
              src={product.images[currentImageIndex]}
              alt={product.title}
              className="h-[85%] md:h-[90%] lg:h-[95%] w-auto object-contain cursor-pointer"
            />
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
            onClick={handleNextImage}
          >
            &gt;
          </button>
          <p className="text-gray-700 mt-4">{product.description}</p>
        </div>
        <div className="w-full lg:w-1/3 lg:pl-8 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl font-bold mt-4 lg:mt-0">
            {product.title}
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-sky-700 mt-4">
            {product.price} RON
          </p>
          <div className="mt-4">
            <QuantitySelector
              id={product.id}
              initialQuantity={quantity}
              onQuantityChange={handleQuantityChange}
            />
          </div>
          <button
            className={`${
              isInCart
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                : "bg-sky-900 hover:bg-sky-800 active:bg-sky-700"
            } text-white px-3 py-2 rounded-md transform transition duration-250 active:scale-105 mt-4`}
            style={{ width: "45%" }}
            onClick={handleCartClick}
          >
            {isInCart ? "Șterge din coș" : "Adaugă în coș"}
          </button>
          <p className="text-sm text-gray-600 mt-4">
            Livrare gratuită pentru comenzile de peste 300 RON. Curier rapid
            disponibil.
          </p>
          <div className="flex items-center space-x-4 mt-4 ml-2">
            <FavoriteButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
