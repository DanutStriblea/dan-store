import PropTypes from "prop-types";
import AddNewAddress from "./AddNewAddress"; // Importăm componenta AddNewAddress
import { useState } from "react"; // Adăugăm starea locală pentru gestionarea pop-up-ului

const SelectBillingPopup = ({
  showPopup,
  handlePopupClose,
  sortedAddresses,
  billingAddress,
  handleAddressSelect,
  fetchAddresses, // Pentru reîmprospătarea listelor de adrese
}) => {
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false); // Stare locală pentru adăugarea unei noi adrese

  // Ieșim din componentă dacă pop-up-ul nu este vizibil
  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-[30rem] text-sm">
        {/* Titlul și butonul de închidere */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-sky-700">
            Alege adresa de facturare
          </h2>
          <button
            className="text-gray-600 hover:text-gray-800 font-bold text-xl"
            onClick={handlePopupClose}
          >
            ✕
          </button>
        </div>

        {/* Lista adreselor */}
        {sortedAddresses.map((address, index) => {
          // Validăm obiectele adrese
          if (!address?.id || typeof address.id !== "string") {
            console.warn("Adresă invalidă detectată:", address);
            return null; // Ignorăm obiectele invalide
          }

          return (
            <div
              key={address.id || `address-${index}`}
              className="flex items-center justify-between p-4 border-b"
            >
              <div className="flex items-center space-x-6">
                <div className="flex items-center h-full">
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={billingAddress?.id === address.id}
                    onChange={() => handleAddressSelect(address)}
                    className="w-3 h-3 text-blue-600 bg-white border-2 border-gray-300 focus:ring-blue-500 rounded-full"
                    required
                  />
                </div>
                <div>
                  <p>
                    <strong>Nume:</strong> {address.name || "N/A"}
                  </p>
                  <p>
                    <strong>Telefon:</strong> {address.phone_number || "N/A"}
                  </p>
                  <p>
                    <strong>Adresă:</strong> {address.address || "N/A"},{" "}
                    {address.city || "N/A"}, {address.county || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Butonul „Adaugă Adresă” */}
        <div className="mt-4">
          <button
            className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-md hover:bg-sky-800 transition duration-200 w-full"
            onClick={() => setShowAddAddressPopup(true)} // Deschidem pop-up-ul pentru adăugarea unei adrese noi
          >
            Adaugă Adresă
          </button>
        </div>
      </div>

      {/* Pop-up-ul pentru adăugarea unei adrese noi */}
      {showAddAddressPopup && (
        <AddNewAddress
          showEditPopup={showAddAddressPopup} // Controlăm vizibilitatea
          closeEditPopup={() => setShowAddAddressPopup(false)} // Funcția pentru închiderea pop-up-ului
          fetchAddresses={fetchAddresses} // Funcția pentru reîmprospătarea listelor
        />
      )}
    </div>
  );
};

// PropTypes pentru validarea propurilor
SelectBillingPopup.propTypes = {
  showPopup: PropTypes.bool.isRequired,
  handlePopupClose: PropTypes.func.isRequired,
  sortedAddresses: PropTypes.array.isRequired,
  billingAddress: PropTypes.object,
  handleAddressSelect: PropTypes.func.isRequired,
  fetchAddresses: PropTypes.func.isRequired, // Funcția pentru reîmprospătarea listelor de adrese
};

export default SelectBillingPopup;
