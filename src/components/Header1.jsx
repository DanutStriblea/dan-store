import { FaUser, FaHeart, FaShoppingCart } from "react-icons/fa";
import SearchBar from "./SearchBar";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { FavoriteContext } from "../context/FavoriteContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import Logout from "./Logout";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Header1 = ({ onSearch }) => {
  const { favoriteItems } = useContext(FavoriteContext);
  const { cartItems } = useContext(CartContext);
  const { isAuthenticated, showLogoutMessage } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");

  // Funcția reutilizabilă pentru preluarea datelor utilizatorului
  const fetchUserDetails = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Eroare la obținerea utilizatorului:", authError?.message);
      return;
    }

    const { data, error } = await supabase
      .from("user_details")
      .select("first_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Eroare la obținerea detaliilor utilizatorului:",
        error.message
      );
    } else if (data) {
      setFirstName(data.first_name || "Utilizator");
    }
  };

  // Fetch inițial după logare
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDetails(); // Apelăm imediat după autentificare
    }
  }, [isAuthenticated]);

  // Ascultător real-time pentru actualizări în tabelul user_details
  useEffect(() => {
    console.log("Header URL la încărcare:", window.location.href);
    if (!isAuthenticated) return;

    const subscription = supabase
      .channel("realtime:user_details")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_details" },
        (payload) => {
          if (payload.new.user_id) {
            fetchUserDetails(); // Actualizăm prenumele prin fetch manual
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isAuthenticated]);

  return (
    <header className="w-full bg-gray-100 border-b">
      <div className="w-full bg-stone-800 text-center text-white py-0.5 text-[9px] font-semibold">
        <p>Livrare gratuită pentru comenzile peste 300 RON!</p>
      </div>
      <div
        className={`px-6 py-2 bg-white ${showLogoutMessage ? "blur-sm" : ""}`}
      >
        {/* Primul rând: Logo, bara de căutare și butoanele */}
        <div className="flex items-center justify-between space-x-4">
          {/* Logo și numele magazinului */}
          <NavLink to="/" className="flex items-center">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="DanStore Logo"
              className="h-8 sm:h-9 mr-2"
            />
            <div className="text-base font-semibold text-gray-800">
              <span className="text-lg sm:text-2xl font-bold text-green-500">
                Dan
              </span>
              <span className="text-lg sm:text-2xl font-bold text-green-700">
                Store
              </span>
            </div>
          </NavLink>

          {/* Bara de căutare (desktop view) */}
          <div className="hidden lg:block flex-grow max-w-[600px]">
            <SearchBar onSearch={onSearch} />
          </div>

          {/* Secțiunea de utilizator, salut și butoane */}
          <div className="flex items-center space-x-4 text-gray-600">
            {isAuthenticated && (
              <div className={`hidden sm:inline text-sm text-green-500`}>
                Salut, {firstName || "!"}
              </div>
            )}
            {!showLogoutMessage &&
              (isAuthenticated ? (
                <>
                  <Logout />
                  <NavLink to="/myaccount">
                    <button className="flex items-center space-x-1 hover:text-gray-800 text-sm">
                      <FaUser className="w-4 h-4" />
                      <span className="hidden lg:inline text-xs">
                        Contul Meu
                      </span>
                    </button>
                  </NavLink>
                </>
              ) : (
                <NavLink to="/login">
                  <button className="flex items-center space-x-1 hover:text-gray-800 text-sm">
                    <FaUser className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs">Log In</span>
                  </button>
                </NavLink>
              ))}

            <NavLink
              to="/favorite"
              className="relative flex items-center space-x-1 hover:text-gray-800 text-sm"
            >
              <div className="relative">
                <FaHeart className="w-4 h-4" />
                {favoriteItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {favoriteItems.length}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs">Favorite</span>
            </NavLink>
            <NavLink
              to="/cart"
              className="relative flex items-center space-x-1 hover:text-gray-800 text-sm"
            >
              <div className="relative">
                <FaShoppingCart className="w-4 h-4" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs">Coș</span>
            </NavLink>
          </div>
        </div>

        {/* Bara de căutare pentru mobile */}
        <div className="block lg:hidden w-full mt-3">
          <SearchBar onSearch={onSearch} />
        </div>
      </div>

      {showLogoutMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative bg-gray-200 p-6 rounded shadow-md w-96 text-center max-w-sm mx-auto">
            {/* Dimensiunea textului ajustată pentru un impact vizual mai mare */}
            <h2 className="text-4xl font-bold mb-4 text-green-500">
              Hai sic... Pa!
            </h2>
          </div>
        </div>
      )}
    </header>
  );
};

Header1.propTypes = { onSearch: PropTypes.func.isRequired };

export default Header1;
