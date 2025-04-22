import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { supabase } from "../supabaseClient";

const EditAddressPopup = ({
  address,
  isOpen,
  onClose,
  fetchAddresses,
  updateSelectedAddress,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    address: "",
    city: "",
    county: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // Mesaj pentru validare

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name || "",
        phone_number: address.phone_number || "",
        address: address.address || "",
        city: address.city || "",
        county: address.county || "",
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const saveAddress = async () => {
    const payload = {
      ...formData,
      is_default: address?.is_default || false, // Favorită existentă sau prima adresă nouă
      id: address?.id || undefined,
    };

    const { data, error } = await supabase
      .from("user_addresses")
      .upsert(payload)
      .select() // Returnăm toate datele relevante
      .single();

    if (!error && data) {
      console.log("Adresa salvată cu succes:", data);

      updateSelectedAddress(data); // Sincronizăm direct selectedAddress
      await fetchAddresses(); // Reîmprospătăm lista globală de adrese
      onClose(); // Închidem pop-up-ul
    } else {
      console.error("Eroare la salvarea adresei:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validare: toate câmpurile trebuie completate
    if (
      !formData.name.trim() ||
      !formData.phone_number.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.county.trim()
    ) {
      setErrorMessage("Toate câmpurile sunt obligatorii!");
      return;
    }

    await saveAddress();
    setErrorMessage(""); // Resetăm mesajul de eroare după salvare
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-[30rem]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-sky-700">
            {address ? "Editare adresă" : "Adaugă adresă"}
          </h2>
          <button
            className="text-gray-600 hover:text-gray-800 font-bold text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Mesaj de eroare */}
        {errorMessage && (
          <div className="mb-4 text-red-600">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Nume
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md p-2 shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md p-2 shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Adresă
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md p-2 shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Oraș
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md p-2 shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Județ
            </label>
            <input
              type="text"
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md p-2 shadow-sm"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transform transition duration-250 active:scale-105 w-28"
              onClick={onClose}
            >
              Anulează
            </button>
            <button
              type="submit"
              className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-4 py-2 rounded-md transform transition duration-250 active:scale-105 w-28"
            >
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditAddressPopup.propTypes = {
  address: PropTypes.shape({
    name: PropTypes.string,
    phone_number: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    county: PropTypes.string,
    is_default: PropTypes.bool,
    id: PropTypes.number,
    user_id: PropTypes.number,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchAddresses: PropTypes.func.isRequired,
  updateSelectedAddress: PropTypes.func,
};

export default EditAddressPopup;
