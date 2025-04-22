import { useContext, useState, useEffect } from "react";
import { FavoriteContext } from "../context/FavoriteContext";
import { Link } from "react-router-dom";
import CartButton from "../components/CartButton";
import { supabase } from "../supabaseClient";

const Favorite = () => {
  const { favoriteItems, removeFromFavorites } = useContext(FavoriteContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Spinner strict pentru fetch

  // Fetch-ul produselor la inițializare
  useEffect(() => {
    const fetchProducts = async () => {
      if (!favoriteItems || favoriteItems.length === 0) {
        setProducts([]);
        setLoading(false); // Dezactivăm spinner-ul dacă lista e goală
        return;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in(
            "id",
            favoriteItems.map((item) => item.product_id)
          );

        if (error) {
          console.error("Eroare la fetch-ul produselor:", error);
        } else {
          setProducts(data || []); // Actualizăm lista de produse
        }
      } finally {
        setLoading(false); // Dezactivăm spinner-ul după fetch
      }
    };

    fetchProducts();
  }, [favoriteItems]); // Re-fetch doar când favoriteItems este modificat după inițializare

  // Gestionarea eliminării produselor
  const handleRemoveFromFavorites = async (productId) => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    ); // Actualizare UI locală

    await removeFromFavorites(productId).catch((error) => {
      console.error("Eroare la eliminarea produsului:", error);
    }); // Actualizare în baza de date
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl p-2">
        <h1 className="text-2xl font-bold mb-4">Favoritele mele</h1>

        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative w-full aspect-w-1 aspect-h-1 border rounded-md p-4 shadow hover:shadow-lg transition-transform duration-200 flex flex-col items-center justify-between bg-gray-100 pointer-events-auto"
              >
                <Link
                  to={`/product/${product.id}`}
                  className="w-full h-full flex flex-col items-center justify-between"
                >
                  <div className="w-full h-full flex justify-center items-center">
                    <img
                      src={product.images[0]}
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
                <div
                  className="absolute top-2 right-2 cursor-pointer text-3xl text-black bg-gray-100 p-2 rounded-full"
                  onClick={() => handleRemoveFromFavorites(product.id)}
                >
                  &times;
                </div>
                <div className="absolute bottom-2 right-2 flex space-x-2 items-center">
                  <CartButton
                    product={product}
                    quantity={1}
                    setQuantity={() => {}}
                    showText={false}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center col-span-full">Nu ai produse favorite.</p>
        )}
      </div>
    </div>
  );
};

export default Favorite;
