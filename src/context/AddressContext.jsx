import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { supabase } from "../supabaseClient";

export const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [isAddressesReady, setIsAddressesReady] = useState(false);

  // Funcție pentru inițializarea sesiunii
  useEffect(() => {
    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Eroare la obținerea sesiunii:", error.message);
        setSession(null);
        setIsAddressesReady(true);
        return;
      }

      if (!data?.session?.user) {
        console.warn(
          "Nu s-a găsit o sesiune inițială. Setăm isAddressesReady."
        );
        setSession(null);
        setIsAddressesReady(true);
        return;
      }

      console.log("Sesiune inițială:", data.session.user.id);
      setSession(data.session);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          console.log("Sesiune actualizată:", session.user.id);
          setSession(session);
        } else {
          console.warn("Sesiune pierdută sau nicio sesiune.");
          setSession(null);
          setIsAddressesReady(true);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Funcție pentru preluarea adreselor utilizatorului
  const fetchAddresses = useCallback(async () => {
    if (!session || !session?.user) {
      console.log("Sesiunea nu este activă. Nu apelăm fetchAddresses.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("is_default", { ascending: false });

      if (error) {
        console.error("Eroare la preluarea adreselor:", error.message);
        setError("Nu s-au putut prelua adresele utilizatorului.");
      } else {
        console.log("Adresele utilizatorului au fost preluate:", data);
        setAddresses(data);
      }
    } catch (err) {
      console.error("Eroare neașteptată la preluarea adreselor:", err.message);
    } finally {
      setIsAddressesReady(true);
    }
  }, [session]);

  // Apelăm fetchAddresses imediat ce sesiunea devine disponibilă
  useEffect(() => {
    if (session && !isAddressesReady) {
      console.log(
        "Apelăm fetchAddresses pentru utilizator:",
        session?.user?.id
      );
      fetchAddresses();
    }
  }, [session, fetchAddresses, isAddressesReady]);

  const favoriteAddress =
    addresses.find((address) => address.is_default) || null;

  return (
    <AddressContext.Provider
      value={{
        addresses,
        setAddresses,
        favoriteAddress,
        fetchAddresses,
        isAddressesReady,
        error,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

AddressProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AddressProvider;
