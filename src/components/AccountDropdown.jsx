import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { FaUser } from "react-icons/fa";

const AccountDropdown = () => {
  // Starea care controlează vizibilitatea dropdown-ului
  const [visible, setVisible] = useState(false);
  // Starea care decide dacă dropdown-ul va fi renderizat (pentru a permite tranziții)
  const [shouldRender, setShouldRender] = useState(false);
  // Adăugăm starea pentru verificarea lățimii ecranului
  const [enableHoverEffects, setEnableHoverEffects] = useState(
    window.innerWidth >= 1600
  );
  // Referință către timer pentru delay
  const timerRef = useRef(null);
  // Efect pentru a actualiza starea shouldRender în funcție de visible
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      // Așteptăm pentru tranziția de opacitate înainte de a elimina dropdown-ul din DOM
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 150); // Durata tranziției CSS
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  // Efect pentru a actualiza starea enableHoverEffects în funcție de lățimea ferestrei
  useEffect(() => {
    const handleResize = () => {
      setEnableHoverEffects(window.innerWidth >= 1600); // Dezactivează hover effects sub 1600px
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Gestionează intrarea mouse-ului: anulează eventualul timer și arată dropdown-ul
  const handleMouseEnter = () => {
    // Verificăm dacă efectele de hover sunt activate
    if (!enableHoverEffects) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(true);
  };

  // Gestionează ieșirea mouse-ului: setează un timer de 0.3 secunde pentru a ascunde dropdown-ul
  const handleMouseLeave = () => {
    // Verificăm dacă efectele de hover sunt activate
    if (!enableHoverEffects) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, 100); // Delay de 0.1 sec
  };

  // Handler folosit pentru a ascunde instant dropdown-ul după click pe un link
  const handleLinkClick = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Butonul "Contul Meu" */}{" "}
      <NavLink to="/myaccount">
        <button
          className={`flex items-center space-x-1 ${enableHoverEffects ? "hover:text-gray-800" : ""} text-sm`}
        >
          <FaUser className="w-4 h-4" />
          <span className="hidden lg:inline text-xs">Contul Meu</span>
        </button>
      </NavLink>
      {/* Dropdown-ul cu tranziție pe opacitate */}
      {shouldRender && (
        <div
          className={`absolute top-full right-0 mt-2 w-48 bg-slate-100 border border-gray-200 rounded shadow-lg z-50 transition-opacity duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="px-4 border-gray-200 "></div>
          <ul>
            <li>
              <NavLink
                to="/myaccount"
                onClick={handleLinkClick}
                className={`block px-4 py-2 ${enableHoverEffects ? "hover:bg-slate-200" : ""} text-gray-600 text-sm`}
              >
                Datele tale
              </NavLink>
            </li>{" "}
            <li>
              {" "}
              <NavLink
                to="/addresses"
                onClick={handleLinkClick}
                className={`block px-4 py-2 ${enableHoverEffects ? "hover:bg-slate-200" : ""} text-gray-600 text-sm`}
              >
                Adrese
              </NavLink>
            </li>
            <li>
              {" "}
              <NavLink
                to="/your-cards"
                onClick={handleLinkClick}
                className={`block px-4 py-2 ${enableHoverEffects ? "hover:bg-slate-200" : ""} text-gray-600 text-sm`}
              >
                Carduri
              </NavLink>
            </li>
            <li>
              {" "}
              <NavLink
                to="/orders"
                onClick={handleLinkClick}
                className={`block px-4 py-2 ${enableHoverEffects ? "hover:bg-slate-200" : ""} text-gray-600 text-sm`}
              >
                Comenzi
              </NavLink>
            </li>
            <li>
              {" "}
              <NavLink
                to="/returns"
                onClick={handleLinkClick}
                className={`block px-4 py-2 ${enableHoverEffects ? "hover:bg-slate-200" : ""} text-gray-600 text-sm`}
              >
                Retururi
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

AccountDropdown.propTypes = {
  firstName: PropTypes.string.isRequired,
};

export default AccountDropdown;
