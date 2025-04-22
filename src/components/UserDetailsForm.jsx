import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import ResetPassword from "./ResetPassword";

const UserDetailsForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false); // Pentru afișarea pop-up-ului

  const navigate = useNavigate();

  // ✅ Obține utilizatorul logat și detaliile din tabel
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Eroare la autentificare:", authError?.message);
          return;
        }

        setUserId(user.id); // Setăm userId

        const { data, error } = await supabase
          .from("user_details")
          .select("*")
          .eq("user_id", user.id) // Filtrăm pentru user_id
          .single();

        if (error) {
          console.error(
            "Eroare la preluarea datelor utilizatorului:",
            error.message
          );
          return;
        }

        // Actualizăm state-ul formularului cu datele existente
        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          birthDate: data.birth_date || "",
          phone: data.phone_number || "",
        });
      } catch (err) {
        console.error("Eroare la fetch:", err.message);
      }
    };

    fetchUserDetails();
  }, []);

  // ✅ Gestionare input-uri
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Salvare individuală a câmpurilor în tabel
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!userId) {
      console.error("User ID indisponibil!");
      setLoading(false);
      return;
    }

    try {
      // Construim obiectul `updates` doar cu câmpurile modificate
      const updates = {};
      if (formData.firstName.trim()) updates.first_name = formData.firstName;
      if (formData.lastName.trim()) updates.last_name = formData.lastName;
      if (formData.birthDate.trim()) updates.birth_date = formData.birthDate;
      if (formData.phone.trim()) updates.phone_number = formData.phone;

      // Dacă nu sunt modificări, oprim procesul
      if (Object.keys(updates).length === 0) {
        console.warn("Niciun câmp nu a fost modificat.");
        setLoading(false);
        return;
      }

      // Adăugăm timestamp-ul actualizării
      updates.updated_at = new Date().toISOString();

      // Actualizăm doar câmpurile modificate
      const { error } = await supabase
        .from("user_details")
        .update(updates)
        .eq("user_id", userId);

      if (error) {
        console.error("Eroare la actualizare:", error.message);
      } else {
        console.log("Date actualizate cu succes!");
        navigate("/MyAccount");
      }
    } catch (err) {
      console.error("Eroare la salvare:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-gray-50 shadow-lg border rounded-lg relative">
      <h2 className="text-2xl font-semibold text-center mb-4">
        <div className="relative">
          <button
            onClick={() => navigate("/MyAccount")}
            className="text-gray-500 hover:text-gray-700 text-3xl absolute -top-4 -right-2 font-bold transform transition duration-250 active:scale-105"
          >
            &times;
          </button>
        </div>
        Detalii utilizator
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prenume */}
        <div>
          <label className="block text-gray-700">Prenume</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border p-2 rounded-md shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-300"
          />
        </div>

        {/* Nume de familie */}
        <div>
          <label className="block text-gray-700">Nume de familie</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border p-2 rounded-md shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-300"
          />
        </div>

        {/* Parola */}
        <div>
          <label className="block text-gray-700">Parola</label>
          <input
            type="text" // Tipul 'text' pentru aspectul câmpului
            value="******" // Placeholder simbolic
            readOnly // Câmpul nu este editabil
            onClick={() => setShowResetPassword(true)} // Declanșăm pop-up-ul ResetPassword la click
            className="cursor-pointer w-full border p-2 rounded-md shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-300 text-sky-600 hover:text-sky-800" // Stiluri pentru aspect
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-gray-700">Telefon</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded-md shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-300"
          />
        </div>

        {/* Data nașterii */}
        <div>
          <label className="block text-gray-700">Data nașterii</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="w-full border p-2 rounded-md shadow-sm hover:shadow-md focus:shadow-lg transition-shadow duration-300"
          />
        </div>

        {/* Butoane */}
        <div className="flex justify-between pt-6 gap-x-4">
          <button
            type="button"
            onClick={() => navigate("/MyAccount")}
            className="bg-gray-400 hover:bg-gray-500 active:bg-gray-600 text-white px-3 py-2 rounded-md transform transition duration-250 active:scale-105 w-32 min-w-[8rem]"
          >
            Anulează
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-3 py-2 rounded-md transform transition duration-250 active:scale-105 w-32 min-w-[8rem]"
          >
            {loading ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </form>

      {/* Pop-up-ul ResetPassword */}
      {showResetPassword && (
        <ResetPassword fromInternalTrigger={true} requiresOldPassword={true} />
      )}
    </div>
  );
};

export default UserDetailsForm;
