import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { AuthContext } from "../context/AuthContext";

const YourCards = () => {
  const { user } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCards = async () => {
      setLoading(true);
      try {
        // Obținem cardurile salvate pentru utilizatorul actual
        const { data, error } = await supabase
          .from("saved_cards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setCards(data || []);
      } catch (err) {
        console.error("Eroare la preluarea cardurilor:", err);
        setError("Nu am putut încărca cardurile. Te rugăm să încerci din nou.");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [user, navigate]);
  // Funcție pentru a deschide popupul de confirmare
  const openDeleteConfirmation = (card) => {
    setCardToDelete(card);
    setShowDeletePopup(true);
  };

  // Funcție pentru a anula ștergerea
  const cancelDelete = () => {
    setCardToDelete(null);
    setShowDeletePopup(false);
  };

  // Funcție pentru a confirma și realiza ștergerea
  const confirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      const { error } = await supabase
        .from("saved_cards")
        .delete()
        .eq("card_id", cardToDelete.card_id);

      if (error) {
        throw error;
      }

      // Actualizăm lista de carduri după ștergere
      setCards(cards.filter((card) => card.card_id !== cardToDelete.card_id));
      setError(null); // Ștergem eventualele erori anterioare
    } catch (err) {
      console.error("Eroare la ștergerea cardului:", err);
      setError("Nu am putut șterge cardul. Te rugăm să încerci din nou.");
    } finally {
      // Închidem popupul indiferent de rezultat
      setShowDeletePopup(false);
      setCardToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-200 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-sky-900 mb-6">Cardurile Tale</h1>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">Nu ai niciun card salvat.</p>
          <p className="text-sm text-gray-500">
            Cardurile sunt salvate automat când plasezi o comandă și alegi
            opțiunea de salvare.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.card_id}
              className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{card.card_brand}</span>
                  <span className="ml-2">•••• {card.card_last4}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Expiră în{" "}
                  {new Date(
                    Number(card.exp_year),
                    Number(card.exp_month) - 1
                  ).toLocaleString("ro-RO", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>{" "}
              <button
                onClick={() => openDeleteConfirmation(card)}
                className="text-red-600 hover:text-red-800 transition-colors px-3 py-1 rounded-md hover:bg-red-50"
              >
                Șterge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup de confirmare pentru ștergerea cardului */}
      {showDeletePopup && cardToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirmare ștergere card
            </h3>
            <p className="text-gray-600 mb-6">
              Ești sigur că vrei să ștergi acest card?
              <br />
              <span className="font-medium">
                {cardToDelete.card_brand} •••• {cardToDelete.card_last4}
              </span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate("/myaccount")}
          className="bg-sky-900 hover:bg-sky-800 active:bg-sky-700 text-white px-4 py-2 rounded-md transform transition duration-250 active:scale-105 flex items-center"
        >
          <span className="mr-2">←</span> Înapoi la cont
        </button>
      </div>
    </div>
  );
};

export default YourCards;
