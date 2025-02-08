import { useLocation } from "react-router-dom";
import ProductList from "./ProductList";

const Home = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("search") || "";

  return (
    <div>
      <ProductList searchTerm={searchTerm} />
    </div>
  );
};

export default Home;
