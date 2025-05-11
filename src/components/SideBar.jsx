import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaStar } from "react-icons/fa";

const SideBar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  // Schimbăm filtrul de gen pentru a permite selecția multiplă (checkbox-uri)
  const [genderFilter, setGenderFilter] = useState([]);
  // Starea pentru prețul maxim; minimul este fixat la 1 RON
  const [maxPrice, setMaxPrice] = useState(5000);
  const [rating, setRating] = useState(0);

  // Convertim lista de genuri selectate într-un string, separate prin virgulă, pentru URL.
  const updateFilters = (genders, maxPrice, rating) => {
    const genderParam = genders.join(",");
    navigate(
      `/product-list?gender=${genderParam}&minPrice=1&maxPrice=${maxPrice}&rating=${rating}`
    );
  };

  // Funcție pentru gestionarea checkbox-urilor
  const handleGenderCheckboxChange = (e) => {
    const gender = e.target.value;

    // Dacă genul este deja selectat, îl deselectăm
    if (genderFilter.includes(gender)) {
      setGenderFilter([]);
      updateFilters([], maxPrice, rating);
    } else {
      // Selectăm doar genul curent
      setGenderFilter([gender]);
      updateFilters([gender], maxPrice, rating);
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
          className="fixed inset-0 bg-stone-900 bg-opacity-50 z-20 md:hidden"
          onClick={handleOverlayClick}
        ></div>
      )}
      <nav
        style={{ boxShadow: "4px 0 8px rgba(0, 0, 0, 0.1)" }}
        className={`fixed md:static inset-y-0 left-0 bg-stone-900 text-gray-300 p-4 
    transition-transform duration-300 ease-in-out z-30 top-[6.5rem] bottom-[4.5rem] 
    w-64 md:w-1/4 lg:w-[12%] xl:w-[12%] ${
      isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    }`}
      >
        <div className="relative z-10 h-full">
          {/* Butonul de închidere pentru mobile */}
          <button
            className="absolute -top-2 right-0 md:hidden text-xl text-gray-700 hover:text-gray-900"
            onClick={toggleSidebar}
          >
            ✕
          </button>

          <ul className="space-y-4">
            <li>
              <p className="text-stone-300 font-bold pb-2 mt-2 border-gray-400">
                Filtre
              </p>
              <div className="mt-8">
                <p className="text-sm text-gray-400 mb-2">Categorie:</p>
                {/* Layout vertical pentru checkbox-uri */}
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      value="masculin"
                      checked={genderFilter.includes("masculin")}
                      onChange={handleGenderCheckboxChange}
                      className="mr-2"
                    />
                    Bărbați
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      value="feminin"
                      checked={genderFilter.includes("feminin")}
                      onChange={handleGenderCheckboxChange}
                      className="mr-2"
                    />
                    Femei
                  </label>
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
                <span>{maxPrice}</span>
                <span>Max</span>
              </div>
            </li>
            <li>
              <label
                htmlFor="rating"
                className="text-sm text-gray-400 block mb-1 mt-10"
              >
                Rating:
              </label>
              <div id="rating" className="flex justify-between w-full">
                {[1, 2, 3, 4, 5].map((star) => (
                  <label
                    key={star}
                    htmlFor={`rating${star}`}
                    className="flex-1 text-center"
                  >
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
                      className={`w-full max-w-[1.5rem] h-auto gap 1 cursor-pointer transition-transform duration-200 ${
                        rating >= star ? "text-sky-700" : "text-gray-500"
                      } hover:scale-110`}
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
