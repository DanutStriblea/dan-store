import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const FavoriteButton = ({ product, showText = true }) => {
  const { favorites, addToFavorites, removeFromFavorites } =
    useContext(FavoritesContext);
  const isFavorite = favorites.some((fav) => fav.id === product.id);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <div className="flex items-center">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.title}
          className="w-10 h-10 object-cover rounded-full cursor-pointer"
        />
      </Link>
      <button
        onClick={handleFavoriteClick}
        className="ml-2 text-red-600 hover:text-red-800 transition-colors duration-200"
      >
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>
      {showText && (
        <span className="ml-2 text-sm text-gray-600">
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </span>
      )}
    </div>
  );
};

FavoriteButton.propTypes = {
  product: PropTypes.object.isRequired,
  showText: PropTypes.bool,
};

export default FavoriteButton;
