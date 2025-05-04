import { useState, useContext, useEffect } from "react";
import { AddressContext } from "../context/AddressContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import EditAddressPopup from "./EditAddressPopup";
import AddNewAddress from "./AddNewAddress";

const UserAddresses = () => {
  const { addresses, fetchAddresses } = useContext(AddressContext);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false); // Controlăm vizibilitatea pop-up-ului de ștergere
  const [addressToDelete, setAddressToDelete] = useState(null); // Adresa care urmează să fie ștearsă

  const navigate = useNavigate();

  // Reîmprospătăm lista de adrese la montarea paginii
  useEffect(() => {
    fetchAddresses(); // Actualizăm lista atunci când componenta se încarcă
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

    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressToDelete.id);

    if (!error) {
      // Verificăm dacă adresa ștearsă era favorită
      if (addressToDelete.is_default) {
        const { data: remainingAddresses, fetchError } = await supabase
          .from("user_addresses")
          .select("*");

        if (fetchError) {
          console.error("Eroare la verificarea adreselor rămase:", fetchError);
          return;
        }

        // Setăm următoarea adresă ca favorită, dacă există
        if (remainingAddresses.length > 0) {
          const nextFavorite = remainingAddresses[0]; // Prima adresă rămasă
          const { updateError } = await supabase
            .from("user_addresses")
            .update({ is_default: true })
            .eq("id", nextFavorite.id);

          if (updateError) {
            console.error("Eroare la setarea noii favorite:", updateError);
          }
        }
      }

      fetchAddresses(); // Reîmprospătăm lista de adrese
      closeDeleteModal(); // Închidem pop-up-ul
    } else {
      console.error("Eroare la ștergerea adresei:", error);
    }
  };

  const setDefaultAddress = async (address) => {
    try {
      // Resetăm toate adresele favorite
      const { error: resetError } = await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", address.user_id);

      if (resetError) {
        console.error("Eroare la resetarea adreselor favorite:", resetError);
        return;
      }

      // Setăm adresa selectată ca favorită
      const { error: setDefaultError } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", address.id);

      if (setDefaultError) {
        console.error("Eroare la setarea adresei favorite:", setDefaultError);
        return;
      }

      // Actualizăm `delivery_address_id` în `order_details`
      const orderId = localStorage.getItem("tempOrderId");
      if (orderId) {
        const { error: updateError } = await supabase
          .from("order_details")
          .update({ delivery_address_id: address.id })
          .eq("id", orderId);

        if (updateError) {
          console.error(
            "Eroare la actualizarea delivery_address_id:",
            updateError
          );
        } else {
          console.log("delivery_address_id actualizat cu succes:", address.id);
        }
      }

      await fetchAddresses(); // Reîmprospătăm lista globală de adrese
    } catch (error) {
      console.error("Eroare neașteptată:", error);
    }
  };

  const navigateToAccount = () => {
    navigate("/MyAccount");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Adresele Mele</h2>
      <div className="mb-4 pr-[50%]">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`border rounded-lg p-4 mb-4 bg-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 ${
              address.is_default ? "bg-slate-300" : ""
            }`}
          >
            <p>
              <strong>Nume:</strong> {address.name}
            </p>
            <p>
              <strong>Telefon:</strong> {address.phone_number}
            </p>
            <p>
              <strong>Adresă:</strong> {address.address}, {address.city},{" "}
              {address.county}
            </p>
            <div className="flex mt-4">
              <button
                className="text-blue-500 hover:text-blue-700 mr-4"
                onClick={() => openEditPopup(address)}
              >
                Editează
              </button>
              <button
                className="text-red-500 hover:text-red-700 ml-4"
                onClick={() => openDeleteModal(address)}
              >
                Șterge
              </button>
              <button
                className="ml-8 text-gray-500 font-semibold hover:text-gray-700"
                onClick={() => setDefaultAddress(address)}
                disabled={address.is_default}
              >
                {address.is_default ? "Favorită" : "Setează ca Favorită"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-start space-x-4 mt-4">
        <button
          className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-2 py-2 rounded-md transform transition duration-250 active:scale-105 w-28 flex items-center justify-center"
          onClick={navigateToAccount}
        >
          <span className="mr-2">←</span> Înapoi
        </button>
        <button
          className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-3 py-2 rounded-md transform transition duration-250 active:scale-105 w-40 min-w-40"
          onClick={() => openEditPopup()} // Fără parametru => adăugare adresă nouă
        >
          Adaugă Adresă
        </button>
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

      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Ești sigur că vrei să ștergi această adresă?
            </h3>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-3 py-2 rounded-md mr-4"
                onClick={closeDeleteModal}
              >
                Anulează
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-md"
                onClick={deleteAddress}
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
