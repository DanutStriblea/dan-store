import { FaSignOutAlt } from "react-icons/fa";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { logout, setShowLogoutMessage } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutMessage(true);
    setTimeout(() => {
      setShowLogoutMessage(false);
      navigate("/"); // Navighează la pagina principală
    }, 3000); // Ascunde mesajul după 3 secunde
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-1 hover:text-gray-800 text-sm"
    >
      <FaSignOutAlt className="w-4 h-4" />
      <span className="hidden lg:inline text-xs">Log Out</span>
    </button>
  );
};

export default Logout;
