import PropTypes from "prop-types";
import { useContext, useState, useEffect, useRef } from "react";
import { FavoriteContext } from "../context/FavoriteContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const FavoriteButton = ({ product, showText = true }) => {
  const { favoriteItems, addToFavorites, removeFromFavorites } =
    useContext(FavoriteContext);
  const [isFavorite, setIsFavorite] = useState(false);
  // Folosim un ref pentru containerul iconiței pentru a aplica transformările doar pe aceasta
  const iconRef = useRef(null);

  useEffect(() => {
    setIsFavorite(favoriteItems.some((item) => item.product_id === product.id));
  }, [favoriteItems, product.id]);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFromFavorites(product.id);
      setIsFavorite(false);
    } else {
      addToFavorites(product);
      setIsFavorite(true);
    }
  };

  const animateIcon = () => {
    if (iconRef.current) {
      // Prima fază: scale la 1.1 în 150ms
      iconRef.current.style.transition = "transform 0.15s ease-out";
      iconRef.current.style.transform = "scale(1.1)";
      setTimeout(() => {
        // A doua fază: scale la 0.9 după 150ms
        iconRef.current.style.transform = "scale(0.9)";
      }, 150);
      setTimeout(() => {
        // A treia fază: scale la 1.2 după 300ms
        iconRef.current.style.transform = "scale(1.2)";
      }, 300);
      setTimeout(() => {
        // Revenire: scale la 1 după 600ms
        iconRef.current.style.transform = "scale(1)";
      }, 600);
    }
  };

  return (
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        animateIcon();
        handleFavoriteClick();
      }}
      className={`relative flex items-center space-x-2 transition-colors duration-100 ${
        isFavorite ? "text-sky-800" : "text-gray-400"
      }`}
    >
      <span
        ref={iconRef}
        className="inline-flex items-center justify-center"
        style={{
          width: "20px",
          height: "20px",
          overflow: "hidden",
          transformOrigin: "center",
        }}
      >
        {isFavorite ? (
          <FaHeart className="w-full h-full" />
        ) : (
          <FaRegHeart className="w-full h-full" />
        )}
      </span>
      {showText && (
        <span>{isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
      )}
    </button>
  );
};

FavoriteButton.propTypes = {
  product: PropTypes.object.isRequired,
  showText: PropTypes.bool,
};

export default FavoriteButton;
