// App.jsx
import { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom"; // Folosim HashRouter
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
import MyAccount from "./pages/MyAccount";
import UserDetailsForm from "./components/UserDetailsForm";
import UserAddresses from "./components/UserAddresses";
import Login from "./components/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterForm from "./components/RegisterForm";
import { QuantityProvider } from "./context/QuantityContext";
import ResetPassword from "./components/ResetPassword";
import OrderDetails from "./pages/OrderDetails";
import FinalOrderDetails from "./pages/FinalOrderDetails"; // Importă noua pagină
import OrderConfirmation from "./pages/OrderConfirmation"; // Ruta pentru confirmare comandă
import { AddressProvider } from "./context/AddressContext";
import CartPopup from "./components/CartPopup"; // <-- Am adăugat această linie

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="app-container">
      <CartProvider>
        <FavoriteProvider>
          <AuthProvider>
            <QuantityProvider>
              <AddressProvider>
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
                        path="product-list"
                        element={<ProductList searchTerm={searchTerm} />}
                      />
                      <Route path="newproducts" element={<NewProducts />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="promotions" element={<Promotions />} />
                      <Route path="product/:id" element={<ProductDetails />} />
                      <Route path="favorite" element={<Favorite />} />
                      <Route
                        path="/addresses"
                        element={<ProtectedRoute element={<UserAddresses />} />}
                      />
                      <Route path="register" element={<RegisterForm />} />
                      <Route
                        path="myaccount"
                        element={<ProtectedRoute element={<MyAccount />} />}
                      />
                      <Route
                        path="user/:id"
                        element={
                          <ProtectedRoute element={<UserDetailsForm />} />
                        }
                      />
                      <Route path="login" element={<Login />} />
                      <Route
                        path="reset-password"
                        element={<ResetPassword />}
                      />
                      <Route
                        path="order-details"
                        element={<ProtectedRoute element={<OrderDetails />} />}
                      />
                      {/* Ruta pentru finalizarea comenzii */}
                      <Route
                        path="final-order-details"
                        element={
                          <ProtectedRoute element={<FinalOrderDetails />} />
                        }
                      />
                      {/* Noua rută pentru confirmarea comenzii */}
                      <Route
                        path="order-confirmation"
                        element={<OrderConfirmation />}
                      />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                  <CartPopup /> {/* Adaugă aici componenta de popup */}
                </Router>
              </AddressProvider>
            </QuantityProvider>
          </AuthProvider>
        </FavoriteProvider>
      </CartProvider>
    </div>
  );
}

export default App;
