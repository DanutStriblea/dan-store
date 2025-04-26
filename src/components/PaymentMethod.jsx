import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import PropTypes from "prop-types";

const PaymentMethod = ({ orderId }) => {
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [savedCards, setSavedCards] = useState([]); // Vom stoca cardurile salvate aici
  const [selectedCard, setSelectedCard] = useState(null);

  // Preluăm cardurile salvate din tabela "saved_cards"
  useEffect(() => {
    const fetchSavedCards = async () => {
      // Poți filtra după utilizator dacă ai un câmp user_id asociat cardurilor,
      // dar aici preluăm toate cardurile pentru simplitate.
      const { data, error } = await supabase
        .from("saved_cards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Eroare la preluarea cardurilor salvate:", error);
      } else {
        setSavedCards(data);
        if (data.length > 0) {
          // Setăm implicit primul card salvat ca selectat
          setSelectedCard(data[0].card_id);
        }
      }
    };

    fetchSavedCards();
  }, []);

  // Actualizează order_details cu metoda de plată și cardul selectat
  // Dacă se alege "Card" și se selectează un card existent, se trimite id-ul cardului.
  useEffect(() => {
    const updatePaymentData = async () => {
      if (!orderId) {
        console.warn("orderId nu este definit!");
        return;
      }
      const { error } = await supabase
        .from("order_details")
        .update({
          payment_method: paymentMethod,
          card_encrypted_data:
            paymentMethod === "Card" && selectedCard ? selectedCard : null,
        })
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

      {/* Opțiunea: Card online */}
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
                <label key={card.card_id} className="flex items-center">
                  <input
                    type="radio"
                    name="selectedCard"
                    value={card.card_id}
                    checked={selectedCard === card.card_id}
                    onChange={() => setSelectedCard(card.card_id)}
                    className="mr-2"
                  />
                  <div>
                    <span>
                      {card.card_brand} •••• {card.card_last4}
                    </span>
                    <span className="ml-2">
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
                className="mr-2"
              />
              Plătește cu alt card
            </label>
          </div>
        )}
      </div>

      {/* Opțiunea: Ramburs la curier */}
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
