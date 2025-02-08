import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./pages/Home";
import NewProducts from "./pages/NewProducts";
import Cart from "./pages/Cart";
import Promotions from "./pages/Promotions";
import NotFound from "./pages/NotFound";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Favorite from "./pages/Favorite";
import CartProvider from "./context/CartContext";
import FavoriteProvider from "./context/FavoriteContext";

function App() {
  const [searchTerm, setSearchTerm] = useState(""); // 🟢 Definim starea de căutare

  return (
    <div className="app-container">
      <CartProvider>
        <FavoriteProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <MainLayout
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                }
              >
                <Route index element={<Home />} />
                <Route
                  path="ProductList"
                  element={<ProductList searchTerm={searchTerm} />}
                />
                <Route path="NewProducts" element={<NewProducts />} />
                <Route path="cart" element={<Cart />} />
                <Route path="promotions" element={<Promotions />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="*" element={<NotFound />} />
                <Route path="favorite" element={<Favorite />} />
              </Route>
            </Routes>
          </Router>
        </FavoriteProvider>
      </CartProvider>
    </div>
  );
}

export default App;
