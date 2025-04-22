import { Link, useLocation } from "react-router-dom"; // Importăm Link pentru navigare și useLocation pentru obținerea informațiilor despre URL.
import { useState, useEffect } from "react"; // Hook-urile React pentru stări și efecte.
import PropTypes from "prop-types"; // Pentru validarea tipurilor de prop-uri transmise.
import { supabase } from "../supabaseClient"; // Importăm clientul Supabase pentru a accesa baza de date.
import FavoriteButton from "../components/FavoriteButton"; // Componenta pentru gestionarea articolelor favorite.
import CartButton from "../components/CartButton"; // Componenta pentru gestionarea coșului de cumpărături.
import Spinner from "../components/Spinner"; // Importăm spinner-ul

const ProductList = ({ searchTerm }) => {
  // Stările locale ale componentei
  const [products, setProducts] = useState([]); // Stocăm lista de produse adusă de la baza de date.
  const [quantities, setQuantities] = useState({}); // Gestionăm cantitățile pentru produsele selectate.
  const [isLoading, setIsLoading] = useState(true); // Stare pentru încărcare.

  // Hook-ul useLocation pentru a obține informații despre URL, inclusiv parametrii din query string.
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search); // Parsează parametrii din query string (ex. ?gender=male).
  const genderFilter = queryParams.get("gender"); // Filtrare în funcție de gen (dacă este specificat în query string).
  const minPrice = parseInt(queryParams.get("minPrice"), 10) || 1; // Prețul minim setat prin query string sau default 1.
  const maxPrice = parseInt(queryParams.get("maxPrice"), 10) || 2000; // Prețul maxim setat prin query string sau default 2000.

  // Hook-ul useEffect pentru a aduce produsele din baza de date.
  useEffect(() => {
    const fetchProducts = async () => {
      // Efectuăm un apel către tabelul "products" din Supabase.
      try {
        const { data, error } = await supabase.from("products").select("*");

        if (error) {
          console.error("Eroare la încărcarea produselor:", error); // Afișăm eroarea în consolă.
          return;
        }

        setProducts(data); // Stocăm produsele în starea `products`.
      } catch (error) {
        console.error("Eroare neașteptată:", error); // Gestionăm erorile neașteptate
      } finally {
        setIsLoading(false); //Terminam incarcarea
      }
    };

    fetchProducts(); // Apelăm funcția pentru a aduce produsele.
  }, []); // Lista de dependențe este goală, ceea ce înseamnă că efectul va rula o singură dată la montare.

  // Funcție pentru gestionarea modificării cantității unui produs.
  const handleQuantityChange = (id, value) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities, // Păstrăm cantitățile existente.
      [id]: value, // Actualizăm cantitatea produsului cu ID-ul specificat.
    }));
  };

  // Filtrăm produsele în funcție de criterii (căutare, gen, preț).
  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm = searchTerm
      ? product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) // Verificăm dacă titlul sau descrierea include termenul de căutare.
      : true;
    const matchesGender = genderFilter ? product.gender === genderFilter : true; // Verificăm dacă genul corespunde (dacă este filtrat).
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice; // Verificăm dacă prețul se află în intervalul specificat.
    return matchesSearchTerm && matchesGender && matchesPrice; // Returnăm produsul doar dacă trece toate filtrele.
  });

  if (isLoading) {
    return (
      <div className="relative w-full h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {/* Container principal pentru layout */}
      <div className="w-full max-w-7xl p-2">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredProducts.length > 0 ? (
            // Iterăm prin produsele filtrate și generăm carduri pentru fiecare.
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`relative w-full aspect-w-1 aspect-h-1 border rounded-md p-4 
    shadow transition-transform duration-200 flex flex-col items-center justify-between bg-gray-100 ${
      window.innerWidth >= 1024 ? "hover:scale-105 shadow-lg" : ""
    }`}
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
                {/* Butoanele de acțiuni: FavoriteButton pe stânga, CartButton pe dreapta */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                  <FavoriteButton product={product} showText={false} />
                  <CartButton
                    product={product}
                    quantity={quantities[product.id] || 1}
                    setQuantity={(value) =>
                      handleQuantityChange(product.id, value)
                    }
                    showText={false}
                  />
                </div>
              </div>
            ))
          ) : (
            // Mesaj fallback dacă nu există produse.
            <p className="text-center col-span-full">Niciun produs găsit.</p>
          )}
        </div>
      </div>
    </div>
  );
};

ProductList.propTypes = {
  searchTerm: PropTypes.string, // `searchTerm` trebuie să fie de tip string.
};

export default ProductList; // Exportăm componenta pentru a fi utilizată în alte fișiere.
