import { NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import PropTypes from "prop-types"; // Importă PropTypes

const Header2 = ({ toggleSidebar }) => {
  return (
    <div className="w-full bg-white py-1 shadow-md">
      <div className="flex justify-between items-center px-4">
        {/* Buton pentru mobil */}
        <button
          className="text-gray-600 hover:text-gray-800 md:hidden"
          onClick={toggleSidebar} // Apelarea funcției toggleSidebar
        >
          <FaBars className="w-6 h-6" />
        </button>

        {/* Meniul de navigare */}
        <div className="flex-1 flex justify-center space-x-12">
          {" "}
          {/* Am redus distanța între elemente */}
          {/* Acasa */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 hover:text-blue-700 text-sm" // text-sm pentru font mai mic
                : "text-gray-600 hover:text-gray-800 text-sm"
            }
          >
            Acasa
          </NavLink>
          {/* Produse */}
          <NavLink
            to="/NewProducts"
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 hover:text-blue-700 text-sm" // text-sm pentru font mai mic
                : "text-gray-600 hover:text-gray-800 text-sm"
            }
          >
            Produse Noi
          </NavLink>
          {/* Promotii */}
          <NavLink
            to="/Promotions"
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 hover:text-blue-700 text-sm" // text-sm pentru font mai mic
                : "text-gray-600 hover:text-gray-800 text-sm"
            }
          >
            Promotii
          </NavLink>
        </div>
      </div>
    </div>
  );
};

// Validarea Props
Header2.propTypes = {
  toggleSidebar: PropTypes.func.isRequired, // Asigură-te că toggleSidebar este o funcție
};

export default Header2;
