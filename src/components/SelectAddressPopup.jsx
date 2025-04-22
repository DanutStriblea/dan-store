import PropTypes from "prop-types";

const SelectAddressPopup = ({
  showPopup,
  handlePopupClose,
  sortedAddresses,
  popupContext = "delivery", // Valoare implicită pentru context
  selectedAddress,
  billingAddress,
  handleAddressSelect,
  openEditPopup,
  setShowEditPopup,
}) => {
  // Ieșim din componentă dacă pop-up-ul nu este vizibil
  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-[30rem] text-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-sky-700">Alege adresa</h2>
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
                    checked={
                      popupContext === "delivery"
                        ? selectedAddress?.id === address.id
                        : billingAddress?.id === address.id
                    }
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
              <button
                className="bg-white border border-blue-500 text-blue-500 px-4 py-2 rounded-full shadow hover:shadow-md hover:bg-blue-500 hover:text-white"
                onClick={() => openEditPopup(address)}
              >
                Editează
              </button>
            </div>
          );
        })}

        {/* Butonul „Adaugă Adresă” */}
        <div className="mt-4">
          <button
            className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-md hover:bg-sky-800 transition duration-200 w-full"
            onClick={() => setShowEditPopup(true)}
          >
            Adaugă adresă nouă
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypes pentru validarea propurilor
SelectAddressPopup.propTypes = {
  showPopup: PropTypes.bool.isRequired,
  handlePopupClose: PropTypes.func.isRequired,
  sortedAddresses: PropTypes.array.isRequired,
  popupContext: PropTypes.string,
  selectedAddress: PropTypes.object,
  billingAddress: PropTypes.object,
  handleAddressSelect: PropTypes.func.isRequired,
  openEditPopup: PropTypes.func.isRequired,
  setShowEditPopup: PropTypes.func.isRequired,
};

export default SelectAddressPopup;
