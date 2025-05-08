import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import PropTypes from "prop-types"; // Pentru validarea prop-urilor

const RequestResetPassword = ({ onClose }) => {
  // 🔹 Stări folosite în componentă
  const [email, setEmail] = useState(""); // Stare pentru gestionarea adresei de email introdusă de utilizator
  const [message, setMessage] = useState(""); // Mesaj pentru succes (email trimis)
  const [error, setError] = useState(""); // Mesaj pentru gestionarea erorilor

  // 🔹 Auto-închiderea pop-up-ului dacă un mesaj de succes este afișat
  useEffect(() => {
    if (message && onClose) {
      const timeout = setTimeout(() => {
        onClose(); // Închidem pop-up-ul automat după 4 secunde
      }, 4000);

      // Curățăm timeout-ul la demontarea componentului
      return () => clearTimeout(timeout);
    }
  }, [message, onClose]); // Rulează efectul doar când `message` sau `onClose` se schimbă

  // 🔹 Funcție pentru trimiterea cererii de resetare a parolei
  const handleRequest = async (e) => {
    e.preventDefault(); // Previne comportamentul implicit al formularului (reîncărcarea paginii)
    setMessage(""); // Resetăm mesajele de succes anterioare
    setError(""); // Resetăm eventualele erori anterioare

    if (!email) {
      setError("Te rugăm să introduci o adresă de email validă!"); // Validare locală pentru câmpul gol
      return;
    }

    try {
      // 🔹 Cerere către API-ul Supabase pentru trimiterea link-ului de resetare
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://dan-store-lyart.vercel.app/#/reset-password", // URL-ul unde utilizatorul va fi redirecționat după resetare
      });

      if (error) {
        console.error("Eroare din Supabase:", error.message); // Afișăm eroarea pentru debugging
        setError("A apărut o eroare. Te rugăm sa reincerci dupa 15 secunde."); // Afișăm mesaj de eroare utilizatorului
      } else {
        setMessage("Email-ul pentru resetare a fost trimis!"); // Afișăm mesaj de succes
      }
    } catch (err) {
      console.error("Eroare neașteptată:", err.message); // Capturăm eventualele erori din afara Supabase
      setError("A apărut o eroare neașteptată. Încercați din nou."); // Mesaj general pentru utilizator
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="relative bg-white p-6 rounded shadow-md w-80">
        {/* 🔹 Butonul "×" pentru închidere manuală */}
        <button
          onClick={onClose} // Apelează funcția `onClose` pentru a închide pop-up-ul
          className="absolute top-3 right-4 text-gray-600 text-2xl hover:text-gray-800 focus:outline-none"
        >
          ×
        </button>
        {/* 🔹 Titlul formularului */}
        <h2 className="text-xl font-bold mb-4 text-center">Resetare Parolă</h2>
        {/* 🔹 Mesaj de succes */}
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {/* 🔹 Mesaj de eroare */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {/* 🔹 Formular pentru solicitarea resetării */}
        <form onSubmit={handleRequest}>
          {/* Câmp de input pentru email */}
          <input
            type="email" // Specificăm tipul de input pentru validare HTML
            value={email} // Conectăm câmpul de input la starea `email`
            onChange={(e) => setEmail(e.target.value)} // Actualizăm starea `email` la fiecare schimbare
            className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Introduceți adresa de email" // Placeholder pentru câmp
            required // HTML: Cerem ca acest câmp să fie completat
          />
          <div className="text-center">
            {/* 🔹 Buton pentru trimiterea formularului */}
            <button
              type="submit" // Declanșează funcția `handleRequest` la submit
              className="bg-sky-900 text-white py-2 px-6 rounded hover:bg-sky-800 active:bg-sky-700"
            >
              Trimite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

RequestResetPassword.propTypes = {
  // 🔹 Prop pentru gestionarea funcției de închidere
  onClose: PropTypes.func, // Facem `onClose` opțional
};

export default RequestResetPassword;
