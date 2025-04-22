import PropTypes from "prop-types";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Importă AuthContext

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext); // Obține starea de autentificare din AuthContext

  return isAuthenticated ? element : <Navigate to="/login" />; // Dacă utilizatorul este autentificat,redă elementul,
  // altfel redirecționează la pagina de login
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default ProtectedRoute;
