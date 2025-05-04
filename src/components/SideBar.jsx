import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaStar } from "react-icons/fa";

const SideBar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [genderFilter, setGenderFilter] = useState("");
  // Folosim o stare pentru prețul maxim; minimul este fixat la 1 RON
  const [maxPrice, setMaxPrice] = useState(5000);
  const [rating, setRating] = useState(0);

  const updateFilters = (gender, maxPrice, rating) => {
    navigate(
      `/product-list?gender=${gender}&minPrice=1&maxPrice=${maxPrice}&rating=${rating}`
    );
  };

  const handleGenderFilterClick = (gender) => {
    if (genderFilter === gender) {
      setGenderFilter("");
      updateFilters("", maxPrice, rating);
    } else {
      setGenderFilter(gender);
      updateFilters(gender, maxPrice, rating);
    }
  };

  const handlePriceChange = (e) => {
    const newValue = Number(e.target.value);
    setMaxPrice(newValue);
    updateFilters(genderFilter, newValue, rating);
  };

  const handleRatingChange = (e) => {
    const newRating = parseInt(e.target.value, 10);
    setRating(newRating);
    updateFilters(genderFilter, maxPrice, newRating);
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
        style={{ boxShadow: "4px 0 8px rgba(0, 0, 0, 0.3)" }}
        className={`fixed md:static inset-y-0 left-0 bg-gray-900 text-white p-4 transition-transform duration-300 ease-in-out z-30 top-[6.5rem] bottom-[4.5rem] w-64 md:w-1/4 lg:w-1/5 xl:w-1/6 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar content */}
        <div className="relative z-10 h-full">
          {/* Butonul de închidere pentru mobile, mărit și repoziționat */}
          <button
            className="absolute -top-2 right-0 md:hidden text-xl text-gray-400 hover:text-gray-50"
            onClick={toggleSidebar}
          >
            ✕
          </button>

          <ul className="space-y-4">
            <li>
              <p className="text-gray-400 font-bold pb-2 border-b border-gray-700">
                Filtre
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-1">Categorie:</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGenderFilterClick("masculin")}
                    className={`py-2 px-3 rounded transition-transform duration-200 ${
                      genderFilter === "masculin"
                        ? "scale-105 bg-sky-900"
                        : "scale-100 bg-gray-700 md:bg-gray-800 md:hover:bg-gray-700"
                    }`}
                  >
                    Bărbați
                  </button>

                  <button
                    onClick={() => handleGenderFilterClick("feminin")}
                    className={`py-2 px-3 rounded transition-transform duration-200 ${
                      genderFilter === "feminin"
                        ? "scale-105 bg-sky-900"
                        : "scale-100 bg-gray-700 md:bg-gray-800 md:hover:bg-gray-700"
                    }`}
                  >
                    Femei
                  </button>
                </div>
              </div>
            </li>
            <li>
              <label
                htmlFor="priceRange"
                className="text-sm text-gray-400 block mb-1 mt-10"
              >
                Preț
              </label>
              <input
                type="range"
                id="priceRange"
                name="priceRange"
                min="1"
                max="1200"
                value={maxPrice}
                onChange={handlePriceChange}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>1 RON</span>
                <span>{maxPrice} RON</span>
              </div>
            </li>
            <li>
              <label
                htmlFor="rating"
                className="text-sm text-gray-400 block mb-1 mt-10"
              >
                Rating:
              </label>
              <div id="rating" className="flex space-x-1">
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
                      className={`w-6 h-6 cursor-pointer transition-transform duration-200 ${
                        rating >= star ? "text-sky-700" : "text-gray-500"
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

SideBar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default SideBar;
