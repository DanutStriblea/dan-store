import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header1 from "./Header1";
import Header2 from "./Header2";
import SideBar from "./SideBar";
import Footer from "./Footer";
import { useState, useEffect } from "react";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Stăm deoparte pentru un eventual search comun (și pentru a-l pasa componentelor copil, dacă e nevoie)
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Resetăm termenul de căutare când navigăm pe pagina principală (/)
  useEffect(() => {
    if (location.pathname === "/") {
      setSearchTerm("");
    }
  }, [location.pathname]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    navigate("/"); // Navigare la pagina principală după căutare
  };

  const handleHomeClick = () => {
    setSearchTerm("");
    navigate("/"); // Redirecționează la Home
  };

  return (
    <div className="flex flex-col h-screen overflow-auto bg-stone-50">
      {/* Secțiuni de header ale aplicației */}
      <Header1 onSearch={handleSearch} />
      <Header2 toggleSidebar={toggleSidebar} onHomeClick={handleHomeClick} />

      <div className="flex flex-1 overflow-auto">
        <SideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 p-4 sm:p-5 overflow-auto">
          {/* Outlet-ul este locul unde se vor încărca componentele rutele copil
              (de exemplu, pagina Home, Order Confirmation, etc.) */}
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
