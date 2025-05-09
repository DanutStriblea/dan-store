import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { AuthContext } from "../context/AuthContext"; // Importă AuthContext

const MyAccount = () => {
  const { user } = useContext(AuthContext); // Obține utilizatorul logat din context
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Dacă utilizatorul nu este logat, navighează la pagina de logare
      navigate("/login");
    } else {
      const fetchUserDetails = async () => {
        const { data, error } = await supabase
          .from("user_details")
          .select("first_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error(
            "Eroare la obținerea datelor utilizatorului:",
            error.message
          );
        } else if (data) {
          setFirstName(data.first_name || "Utilizator");
        }
      };

      fetchUserDetails();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) {
      // Dacă nu există utilizator logat, redirectează
      navigate("/login");
    }
  }, [user, navigate]);

  // Handler pentru navigarea la „Datele Mele”
  const handleUserDetailsClick = () => {
    if (user && user.id) {
      navigate(`/user/${user.id}`);
    }
  };

  // Handler pentru navigarea la „Adrese”
  const handleAddressesClick = () => {
    navigate("/addresses"); // Navighează la pagina UserAddresses
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-200 rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl text-sky-900 font-bold">Salut {firstName}!</h1>
        <p className="text-sky-600">
          {user ? user.email : "Email indisponibil"}
        </p>
      </div>

      {/* Card Datele Mele */}
      <div
        className="mb-6 border rounded-lg p-4 shadow-md bg-white text-gray-600 transition duration-200 cursor-pointer"
        style={{
          transform: "scale(1)",
          transition: "transform 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={handleUserDetailsClick} // Navigare activă
      >
        <h2 className="text-xl font-semibold">Datele mele</h2>
        <p className="text-sm">
          Vizualizează și actualizează datele personale.
        </p>
      </div>

      {/* Card Adrese */}
      <div
        className="mb-6 border rounded-lg p-4 shadow-md bg-white text-gray-600 transition duration-200 cursor-pointer"
        style={{
          transform: "scale(1)",
          transition: "transform 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={handleAddressesClick} // Navigare activă
      >
        <h2 className="text-xl font-semibold">Adrese</h2>
        <p className="text-sm">
          Gestionează adresele tale pentru livrare și facturare.
        </p>
      </div>

      {/* Card Comenzi */}
      <div
        className="mb-6 border rounded-lg p-4 shadow-md bg-white text-gray-600 transition duration-200 cursor-pointer"
        style={{
          transform: "scale(1)",
          transition: "transform 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={() => navigate("/orders")} // Adăugare navigare
      >
        <h2 className="text-xl font-semibold">Comenzi</h2>
        <p className="text-sm">Verifică statusul comenzilor tale.</p>
      </div>

      {/* Card Retururi */}
      <div
        className="mb-6 border rounded-lg p-4 shadow-md bg-white text-gray-600 transition duration-200 cursor-pointer"
        style={{
          transform: "scale(1)",
          transition: "transform 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={() => navigate("/returns")} // Adăugare navigare
      >
        <h2 className="text-xl font-semibold">Retururi</h2>
        <p className="text-sm">
          Vezi istoricul și statusul cererilor de retur.
        </p>
      </div>

      {/* Buton Înapoi */}
      <button
        className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-2 py-2 rounded-md transform transition duration-250 active:scale-105 w-28 flex items-center justify-center"
        onClick={() => navigate("/")}
      >
        <span className="mr-2">←</span> Înapoi
      </button>
    </div>
  );
};

export default MyAccount;
