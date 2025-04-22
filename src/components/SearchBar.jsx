import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTermLocal, setSearchTermLocal] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search");

    // Verificăm dacă `searchQuery` este valid (excludem email-uri sau alte valori ciudate)
    if (searchQuery && !searchQuery.includes("@")) {
      setSearchTermLocal(searchQuery);
    } else {
      // Resetăm `searchTermLocal` dacă parametrii sunt invalizi
      setSearchTermLocal("");
    }
  }, [location.search]);

  const handleChange = (e) => {
    const newSearchTerm = e.target.value.trim(); // Eliminăm spațiile inutile
    setSearchTermLocal(newSearchTerm);

    // Navigăm doar dacă `newSearchTerm` este valid
    if (newSearchTerm && !newSearchTerm.includes("@")) {
      navigate(`/?search=${encodeURIComponent(newSearchTerm)}`);
    }
  };

  const handleSearch = () => {
    if (searchTermLocal.trim() && !searchTermLocal.includes("@")) {
      navigate(`/?search=${encodeURIComponent(searchTermLocal.trim())}`);
      setSearchTermLocal(""); // Resetăm câmpul de căutare după navigare
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center border border-gray-300 bg-gray-100 rounded-md px-2 py-0.2 w-full">
      <input
        type="text"
        placeholder="Caută produse..."
        className="w-full border-none outline-none px-2 text-sm h-8 bg-gray-100"
        value={searchTermLocal}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
      />
      {/* Butonul normal pentru desktop */}
      <button
        className="bg-sky-900 text-white px-3 py-1 rounded-md text-sm h-7 transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 hidden sm:block"
        onClick={handleSearch}
      >
        Caută
      </button>
      {/* Iconița de lupă pentru mobile */}
      <button
        className="text-sky-900 p-2 rounded-full sm:hidden"
        onClick={handleSearch}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 19l-4-4M9 14a5 5 0 110-10 5 5 0 010 10z"
          />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;
