import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaStar } from "react-icons/fa";

const SideBar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [genderFilter, setGenderFilter] = useState("");
  const [priceRange, setPriceRange] = useState([1, 1200]);
  const [rating, setRating] = useState(0);

  const handleGenderFilterClick = (gender) => {
    if (genderFilter === gender) {
      setGenderFilter("");
      updateFilters("", priceRange, rating);
    } else {
      setGenderFilter(gender);
      updateFilters(gender, priceRange, rating);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.split(",").map(Number);
    setPriceRange(value);
    updateFilters(genderFilter, value, rating);
  };

  const handleRatingChange = (e) => {
    const newRating = parseInt(e.target.value, 10);
    setRating(newRating);
    updateFilters(genderFilter, priceRange, newRating);
  };

  const updateFilters = (gender, price, rating) => {
    navigate(
      `/product-list?gender=${gender}&minPrice=${price[0]}&maxPrice=${price[1]}&rating=${rating}`
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleSidebar();
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={handleOverlayClick}
        ></div>
      )}
      <nav
        className={`fixed md:static inset-y-0 left-0 bg-stone-800 text-white 
        p-4 transition-transform duration-300 
      ease-in-out z-30 top-[6.5rem] bottom-[4.5rem] w-64 md:w-1/4 lg:w-1/5 xl:w-1/6 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
      >
        {/* Sidebar content */}
        <div className="relative z-10 h-full">
          {/* Close button for mobile */}
          <button
            className="absolute top-4 right-4 md:hidden"
            onClick={toggleSidebar}
          >
            ✕
          </button>

          <ul className="space-y-2">
            {/* Butoane din dropdown */}
            <li>
              <p className="text-gray-500 font-bold py-2">Filtre:</p>
              <div className="block py-2 px-3 text-gray-500 rounded">
                Categorie:
              </div>
              <ul className="pl-4 space-y-2">
                <li>
                  <button
                    className={`block py-2 px-3 text-white hover:scale-105 hover:bg-gray-900 active:scale-110 rounded ${
                      genderFilter === "masculin" ? "bg-gray-900" : ""
                    }`}
                    onClick={() => handleGenderFilterClick("masculin")}
                  >
                    Barbati
                  </button>
                </li>
                <li>
                  <button
                    className={`block py-2 px-3 text-white hover:scale-105 hover:bg-gray-900 active:scale-110 rounded ${
                      genderFilter === "feminin" ? "bg-gray-900" : ""
                    }`}
                    onClick={() => handleGenderFilterClick("feminin")}
                  >
                    Femei
                  </button>
                </li>
              </ul>
            </li>
            {/* // interval de pret */}
            <li className="block py-2 px-3 text-white">
              <label htmlFor="priceRange">Preț:</label>
              <input
                type="range"
                id="priceRange"
                name="priceRange"
                min="1"
                max="1200"
                value={priceRange}
                onChange={handlePriceChange}
                className="w-full"
                multiple
              />
              <div className="flex justify-between text-xs">
                <span>{priceRange[0]} RON</span>
                <span>{priceRange[1]} RON</span>
              </div>
            </li>
            <li className="block py-2 px-3 text-white">
              <label htmlFor="rating1">Rating:</label>
              <div id="rating" className="flex flex-wrap space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <label key={star} htmlFor={`rating${star}`}>
                    <input
                      type="radio"
                      id={`rating${star}`}
                      name="rating"
                      value={star}
                      checked={rating === star}
                      onChange={handleRatingChange}
                      className="hidden"
                    />
                    <FaStar
                      className={`w-6 h-6 cursor-pointer ${
                        rating >= star ? "text-yellow-500" : "text-gray-400"
                      }`}
                    />
                  </label>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

// Validare Props
SideBar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default SideBar;
