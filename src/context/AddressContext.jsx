// AddressContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { supabase } from "../supabaseClient";

export const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  // Starea pentru lista de adrese și adresa favorită
  const [addresses, setAddresses] = useState([]);
  const [favoriteAddress, setFavoriteAddress] = useState(null);
  const [isAddressesReady, setIsAddressesReady] = useState(false);

  // Stări pentru adresele selectate în fluxul de comandă
  const [deliveryAddress, setDeliveryAddressState] = useState(null);
  const [billingAddress, setBillingAddressState] = useState(null);

  // Memorizează fetchAddresses cu useCallback pentru a păstra referința constantă
  const fetchAddresses = useCallback(async () => {
    const { data, error } = await supabase.from("user_addresses").select("*");
    if (error) {
      console.error("Error fetching addresses:", error);
      return;
    }

    // Stocăm toate adresele
    setAddresses(data || []);

    // Cache-uim adresele în sessionStorage pentru persistență la refresh
    if (data && data.length > 0) {
      sessionStorage.setItem("cached_addresses", JSON.stringify(data));
    } else {
      // Dacă nu avem adrese, ștergem orice cache
      sessionStorage.removeItem("cached_addresses");
      // Și ștergem și ID-urile din localStorage pentru a evita referințe invalide
      localStorage.removeItem("selected_delivery_address_id");
      localStorage.removeItem("selected_billing_address_id");
    }

    // Determinăm adresa favorită (cea marcată cu is_default)
    const fav = data?.find((addr) => addr.is_default);
    setFavoriteAddress(fav);

    // Încercăm să setăm adresele selectate anterior din localStorage
    const savedDeliveryId = localStorage.getItem(
      "selected_delivery_address_id"
    );
    const savedBillingId = localStorage.getItem("selected_billing_address_id");

    if (data && data.length > 0) {
      // Dacă avem ID-uri salvate, încercăm să găsim adresele corespunzătoare
      if (savedDeliveryId) {
        const deliveryAddr = data.find((addr) => addr.id === savedDeliveryId);
        if (deliveryAddr) {
          setDeliveryAddressState(deliveryAddr);
        } else if (fav) {
          // Dacă nu găsim adresa salvată, folosim favorita și actualizăm localStorage
          setDeliveryAddressState(fav);
          localStorage.setItem("selected_delivery_address_id", fav.id);
        }
      } else if (fav) {
        // Dacă nu avem ID salvat dar avem o adresă favorită, o folosim
        setDeliveryAddressState(fav);
        localStorage.setItem("selected_delivery_address_id", fav.id);
      }

      if (savedBillingId) {
        const billingAddr = data.find((addr) => addr.id === savedBillingId);
        if (billingAddr) {
          setBillingAddressState(billingAddr);
        } else if (savedDeliveryId) {
          // Dacă nu găsim adresa de facturare dar avem adresă de livrare, o folosim pe aceasta
          const deliveryAddr = data.find((addr) => addr.id === savedDeliveryId);
          if (deliveryAddr) {
            setBillingAddressState(deliveryAddr);
            localStorage.setItem(
              "selected_billing_address_id",
              deliveryAddr.id
            );
          }
        } else if (fav) {
          // Dacă nu avem nici adresă de facturare nici de livrare, folosim favorita
          setBillingAddressState(fav);
          localStorage.setItem("selected_billing_address_id", fav.id);
        }
      }
    }

    setIsAddressesReady(true);
    return data || [];
  }, []);

  // La montare, verificăm mai întâi dacă avem adrese cache-uite și apoi fetchăm adresele actuale
  useEffect(() => {
    const loadInitialData = async () => {
      // Verificăm dacă avem adrese în cache (sessionStorage) și le folosim temporar
      const cachedAddressesString = sessionStorage.getItem("cached_addresses");
      if (cachedAddressesString) {
        try {
          const cachedAddresses = JSON.parse(cachedAddressesString);
          if (
            cachedAddresses &&
            Array.isArray(cachedAddresses) &&
            cachedAddresses.length > 0
          ) {
            // Setăm adresele din cache pentru a le afișa imediat
            setAddresses(cachedAddresses);

            // Determinăm adresa favorită din cache
            const cachedFavorite = cachedAddresses.find(
              (addr) => addr.is_default
            );
            if (cachedFavorite) {
              setFavoriteAddress(cachedFavorite);
            }

            // Verificăm ID-urile salvate
            const savedDeliveryId = localStorage.getItem(
              "selected_delivery_address_id"
            );
            const savedBillingId = localStorage.getItem(
              "selected_billing_address_id"
            );

            // Setăm adresa de livrare din cache
            if (savedDeliveryId) {
              const cachedDeliveryAddr = cachedAddresses.find(
                (addr) => addr.id === savedDeliveryId
              );
              if (cachedDeliveryAddr) {
                setDeliveryAddressState(cachedDeliveryAddr);
              } else if (cachedFavorite) {
                setDeliveryAddressState(cachedFavorite);
              }
            } else if (cachedFavorite) {
              setDeliveryAddressState(cachedFavorite);
            }

            // Setăm adresa de facturare din cache
            if (savedBillingId) {
              const cachedBillingAddr = cachedAddresses.find(
                (addr) => addr.id === savedBillingId
              );
              if (cachedBillingAddr) {
                setBillingAddressState(cachedBillingAddr);
              }
            }

            // Marcăm că adresele sunt pregătite (din cache)
            setIsAddressesReady(true);
          }
        } catch (error) {
          console.error("Eroare la parsarea adreselor din cache:", error);
        }
      }

      // Fetchăm adresele actuale din baza de date
      await fetchAddresses();
    };

    loadInitialData();
    // fetchAddresses este memorată, deci nu se va reexecuta efectul în mod repetat
  }, [fetchAddresses]);

  // Inițializarea adreselor selectate din order_details și localStorage - rulează doar o singură dată la încărcarea componentei
  useEffect(() => {
    // Folosim un flag pentru a ne asigura că această inițializare rulează doar o dată
    let isInitialized = false;

    const orderId = localStorage.getItem("tempOrderId");
    const initSelectedAddresses = async () => {
      if (!addresses.length || isInitialized) return;

      // Verificăm prima dată ID-urile salvate în localStorage
      const savedDeliveryAddressId = localStorage.getItem(
        "selected_delivery_address_id"
      );
      const savedBillingAddressId = localStorage.getItem(
        "selected_billing_address_id"
      );

      // Căutăm adresele salvate în lista de adrese
      let deliveryAddr = null;
      let billingAddr = null;

      if (savedDeliveryAddressId) {
        deliveryAddr = addresses.find(
          (addr) => addr.id === savedDeliveryAddressId
        );
      }

      if (savedBillingAddressId) {
        billingAddr = addresses.find(
          (addr) => addr.id === savedBillingAddressId
        );
      }

      // Dacă avem orderId, verificăm și în baza de date
      if (orderId) {
        const { data, error } = await supabase
          .from("order_details")
          .select("delivery_address_id, billing_address_id")
          .eq("id", orderId)
          .single();

        if (!error && data) {
          // Dacă nu avem adrese din localStorage, folosim adresele din BD
          if (!deliveryAddr && data.delivery_address_id) {
            deliveryAddr = addresses.find(
              (addr) => addr.id === data.delivery_address_id
            );
          }

          if (!billingAddr && data.billing_address_id) {
            billingAddr = addresses.find(
              (addr) => addr.id === data.billing_address_id
            );
          }
        }
      }

      // Dacă nu am găsit nicio adresă, folosim adresa favorită
      if (!deliveryAddr && favoriteAddress) {
        deliveryAddr = favoriteAddress;
      }

      if (!billingAddr && favoriteAddress) {
        billingAddr = favoriteAddress;
      }

      // Setăm adresele doar dacă nu sunt deja setate și avem adrese
      if (!deliveryAddress && deliveryAddr) {
        setDeliveryAddressState(deliveryAddr);
      }

      if (!billingAddress && billingAddr) {
        setBillingAddressState(billingAddr);
      }

      // Marcăm ca inițializat
      isInitialized = true;
    };

    if (isAddressesReady && !isInitialized) {
      initSelectedAddresses();
    }

    // Cleanup function to prevent memory leaks
    return () => {
      isInitialized = true;
    };
  }, [
    isAddressesReady,
    addresses,
    favoriteAddress,
    deliveryAddress,
    billingAddress,
  ]);

  // Adăugăm un efect pentru sincronizarea inițială între adresa de livrare și cea de facturare
  useEffect(() => {
    // Dacă avem adresă de livrare dar nu avem adresă de facturare, sincronizăm automat
    if (deliveryAddress && !billingAddress) {
      setBillingAddressState(deliveryAddress);

      // Salvăm ID-ul în localStorage pentru persistență
      if (deliveryAddress.id) {
        localStorage.setItem("selected_billing_address_id", deliveryAddress.id);

        // Actualizăm și în baza de date dacă avem orderId
        const orderId = localStorage.getItem("tempOrderId");
        if (orderId) {
          supabase
            .from("order_details")
            .update({ billing_address_id: deliveryAddress.id })
            .eq("id", orderId);
        }
      }
    }
  }, [deliveryAddress, billingAddress, setBillingAddressState]);

  // Funcții de actualizare a adreselor din order_details
  const setDeliveryAddress = async (address, orderId) => {
    if (!orderId || !address?.id) return;
    const { error } = await supabase
      .from("order_details")
      .update({ delivery_address_id: address.id })
      .eq("id", orderId);
    if (error) {
      console.error("Error updating delivery address:", error.message);
      return;
    }
    setDeliveryAddressState(address);

    // Salvăm adresa în localStorage pentru a păstra selecția între navigări
    localStorage.setItem("selected_delivery_address_id", address.id);
  };

  const setBillingAddress = async (address, orderId) => {
    if (!orderId || !address?.id) return;
    const { error } = await supabase
      .from("order_details")
      .update({ billing_address_id: address.id })
      .eq("id", orderId);
    if (error) {
      console.error("Error updating billing address:", error.message);
      return;
    }
    setBillingAddressState(address);

    // Salvăm adresa în localStorage pentru a păstra selecția între navigări
    localStorage.setItem("selected_billing_address_id", address.id);
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        favoriteAddress,
        isAddressesReady,
        fetchAddresses,
        deliveryAddress,
        billingAddress,
        setDeliveryAddress,
        setBillingAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

AddressProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
