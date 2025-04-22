import PropTypes from "prop-types";
import EditAddressPopup from "./EditAddressPopup"; // Importăm componenta de editare adresă

const AddNewAddress = ({ showEditPopup, closeEditPopup, fetchAddresses }) => {
  const handleSaveAddress = async () => {
    await fetchAddresses(); // Reîmprospătăm lista după salvare
    closeEditPopup(); // Închidem pop-up-ul după salvare
  };

  return (
    <EditAddressPopup
      isOpen={showEditPopup} // Starea pentru vizibilitate
      onClose={closeEditPopup} // Închidere pop-up
      address={{}} // Transmitem un obiect gol pentru adăugare
      fetchAddresses={fetchAddresses} // Reîmprospătăm lista adreselor
      updateSelectedAddress={handleSaveAddress} // Apelăm funcția după salvare
    />
  );
};

// PropTypes pentru validarea propurilor
AddNewAddress.propTypes = {
  showEditPopup: PropTypes.bool.isRequired, // Vizibilitatea pop-up-ului
  closeEditPopup: PropTypes.func.isRequired, // Funcția pentru închiderea pop-up-ului
  fetchAddresses: PropTypes.func.isRequired, // Funcția pentru reîmprospătarea listelor de adrese
};

export default AddNewAddress;
