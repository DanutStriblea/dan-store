import { NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import PropTypes from "prop-types";

const Header2 = ({ toggleSidebar }) => {
  return (
    <div className="w-full bg-gradient-to-t from-white to-stone-100 py-1 shadow-md">
      <div className="flex justify-between items-center px-4">
        {/* Buton pentru mobil */}
        <button
          className="text-gray-600 hover:text-gray-800 md:hidden"
          onClick={toggleSidebar}
        >
          <FaBars className="w-6 h-6" />
        </button>

        {/* Meniul de navigare */}
        <div className="flex-1 flex justify-center space-x-12">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 hover:text-blue-700 text-sm"
                : "text-gray-600 hover:text-gray-800 text-sm"
            }
          >
            Acasă
          </NavLink>
          <NavLink
            to="/NewProducts"
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 hover:text-blue-700 text-sm"
                : "text-gray-600 hover:text-gray-800 text-sm"
            }
          >
            Produse Noi
          </NavLink>
          <NavLink
            to="/Promotions"
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 hover:text-blue-700 text-sm"
                : "text-gray-600 hover:text-gray-800 text-sm"
            }
          >
            Promoții
          </NavLink>
        </div>

        {/* Secțiunea de coș a fost eliminată */}
      </div>
    </div>
  );
};

Header2.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
};

export default Header2;
