// DeliveryMethod.jsx
import PropTypes from "prop-types";
import { useContext, useState, useEffect } from "react";
import { AddressContext } from "../context/AddressContext";
import SelectAddressPopup from "./SelectAddressPopup";
import EditAddressPopup from "./EditAddressPopup";

const DeliveryMethod = ({ orderId, deliveryMethod, setDeliveryMethod }) => {
  // Extragem din context doar ce e necesar (eliminând variabila nefolosită 'favoriteAddress')
  const { addresses, deliveryAddress, setDeliveryAddress, fetchAddresses } =
    useContext(AddressContext);
  const [showPopup, setShowPopup] = useState(false); // Pentru pop-up-ul de selecție a adresei
  const [showEditPopup, setShowEditPopup] = useState(false); // Pentru pop-up-ul de editare
  const [editingAddress, setEditingAddress] = useState(null);

  // Se asigură că adresa de livrare este afișată imediat ce este disponibilă și persistă la refresh
  useEffect(() => {
    if (addresses.length > 0) {
      // Prima dată verificăm dacă avem deja un ID salvat în localStorage
      const savedAddressId = localStorage.getItem(
        "selected_delivery_address_id"
      );

      if (savedAddressId && !deliveryAddress) {
        // Dacă avem ID salvat dar nu avem adresă setată, încercăm să găsim adresa
        const savedAddress = addresses.find(
          (addr) => addr.id === savedAddressId
        );

        if (savedAddress) {
          // Dacă găsim adresa salvată, o setăm
          setDeliveryAddress(savedAddress, orderId);
        } else {
          // Dacă nu găsim adresa salvată (probabil a fost ștearsă), folosim adresa favorită
          const favoriteAddr = addresses.find((addr) => addr.is_default);
          if (favoriteAddr) {
            setDeliveryAddress(favoriteAddr, orderId);
            localStorage.setItem(
              "selected_delivery_address_id",
              favoriteAddr.id
            );
          }
        }
      } else if (!deliveryAddress) {
        // Dacă nu avem ID salvat și nici adresă setată, folosim adresa favorită sau prima adresă
        const favoriteAddr = addresses.find((addr) => addr.is_default);
        if (favoriteAddr) {
          setDeliveryAddress(favoriteAddr, orderId);
          localStorage.setItem("selected_delivery_address_id", favoriteAddr.id);
        } else if (addresses.length > 0) {
          // Dacă nu avem adresă favorită, folosim prima adresă
          setDeliveryAddress(addresses[0], orderId);
          localStorage.setItem("selected_delivery_address_id", addresses[0].id);
        }
      }
    }
  }, [addresses, deliveryAddress, setDeliveryAddress, orderId]);

  // Ascultăm evenimentele de actualizare a adresei pentru sincronizare
  useEffect(() => {
    const handleAddressUpdate = (event) => {
      const { oldAddressId, newAddress } = event.detail;
      // Dacă adresa actualizată este aceeași cu adresa de livrare, o actualizăm
      if (deliveryAddress && deliveryAddress.id === oldAddressId) {
        setDeliveryAddress(newAddress, orderId);
      }
    };

    window.addEventListener("address-updated", handleAddressUpdate);

    return () => {
      window.removeEventListener("address-updated", handleAddressUpdate);
    };
  }, [deliveryAddress, setDeliveryAddress, orderId]);

  const handleAddressSelect = async (address) => {
    if (!address?.id) {
      console.error("Adresa selectată este invalidă:", address);
      return;
    }
    await setDeliveryAddress(address, orderId);
    setShowPopup(false);
  };

  const openEditPopup = (address) => {
    setEditingAddress(address);
    setShowEditPopup(true);
  };

  const closeEditPopup = () => {
    setShowEditPopup(false);
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
          {deliveryAddress ? (
            <div className="pl-4 mt-2 mb-3 bg-gray-50 p-2 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  <strong>Nume:</strong> {deliveryAddress.name}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Telefon:</strong> {deliveryAddress.phone_number}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Adresă:</strong> {deliveryAddress.address},{" "}
                  {deliveryAddress.city}, {deliveryAddress.county}
                </p>
              </div>
              <button
                className="bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 shadow-md transition duration-200 active:scale-95"
                onClick={() => openEditPopup(deliveryAddress)}
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
        selectedAddress={deliveryAddress}
        handleAddressSelect={handleAddressSelect}
        openEditPopup={openEditPopup}
        setShowEditPopup={setShowEditPopup}
      />

      <EditAddressPopup
        isOpen={showEditPopup}
        onClose={closeEditPopup}
        address={editingAddress || {}}
        fetchAddresses={fetchAddresses}
        updateSelectedAddress={(updatedAddress) => {
          // Dacă adresa curentă este cea de livrare, actualizează adresa
          if (editingAddress?.id === deliveryAddress?.id) {
            setDeliveryAddress(updatedAddress, orderId);

            // Notificăm schimbarea globală a acestei adrese pentru sincronizare
            const updateEvent = new CustomEvent("address-updated", {
              detail: {
                oldAddressId: editingAddress?.id,
                newAddress: updatedAddress,
              },
            });
            window.dispatchEvent(updateEvent);
          }
        }}
      />
    </div>
  );
};

DeliveryMethod.propTypes = {
  deliveryMethod: PropTypes.string.isRequired,
  setDeliveryMethod: PropTypes.func.isRequired,
  orderId: PropTypes.string.isRequired,
};

export default DeliveryMethod;
