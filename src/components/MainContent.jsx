// MainContent.jsx

import { Outlet } from "react-router-dom";
import PropTypes from "prop-types";

const MainContent = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex-1 p-4 sm:p-6 md:ml-[20%] min-h-screen overflow-auto">
      <Outlet context={{ searchTerm, setSearchTerm }} />
    </div>
  );
};

// Adăugăm PropTypes pentru a valida props
MainContent.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
};
export default MainContent;
