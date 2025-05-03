import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // Conexiunea cu Supabase
import SelectAddressPopup from "./SelectAddressPopup"; // Importăm componenta de selecție
import EditAddressPopup from "./EditAddressPopup"; // Importăm componenta de editare

const DeliveryMethod = ({
  deliveryMethod,
  setDeliveryMethod,
  selectedAddress,
  setSelectedAddress,
  favoriteAddress,
  addresses,
  orderId,
  fetchAddresses, // Adăugăm prop-ul transmis
}) => {
  // Stări pentru pop-up-uri
  const [showPopup, setShowPopup] = useState(false); // Pop-up de selecție adresă
  const [showEditPopup, setShowEditPopup] = useState(false); // Pop-up de editare adresă
  const [editingAddress, setEditingAddress] = useState(null);

  // 1. Sincronizăm adresa selectată la montare și după refresh
  useEffect(() => {
    console.log("OrderId utilizat în DeliveryMethod:", orderId);
    console.log("Adrese disponibile:", addresses);
    console.log("Adresa favorită:", favoriteAddress);

    const syncSelectedAddress = async () => {
      if (!orderId) {
        console.warn("Order ID este null sau invalid.");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("order_details")
          .select("delivery_address_id")
          .eq("id", orderId)
          .single();

        if (!error && data?.delivery_address_id) {
          const deliveryAddress = addresses.find(
            (address) => address.id === data.delivery_address_id
          );

          if (deliveryAddress) {
            setSelectedAddress(deliveryAddress); // Setam adresa selectată
            console.log(
              "Adresa selectată sincronizată din Supabase:",
              deliveryAddress
            );
          }
        } else if (favoriteAddress) {
          // Dacă nu există delivery_address_id, folosim adresa favorită
          setSelectedAddress(favoriteAddress);
          console.log("Adresa favorită setată:", favoriteAddress);

          // Actualizăm Supabase cu adresa favorită
          await supabase
            .from("order_details")
            .update({ delivery_address_id: favoriteAddress.id })
            .eq("id", orderId);
        }
      } catch (err) {
        console.error(
          "Eroare la sincronizarea adresei selectate:",
          err.message
        );
      }
    };

    if (addresses.length > 0) {
      syncSelectedAddress();
    }
  }, [addresses, favoriteAddress, orderId, setSelectedAddress]);

  // 2. Sincronizarea automată când `selectedAddress` se schimbă
  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!selectedAddress?.id || !orderId) {
        console.warn("Adresa sau ID-ul comenzii sunt invalide.");
        return;
      }

      try {
        const { error } = await supabase
          .from("order_details")
          .update({ delivery_address_id: selectedAddress.id })
          .eq("id", orderId);

        if (!error) {
          console.log(
            `Adresa ${selectedAddress.id} sincronizată cu 'delivery_address_id'.`
          );
        } else {
          console.error(
            "Eroare la sincronizare 'delivery_address_id':",
            error.message
          );
        }
      } catch (err) {
        console.error(
          "Eroare neașteptată la sincronizarea 'delivery_address_id':",
          err.message
        );
      }
    };

    if (selectedAddress?.id && orderId) {
      syncWithSupabase();
    }
  }, [selectedAddress, orderId]);

  // 3. Gestionăm selecția unei adrese
  const handleAddressSelect = async (address) => {
    if (!address?.id || typeof address.id !== "string") {
      console.error("Adresa selectată este invalidă:", address);
      return;
    }

    try {
      const { error } = await supabase
        .from("order_details")
        .update({ delivery_address_id: address.id })
        .eq("id", orderId);

      if (!error) {
        setSelectedAddress(address); // Setăm adresa selectată
        console.log("Adresa selectată actualizată:", address.id);
      } else {
        console.error("Eroare la actualizarea adresei:", error.message);
      }
    } catch (err) {
      console.error("Eroare neașteptată la selectarea adresei:", err.message);
    }

    setShowPopup(false); // Închidem pop-up-ul
  };

  // Gestionăm editarea unei adrese
  const openEditPopup = (address) => {
    setEditingAddress(address); // Setăm adresa în curs de editare
    setShowEditPopup(true); // Afișăm pop-up-ul de editare
  };

  const closeEditPopup = () => {
    setShowEditPopup(false);
  };

  // Gestionăm salvarea unei adrese noi sau editate
  const updateSelectedAddress = async (updatedAddress) => {
    if (!updatedAddress?.id) {
      console.error("Adresa actualizată este invalidă:", updatedAddress);
      return;
    }

    try {
      const { error } = await supabase
        .from("order_details")
        .update({ delivery_address_id: updatedAddress.id })
        .eq("id", orderId);

      if (!error) {
        await fetchAddresses(); // Reîmprospătăm lista globală de adrese
        setSelectedAddress(updatedAddress); // Setăm adresa actualizată
        console.log("Adresa actualizată sincronizată cu succes.");
      } else {
        console.error("Eroare la actualizarea adresei:", error.message);
      }
    } catch (err) {
      console.error("Eroare neașteptată la actualizarea adresei:", err.message);
    }
  };

  return (
    <div className="mb-6 border rounded-md p-4 sm:p-4 bg-gray-50 shadow-md w-full sm:w-auto">
      <h2 className="text-xl font-semibold mb-4">1. Modalitate livrare</h2>

      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="radio"
            name="deliveryMethod"
            value="courier"
            checked={deliveryMethod === "courier"}
            onChange={() => setDeliveryMethod("courier")}
            className="mr-2"
          />
          Livrare prin curier
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="deliveryMethod"
            value="pickup"
            checked={deliveryMethod === "pickup"}
            onChange={() => setDeliveryMethod("pickup")}
            className="mr-2"
          />
          Ridicare personală
        </label>
      </div>

      {deliveryMethod === "courier" && (
        <div className="mt-4">
          <h3 className="font-semibold">Livrare prin curier la:</h3>
          {selectedAddress ? (
            <div className="pl-4 mt-2 mb-3 bg-gray-50 p-2 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  <strong>Nume:</strong> {selectedAddress.name}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Telefon:</strong> {selectedAddress.phone_number}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Adresă:</strong> {selectedAddress.address},{" "}
                  {selectedAddress.city}, {selectedAddress.county}
                </p>
              </div>
              <button
                className="bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
                onClick={() => openEditPopup(selectedAddress)}
              >
                Editează
              </button>
            </div>
          ) : (
            <p>Nu există o adresă selectată.</p>
          )}

          <div className="mt-2 flex space-x-4">
            {addresses.length === 0 ? (
              <button
                className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-4 py-2 rounded-md shadow-md transition duration-200"
                onClick={() => openEditPopup(null)}
              >
                Adaugă adresă
              </button>
            ) : (
              <button
                className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-gray-100 active:scale-95 transition duration-200"
                onClick={() => setShowPopup(true)}
              >
                Alege altă adresă
              </button>
            )}
          </div>
        </div>
      )}

      <SelectAddressPopup
        showPopup={showPopup}
        handlePopupClose={() => setShowPopup(false)}
        sortedAddresses={addresses}
        popupContext={"delivery"}
        selectedAddress={selectedAddress}
        billingAddress={null}
        handleAddressSelect={handleAddressSelect}
        openEditPopup={openEditPopup}
        setShowEditPopup={setShowEditPopup}
      />

      <EditAddressPopup
        isOpen={showEditPopup}
        onClose={closeEditPopup}
        address={editingAddress || {}}
        fetchAddresses={fetchAddresses}
        updateSelectedAddress={updateSelectedAddress}
      />
    </div>
  );
};

EditAddressPopup.propTypes = {
  address: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // Acceptăm ambele tipuri
    name: PropTypes.string,
    phone_number: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    county: PropTypes.string,
    is_default: PropTypes.bool,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchAddresses: PropTypes.func.isRequired,
  updateSelectedAddress: PropTypes.func,
};

DeliveryMethod.propTypes = {
  deliveryMethod: PropTypes.string.isRequired,
  setDeliveryMethod: PropTypes.func.isRequired,
  selectedAddress: PropTypes.object,
  addresses: PropTypes.array.isRequired,
  setSelectedAddress: PropTypes.func.isRequired,
  orderId: PropTypes.string.isRequired,
  favoriteAddress: PropTypes.object,
  fetchAddresses: PropTypes.func.isRequired,
};

export default DeliveryMethod;
