import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header1 from "./Header1";
import Header2 from "./Header2";
import SideBar from "./SideBar";
import Footer from "./Footer";
import { useState, useEffect } from "react";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      setSearchTerm(""); // Resetăm termenul de căutare dacă ne aflăm pe ruta principală
    }
  }, [location.pathname]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    navigate("/"); // Redirecționăm la pagina principală după căutare
  };

  const handleHomeClick = () => {
    setSearchTerm(""); // Resetăm termenul de căutare la navigare
    navigate("/"); // Navigăm la pagina principală
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header1 onSearch={handleSearch} />
      <Header2 toggleSidebar={toggleSidebar} onHomeClick={handleHomeClick} />
      <div className="flex flex-1 overflow-hidden relative">
        <SideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 p-4 sm:p-5 md:ml-[17%] overflow-auto">
          <Outlet context={{ searchTerm, setSearchTerm }} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
