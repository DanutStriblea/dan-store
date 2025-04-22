import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Evităm flicker la încărcare

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession(); // Preluăm sesiunea utilizatorului

        if (session) {
          // Sesiune validă
          setUser(session.user);
          setIsAuthenticated(true);
          console.log("Sesiunea utilizatorului este validă:", session.user);
        } else {
          // Sesiune indisponibilă
          setUser(null);
          setIsAuthenticated(false);
          console.warn("Sesiunea utilizatorului nu este disponibilă.");
        }
      } catch (err) {
        // Tratare eroare
        console.error(
          "Eroare la preluarea sesiunii utilizatorului:",
          err.message
        );
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Finalizăm încărcarea
        setLoading(false);
      }
    };

    checkUser();

    // Listener pentru schimbările autentificării utilizatorului
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Actualizare sesiune
          setUser(session.user);
          setIsAuthenticated(true);
          console.log("Sesiunea utilizatorului s-a actualizat:", session.user);
        } else {
          // Invalidare sesiune
          setUser(null);
          setIsAuthenticated(false);
          console.warn("Sesiunea utilizatorului a fost invalidată.");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe(); // Dezactivăm listener-ul
    };
  }, []);

  const login = (user) => {
    setIsAuthenticated(true);
    setUser(user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) return <p>Loading...</p>; // 🔄 Prevenim conținut incorect la refresh

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        showLogoutMessage,
        setShowLogoutMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
