import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import PropTypes from "prop-types";

const PaymentMethod = ({ orderId }) => {
  // Inițializăm state-urile cu valori implicite și încercăm să le citim din localStorage.
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const stored = localStorage.getItem("paymentMethod");
    return stored ? stored : "Card";
  });
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(() => {
    const stored = localStorage.getItem("selectedCard");
    return stored ? stored : "savedCard";
  });

  // La montare, preluăm lista de carduri salvate din tabelul "saved_cards"
  useEffect(() => {
    const fetchSavedCards = async () => {
      if (!orderId) {
        console.warn("orderId nu este definit!");
        return;
      }
      const { data, error } = await supabase
        .from("saved_cards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Eroare la preluarea cardurilor salvate:", error);
      } else {
        setSavedCards(data);
        if (data.length > 0) {
          // Folosim updater-ul funcțional pentru selectedCard:
          setSelectedCard((prevSelectedCard) =>
            prevSelectedCard === "savedCard"
              ? data[0].card_id
              : prevSelectedCard
          );
        }
      }
    };

    fetchSavedCards();
  }, [orderId]);

  // Persistăm valorile paymentMethod și selectedCard în localStorage ori de câte ori se schimbă.
  useEffect(() => {
    localStorage.setItem("paymentMethod", paymentMethod);
    localStorage.setItem("selectedCard", selectedCard);
  }, [paymentMethod, selectedCard]);

  // Când se selectează un card salvat, salvăm și detaliile complete ale acestuia în localStorage.
  const handleCardSelect = (card) => {
    setSelectedCard(card.card_id);
    localStorage.setItem("savedCardDetails", JSON.stringify(card));
  };

  // Efect pentru actualizarea order_details – actualizăm doar datele relevante.
  useEffect(() => {
    const updatePaymentData = async () => {
      console.log("Updating payment data:", {
        paymentMethod,
        selectedCard,
        orderId,
      });
      if (!orderId) {
        console.warn("orderId nu este definit!");
        return;
      }

      const payload = { payment_method: paymentMethod };
      // Actualizăm card_encrypted_data doar dacă se folosește "newCard"
      if (paymentMethod === "Card" && selectedCard === "newCard") {
        payload.card_encrypted_data = selectedCard;
      }

      const { error } = await supabase
        .from("order_details")
        .update(payload)
        .eq("id", orderId);

      if (error) {
        console.error("Eroare la actualizarea metodei de plată:", error);
      } else {
        console.log("Update-ul a fost realizat cu succes!");
      }
    };

    updatePaymentData();
  }, [paymentMethod, selectedCard, orderId]);

  return (
    <div className="mb-6 border rounded-md p-4 bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">3. Modalitate de plată</h2>

      {/* Div pentru Card online */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="Card"
            checked={paymentMethod === "Card"}
            onChange={() => setPaymentMethod("Card")}
            className="mr-2"
          />
          Card online
        </label>

        {paymentMethod === "Card" && (
          <div className="pl-6 flex flex-col space-y-2 mt-2">
            {savedCards.length > 0 ? (
              savedCards.map((card) => (
                <label
                  key={card.card_id}
                  className="flex items-center border border-gray-200 rounded-md p-2 bg-white shadow-sm w-full max-w-[600px] mr-6 mx-auto"
                >
                  <input
                    type="radio"
                    name="selectedCard"
                    value={card.card_id}
                    checked={selectedCard === card.card_id}
                    onChange={() => handleCardSelect(card)}
                    className="mr-3 mt-1 ml-1"
                  />
                  <div>
                    <span className="block text-sm font-medium">
                      {card.card_brand} •••• {card.card_last4}
                    </span>
                    <span className="block text-xs text-gray-500">
                      Expira in{" "}
                      {new Date(
                        Number(card.exp_year),
                        Number(card.exp_month) - 1
                      ).toLocaleString("ro-RO", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-600">
                Nu există carduri salvate.
              </p>
            )}

            <label className="flex items-center mt-2">
              <input
                type="radio"
                name="selectedCard"
                value="newCard"
                checked={selectedCard === "newCard"}
                onChange={() => setSelectedCard("newCard")}
                className=" mr-2 mt-1"
              />
              <span className="text-l mt-1">Plătește cu alt card</span>
            </label>
          </div>
        )}
      </div>

      {/* Div pentru Ramburs la curier */}
      <div>
        <label className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="Ramburs"
            checked={paymentMethod === "Ramburs"}
            onChange={() => setPaymentMethod("Ramburs")}
            className="mr-2"
          />
          Ramburs la curier
        </label>
        {paymentMethod === "Ramburs" && (
          <p className="pl-6 text-sm text-gray-600 mt-2">
            Vei plăti în momentul în care comanda va fi livrată.
          </p>
        )}
      </div>
    </div>
  );
};

PaymentMethod.propTypes = {
  orderId: PropTypes.string.isRequired,
};

export default PaymentMethod;
