import PropTypes from "prop-types";
import { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import SelectBillingPopup from "./SelectBillingPopup"; // Importăm pop-up-ul de selecție
import { AddressContext } from "../context/AddressContext"; // Importăm contextul adreselor

const BillingDetails = ({
  billingAddress,
  setBillingAddress,
  orderId,
  fetchAddresses,
}) => {
  const [showPopup, setShowPopup] = useState(false); // Stare pentru pop-up-ul de selecție
  const { addresses, favoriteAddress, isAddressesReady } =
    useContext(AddressContext); // Adăugăm `isAddressesReady`

  // 1. Sincronizăm adresa implicită sau favorită la montarea paginii
  useEffect(() => {
    if (!isAddressesReady) {
      console.log("Adresele nu sunt încă pregătite. Așteptăm sincronizarea.");
      return;
    }

    console.log("Lista de adrese disponibilă:", addresses);
    console.log("Adresa favorită disponibilă:", favoriteAddress);
    console.log("OrderId utilizat:", orderId);

    const syncSelectedBillingAddress = async () => {
      if (!orderId) {
        console.warn("Order ID este null sau invalid.");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("order_details")
          .select("billing_address_id")
          .eq("id", orderId)
          .single();

        if (!error && data?.billing_address_id) {
          const defaultBillingAddress = addresses.find(
            (address) => address.id === data.billing_address_id
          );

          if (defaultBillingAddress) {
            setBillingAddress(defaultBillingAddress); // Setăm adresa selectată
            console.log(
              "Adresa selectată sincronizată din Supabase:",
              defaultBillingAddress
            );
          } else {
            console.warn(
              "Adresa selectată nu a fost găsită în lista de adrese."
            );
          }
        } else if (favoriteAddress) {
          // Dacă nu există billing_address_id, folosim adresa favorită
          setBillingAddress(favoriteAddress);
          console.log("Adresa favorită setată:", favoriteAddress);

          // Actualizăm Supabase cu adresa favorită
          await supabase
            .from("order_details")
            .update({ billing_address_id: favoriteAddress.id })
            .eq("id", orderId);
        } else {
          console.warn("Nu există adrese favorite disponibile.");
        }
      } catch (err) {
        console.error(
          "Eroare la sincronizarea adresei de facturare selectate:",
          err.message
        );
      }
    };

    if (addresses.length > 0) {
      syncSelectedBillingAddress();
    }
  }, [
    addresses,
    favoriteAddress,
    orderId,
    setBillingAddress,
    isAddressesReady,
  ]);

  // 2. Sincronizăm automat când `billingAddress` se schimbă
  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!billingAddress?.id || !orderId) {
        console.warn("Adresa sau ID-ul comenzii sunt invalide.");
        return;
      }

      try {
        const { error } = await supabase
          .from("order_details")
          .update({ billing_address_id: billingAddress.id })
          .eq("id", orderId);

        if (!error) {
          console.log(
            `Adresa ${billingAddress.id} sincronizată cu 'billing_address_id'.`
          );
        } else {
          console.error(
            "Eroare la sincronizare 'billing_address_id':",
            error.message
          );
        }
      } catch (err) {
        console.error(
          "Eroare neașteptată la sincronizarea 'billing_address_id':",
          err.message
        );
      }
    };

    if (billingAddress?.id && orderId) {
      syncWithSupabase();
    }
  }, [billingAddress, orderId]);

  // 3. Gestionăm selecția unei adrese
  const handleAddressSelect = async (address) => {
    if (!address?.id || typeof address.id !== "string") {
      console.error("Adresa selectată este invalidă:", address);
      return;
    }

    try {
      const { error } = await supabase
        .from("order_details")
        .update({ billing_address_id: address.id })
        .eq("id", orderId);

      if (!error) {
        setBillingAddress(address); // Setăm adresa selectată
        console.log("Adresa selectată actualizată:", address.id);
      } else {
        console.error("Eroare la actualizarea adresei:", error.message);
      }
    } catch (err) {
      console.error("Eroare neașteptată la selectarea adresei:", err.message);
    }

    setShowPopup(false); // Închidem pop-up-ul
  };

  return (
    <div className="mb-6 border rounded-md p-4 bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">2. Date facturare</h2>

      {billingAddress ? (
        <div className="pl-4 mt-2 mb-3 bg-gray-50 p-2 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              <strong>Nume:</strong> {billingAddress.name}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Telefon:</strong> {billingAddress.phone_number}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Adresă:</strong> {billingAddress.address},{" "}
              {billingAddress.city}, {billingAddress.county}
            </p>
          </div>
        </div>
      ) : (
        <p>Nu există adresă de facturare selectată.</p>
      )}

      <div className="mt-2 flex space-x-4">
        <button
          className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 active:scale-95 transition duration-200"
          onClick={() => setShowPopup(true)}
        >
          Alege altă adresă
        </button>
      </div>

      {/* Pop-up-ul pentru selecția adresei */}
      <SelectBillingPopup
        showPopup={showPopup}
        handlePopupClose={() => setShowPopup(false)}
        sortedAddresses={addresses}
        billingAddress={billingAddress}
        handleAddressSelect={handleAddressSelect}
        fetchAddresses={fetchAddresses}
      />
    </div>
  );
};

BillingDetails.propTypes = {
  billingAddress: PropTypes.shape({
    name: PropTypes.string.isRequired,
    phone_number: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    county: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }),
  addresses: PropTypes.array.isRequired,
  favoriteAddress: PropTypes.object, // Adresă favorită
  orderId: PropTypes.string.isRequired,
  setBillingAddress: PropTypes.func.isRequired,
  fetchAddresses: PropTypes.func.isRequired,
};

export default BillingDetails;
