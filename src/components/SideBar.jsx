import PropTypes from "prop-types";

const SideBar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <nav
      className={`fixed inset-y-0 left-0 bg-stone-800  text-white 
        p-4 transition-transform duration-300 
      ease-in-out z-20 top-[6rem] bottom-[4.5rem] w-full 
      md:w-1/6 md:block ${isSidebarOpen ? "block" : "hidden md:block"}`} // Always show in full view (md:block)
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
            <button
              className="block py-2 px-3 text-white hover:bg-gray-900 rounded"
              onClick={() => console.log("Acasa")}
            >
              Categorie
            </button>
          </li>
          <li>
            <button
              className="block py-2 px-3 text-white hover:bg-gray-900 rounded"
              onClick={() => console.log("Produse")}
            >
              Pret
            </button>
          </li>
          <li>
            <button
              className="block py-2 px-3 text-white hover:bg-gray-900 rounded"
              onClick={() => console.log("Promotii")}
            >
              Rating
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

// Validare Props
SideBar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default SideBar;
