// BillingDetails.jsx
import PropTypes from "prop-types";
import { useContext, useState, useEffect } from "react";
import { AddressContext } from "../context/AddressContext";
import SelectBillingPopup from "./SelectBillingPopup";

const BillingDetails = ({ orderId, fetchAddresses }) => {
  // Extragem din context lista de adrese, adresa de facturare curentă și funcția de setare
  const { addresses, billingAddress, setBillingAddress } =
    useContext(AddressContext);

  // Adăugăm o stare locală pentru controlul vizibilității pop-up-ului
  const [showPopup, setShowPopup] = useState(false);

  // Se asigură că adresa de facturare este afișată imediat ce este disponibilă și persistă la refresh
  useEffect(() => {
    if (addresses.length > 0) {
      // Prima dată verificăm dacă avem deja un ID salvat în localStorage
      const savedAddressId = localStorage.getItem(
        "selected_billing_address_id"
      );
      const savedDeliveryId = localStorage.getItem(
        "selected_delivery_address_id"
      );

      if (savedAddressId && !billingAddress) {
        // Dacă avem ID salvat dar nu avem adresă setată, încercăm să găsim adresa
        const savedAddress = addresses.find(
          (addr) => addr.id === savedAddressId
        );

        if (savedAddress) {
          // Dacă găsim adresa salvată, o setăm
          setBillingAddress(savedAddress, orderId);
        } else if (savedDeliveryId) {
          // Dacă nu găsim adresa salvată, încercăm să folosim adresa de livrare
          const deliveryAddress = addresses.find(
            (addr) => addr.id === savedDeliveryId
          );
          if (deliveryAddress) {
            setBillingAddress(deliveryAddress, orderId);
            localStorage.setItem(
              "selected_billing_address_id",
              deliveryAddress.id
            );
          }
        }
      } else if (!billingAddress && savedDeliveryId) {
        // Dacă nu avem adresă de facturare dar avem adresă de livrare, o folosim pe aceasta
        const deliveryAddress = addresses.find(
          (addr) => addr.id === savedDeliveryId
        );
        if (deliveryAddress) {
          setBillingAddress(deliveryAddress, orderId);
          localStorage.setItem(
            "selected_billing_address_id",
            deliveryAddress.id
          );
        }
      } else if (!billingAddress) {
        // Dacă nu avem nici adresă de facturare nici referință salvată, folosim adresa favorită sau prima adresă
        const favoriteAddr = addresses.find((addr) => addr.is_default);
        if (favoriteAddr) {
          setBillingAddress(favoriteAddr, orderId);
          localStorage.setItem("selected_billing_address_id", favoriteAddr.id);
        } else if (addresses.length > 0) {
          // Dacă nu avem adresă favorită, folosim prima adresă
          setBillingAddress(addresses[0], orderId);
          localStorage.setItem("selected_billing_address_id", addresses[0].id);
        }
      }
    }
  }, [addresses, billingAddress, setBillingAddress, orderId]);

  // Ascultăm evenimentele de actualizare a adresei pentru sincronizare
  useEffect(() => {
    const handleAddressUpdate = (event) => {
      const { oldAddressId, newAddress } = event.detail;
      // Dacă adresa actualizată este aceeași cu adresa de facturare, o actualizăm
      if (billingAddress && billingAddress.id === oldAddressId) {
        setBillingAddress(newAddress, orderId);
      }
    };

    window.addEventListener("address-updated", handleAddressUpdate);

    return () => {
      window.removeEventListener("address-updated", handleAddressUpdate);
    };
  }, [billingAddress, setBillingAddress, orderId]);

  // Funcția de selectare a unei adrese pentru facturare
  const handleAddressSelect = async (address) => {
    if (!address?.id) {
      console.error("Adresa selectată este invalidă:", address);
      return;
    }
    await setBillingAddress(address, orderId);
    setShowPopup(false); // Închidem pop-up-ul după ce se selectează o adresă
  };

  return (
    <div className="mb-6 border rounded-md p-4 bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">2. Date facturare</h2>

      {billingAddress ? (
        <div className="pl-4 mt-2 mb-3 bg-gray-50 p-2">
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
  orderId: PropTypes.string.isRequired,
  fetchAddresses: PropTypes.func.isRequired,
};

export default BillingDetails;
