import { FaUser, FaHeart, FaShoppingCart } from "react-icons/fa";
import SearchBar from "./SearchBar";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { useContext } from "react";
import { FavoriteContext } from "../context/FavoriteContext";
import { CartContext } from "../context/CartContext";

const Header1 = ({ onSearch }) => {
  const { favoriteItems } = useContext(FavoriteContext);
  const { cartItems } = useContext(CartContext);

  return (
    <header className="w-full bg-gray-100 border-b">
      <div className="w-full bg-stone-800 text-center text-white py-0.5 text-[9px] font-semibold">
        <p>Livrare gratuită pentru comenzile peste 300 RON!</p>
      </div>
      <div className="flex justify-between items-center px-6 py-2 bg-white">
        <NavLink to="/">
          <div className="text-base font-semibold text-gray-800">DanStore</div>
        </NavLink>
        <div className="flex-1 flex justify-center ml-4 pr-7">
          <div className="w-full max-w-3xl ml-5">
            <SearchBar onSearch={onSearch} />
          </div>
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <button className="flex items-center space-x-1 hover:text-gray-800 text-sm">
            <FaUser className="w-4 h-4" />
            <span className="hidden md:inline text-xs">Contul Meu</span>
          </button>

          {/* Link către pagina Favorite cu badge pe iconiță */}
          <NavLink
            to="/favorite"
            className="relative flex items-center space-x-1 hover:text-gray-800 text-sm"
          >
            <div className="relative">
              <FaHeart className="w-4 h-4" />
              {/* Badge-ul puțin mai mic și centrat mai bine */}
              {favoriteItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {favoriteItems.length}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-xs">Favorite</span>
          </NavLink>

          <NavLink
            to="/Cart"
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
            <span className="hidden md:inline text-xs">Coș</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

Header1.propTypes = { onSearch: PropTypes.func.isRequired };

export default Header1;
