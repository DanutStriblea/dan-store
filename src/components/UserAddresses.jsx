import { useState, useContext, useEffect } from "react";
import { AddressContext } from "../context/AddressContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import EditAddressPopup from "./EditAddressPopup";
import AddNewAddress from "./AddNewAddress";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const UserAddresses = () => {
  const { addresses, fetchAddresses } = useContext(AddressContext);
  const [localAddresses, setLocalAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingFavorite, setIsSettingFavorite] = useState(false);

  // Actualizăm localAddresses când se schimbă addresses din context
  useEffect(() => {
    if (addresses && addresses.length > 0 && !isSettingFavorite) {
      setLocalAddresses(addresses);
    }
  }, [addresses, isSettingFavorite]);

  const navigate = useNavigate();

  const animateHeartIcon = (iconElement) => {
    if (iconElement) {
      // Prima fază: scale la 1.1 în 150ms
      iconElement.style.transition = "transform 0.15s ease-out";
      iconElement.style.transform = "scale(1.1)";

      setTimeout(() => {
        // A doua fază: scale la 0.9 după 150ms
        iconElement.style.transform = "scale(0.9)";
      }, 150);

      setTimeout(() => {
        // A treia fază: scale la 1.2 după 300ms
        iconElement.style.transform = "scale(1.2)";
      }, 300);

      setTimeout(() => {
        // Revenire: scale la 1 după 600ms
        iconElement.style.transform = "scale(1)";
      }, 600);
    }
  };

  // Reîmprospătăm lista de adrese la montarea paginii
  useEffect(() => {
    const loadAddresses = async () => {
      setLoading(true);
      try {
        await fetchAddresses();
      } catch (err) {
        console.error("Eroare la încărcarea adreselor:", err);
        setError("Nu am putut încărca adresele. Te rugăm să încerci din nou.");
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [fetchAddresses]);

  const openEditPopup = (address = null) => {
    setEditingAddress(address);
    setShowEditPopup(true);
  };

  const closeEditPopup = () => {
    setEditingAddress(null);
    setShowEditPopup(false);
  };

  const openDeleteModal = (address) => {
    setAddressToDelete(address);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
    setAddressToDelete(null);
  };

  const deleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      // Verificăm dacă adresa pe care o ștergem este setată ca adresă de livrare sau facturare
      const deliveryAddressId = localStorage.getItem(
        "selected_delivery_address_id"
      );
      const billingAddressId = localStorage.getItem(
        "selected_billing_address_id"
      );
      const isSelectedForDelivery = deliveryAddressId === addressToDelete.id;
      const isSelectedForBilling = billingAddressId === addressToDelete.id;

      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", addressToDelete.id);

      if (error) {
        throw error;
      }

      // Obținem adresele rămase
      const { data: remainingAddresses, error: fetchError } = await supabase
        .from("user_addresses")
        .select("*");

      if (fetchError) {
        throw fetchError;
      }

      // Dacă nu mai avem adrese, curățăm localStorage și order_details
      if (remainingAddresses.length === 0) {
        localStorage.removeItem("selected_delivery_address_id");
        localStorage.removeItem("selected_billing_address_id");
        sessionStorage.removeItem("cached_addresses");

        // Actualizăm starea locală imediat pentru a reflecta că nu mai avem adrese
        setLocalAddresses([]);

        // Actualizăm și order_details dacă există
        const orderId = localStorage.getItem("tempOrderId");
        if (orderId) {
          await supabase
            .from("order_details")
            .update({
              delivery_address_id: null,
              billing_address_id: null,
            })
            .eq("id", orderId);
        }

        // Notificăm componentele că adresa a fost ștearsă
        const deleteEvent = new CustomEvent("address-deleted", {
          detail: {
            addressId: addressToDelete.id,
          },
        });
        window.dispatchEvent(deleteEvent);
      } else {
        // Dacă era adresa favorită, setăm o nouă favorită
        if (addressToDelete.is_default) {
          const nextFavorite = remainingAddresses[0]; // Prima adresă rămasă
          await supabase
            .from("user_addresses")
            .update({ is_default: true })
            .eq("id", nextFavorite.id);

          // Dacă adresa ștearsă era folosită pentru livrare/facturare, actualizăm cu noua favorită
          if (isSelectedForDelivery) {
            localStorage.setItem(
              "selected_delivery_address_id",
              nextFavorite.id
            );
            const orderId = localStorage.getItem("tempOrderId");
            if (orderId) {
              await supabase
                .from("order_details")
                .update({ delivery_address_id: nextFavorite.id })
                .eq("id", orderId);
            }
          }

          if (isSelectedForBilling) {
            localStorage.setItem(
              "selected_billing_address_id",
              nextFavorite.id
            );
            const orderId = localStorage.getItem("tempOrderId");
            if (orderId) {
              await supabase
                .from("order_details")
                .update({ billing_address_id: nextFavorite.id })
                .eq("id", orderId);
            }
          }
        } else {
          // Dacă nu era favorită dar era selectată, actualizăm cu adresa favorită
          if (isSelectedForDelivery || isSelectedForBilling) {
            const favoriteAddress =
              remainingAddresses.find((addr) => addr.is_default) ||
              remainingAddresses[0];

            if (isSelectedForDelivery) {
              localStorage.setItem(
                "selected_delivery_address_id",
                favoriteAddress.id
              );
              const orderId = localStorage.getItem("tempOrderId");
              if (orderId) {
                await supabase
                  .from("order_details")
                  .update({ delivery_address_id: favoriteAddress.id })
                  .eq("id", orderId);
              }
            }

            if (isSelectedForBilling) {
              localStorage.setItem(
                "selected_billing_address_id",
                favoriteAddress.id
              );
              const orderId = localStorage.getItem("tempOrderId");
              if (orderId) {
                await supabase
                  .from("order_details")
                  .update({ billing_address_id: favoriteAddress.id })
                  .eq("id", orderId);
              }
            }
          }
        }
      }

      // Actualizăm starea locală imediat pentru a reflecta schimbarea
      setLocalAddresses(remainingAddresses);

      // Ștergem eventualele erori anterioare
      setError(null);

      // Actualizăm lista de adrese în context
      await fetchAddresses();
    } catch (err) {
      console.error("Eroare la ștergerea adresei:", err);
      setError("Nu am putut șterge adresa. Te rugăm să încerci din nou.");
    } finally {
      // Închidem pop-up-ul indiferent de rezultat
      closeDeleteModal();
    }
  };

  const setDefaultAddress = async (address) => {
    if (address.is_default) return; // Evităm să procesăm dacă adresa este deja favorită

    try {
      // Aplicăm schimbarea locală pentru afișare imediată
      setLocalAddresses((currentAddresses) =>
        currentAddresses.map((addr) => ({
          ...addr,
          is_default: addr.id === address.id,
        }))
      );

      // Setăm flag-ul ca să știm că suntem în procesul de schimbare
      setIsSettingFavorite(true);

      // Resetăm toate adresele favorite
      const { error: resetError } = await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", address.user_id);

      if (resetError) {
        throw resetError;
      }

      // Setăm adresa selectată ca favorită
      const { error: setDefaultError } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", address.id);

      if (setDefaultError) {
        throw setDefaultError;
      }

      // Actualizăm `delivery_address_id` în `order_details`
      const orderId = localStorage.getItem("tempOrderId");
      if (orderId) {
        const { error: updateError } = await supabase
          .from("order_details")
          .update({ delivery_address_id: address.id })
          .eq("id", orderId);

        if (updateError) {
          throw updateError;
        }
      }

      // Actualizăm localStorage pentru a fi folosit de DeliveryMethod
      localStorage.setItem("selected_delivery_address_id", address.id);

      // Notificăm alte componente despre schimbarea adresei favorite
      const updateEvent = new CustomEvent("address-updated", {
        detail: {
          oldAddressId: null,
          newAddress: address,
        },
      });
      window.dispatchEvent(updateEvent);

      // Curățăm erorile existente
      setError(null);

      // Actualizăm în fundal datele din context
      await fetchAddresses();
    } catch (err) {
      console.error("Eroare la setarea adresei favorite:", err);
      setError(
        "Nu am putut seta adresa ca favorită. Te rugăm să încerci din nou."
      );
    } finally {
      // Resetăm flag-ul indiferent de rezultat
      setIsSettingFavorite(false);
    }
  };

  const navigateToAccount = () => {
    navigate("/MyAccount");
  };

  // Folosim adresele din context doar dacă localAddresses este gol
  const displayAddresses =
    localAddresses.length > 0 ? localAddresses : addresses;

  return (
    <div className="max-w-4xl mx-auto p-6 pb-5 bg-slate-200 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-sky-900 mb-6">Adresele Mele</h1>

      {loading && !isSettingFavorite ? (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : displayAddresses.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">Nu ai nicio adresă salvată.</p>
          <p className="text-sm text-gray-500">
            Adaugă o adresă nouă pentru a finaliza comenzile mai rapid.
          </p>
          <button
            className="mt-4 bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-3 py-2 rounded-md transform transition duration-250 active:scale-105"
            onClick={() => openEditPopup()}
          >
            Adaugă Adresă
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sortăm adresele: favorita prima, restul în ordine cronologică */}
          {[...displayAddresses]
            .sort((a, b) => {
              // Dacă una dintre adrese este favorită, aceasta va fi prima
              if (a.is_default) return -1;
              if (b.is_default) return 1;

              // Pentru celelalte adrese, le ordonăm cronologic
              if (a.created_at && b.created_at) {
                return new Date(a.created_at) - new Date(b.created_at);
              }

              // Fallback la sortare după ID dacă nu există timestamp
              return a.id.localeCompare(b.id);
            })
            .map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-lg shadow-md p-4 pb-1.5 md:pb-5 ${
                  address.is_default
                    ? "border-l-4 border-r-4 border-sky-700"
                    : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold text-lg">
                        {address.name}
                      </span>
                      {address.is_default && (
                        <span className="ml-2 bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full">
                          Favorită
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-snug">
                      {address.phone_number}
                    </p>
                    <p className="text-gray-600 leading-snug">
                      {address.address}, {address.city}, {address.county}
                    </p>
                  </div>
                  <div className="flex space-x-3 pt-1 md:pt-0 border-t md:border-t-0 mt-1 md:mt-0 mb-1 md:mb-0">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition-colors px-2 py-0.5 md:py-1 rounded-md hover:bg-blue-50"
                      onClick={() => openEditPopup(address)}
                    >
                      Editează
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 transition-colors px-2 py-0.5 md:py-1 rounded-md hover:bg-red-50"
                      onClick={() => openDeleteModal(address)}
                    >
                      Șterge
                    </button>
                    <button
                      className={`transition-all px-2 py-0.5 md:py-1 rounded-md ${
                        address.is_default ? "text-sky-800" : "text-gray-400"
                      }`}
                      onClick={(e) => {
                        if (!address.is_default) {
                          animateHeartIcon(
                            e.currentTarget.querySelector("svg")
                          );
                          setDefaultAddress(address);
                        }
                      }}
                      disabled={address.is_default}
                      title={
                        address.is_default ? "Favorită" : "Setează ca favorită"
                      }
                    >
                      <span
                        className="inline-flex items-center justify-center mt-2 transition-transform duration-200 hover:scale-125"
                        style={{
                          width: "20px",
                          height: "20px",
                          overflow: "hidden",
                          transformOrigin: "center",
                        }}
                      >
                        {address.is_default ? (
                          <FaHeart className="w-full h-full" />
                        ) : (
                          <FaRegHeart className="w-full h-full" />
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={navigateToAccount}
          className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-4 py-2 rounded-md transform transition duration-250 active:scale-105 flex items-center"
        >
          <span className="mr-2">←</span> Înapoi la cont
        </button>

        {displayAddresses.length > 0 && (
          <button
            className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-4 py-2 rounded-md transform transition duration-250 active:scale-105"
            onClick={() => openEditPopup()}
          >
            Adaugă Adresă
          </button>
        )}
      </div>

      {showEditPopup &&
        (editingAddress ? (
          <EditAddressPopup
            isOpen={showEditPopup}
            onClose={closeEditPopup}
            address={editingAddress}
            fetchAddresses={fetchAddresses}
            updateSelectedAddress={() => {
              fetchAddresses();
              closeEditPopup();
            }}
          />
        ) : (
          <AddNewAddress
            showEditPopup={showEditPopup}
            closeEditPopup={closeEditPopup}
            fetchAddresses={fetchAddresses}
          />
        ))}

      {deleteModal && addressToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirmare ștergere adresă
            </h3>
            <p className="text-gray-600 mb-6">
              Ești sigur că vrei să ștergi această adresă?
              <br />
              <span className="font-medium">
                {addressToDelete.name} - {addressToDelete.address},{" "}
                {addressToDelete.city}
              </span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={deleteAddress}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAddresses;
