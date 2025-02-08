import PropTypes from "prop-types";
import { useContext } from "react";
import { FavoriteContext } from "../context/FavoriteContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const FavoriteButton = ({ product, showText = true }) => {
  const { favoriteItems, addToFavorites, removeFromFavorites } =
    useContext(FavoriteContext);
  const isFavorite = favoriteItems.some((fav) => fav.id === product.id);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleFavoriteClick}
        className="ml-2 text-sky-900 hover:text-sky-700 active:text-sky-800 transition-colors duration-200 transform active:scale-105"
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
