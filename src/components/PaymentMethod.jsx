import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import PropTypes from "prop-types";

const PaymentMethod = ({ orderId }) => {
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [selectedCard, setSelectedCard] = useState("savedCard");
  const [cardDetails, setCardDetails] = useState(null);

  // Folosim useEffect pentru a prelua detaliile cardului din tabela order_details
  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!orderId) {
        console.warn("orderId nu este definit!");
        return;
      }
      // Presupunem că în order_details, coloana card_encrypted_data conține un obiect JSON
      // cu detalii precum: { brand: "VISA", last4: "9664", exp_month: 11, exp_year: 2026 }
      const { data, error } = await supabase
        .from("order_details")
        .select("card_encrypted_data")
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Eroare la preluarea detaliilor cardului:", error);
      } else {
        setCardDetails(data.card_encrypted_data);
      }
    };

    fetchCardDetails();
  }, [orderId]);

  // Aici rămâne useEffect-ul care actualizează order_details în baza de date
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
      const { error } = await supabase
        .from("order_details")
        .update({
          payment_method: paymentMethod,
          card_encrypted_data: paymentMethod === "Card" ? selectedCard : null,
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
            <label className="flex items-center">
              <input
                type="radio"
                name="selectedCard"
                value="savedCard"
                checked={selectedCard === "savedCard"}
                onChange={() => setSelectedCard("savedCard")}
                className="mr-2"
              />
              {cardDetails ? (
                <div>
                  <span>
                    {cardDetails.brand} •••• {cardDetails.last4}
                  </span>
                  <span className="ml-2">
                    Expira in{" "}
                    {new Date(
                      cardDetails.exp_year,
                      cardDetails.exp_month - 1
                    ).toLocaleString("ro-RO", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ) : (
                "Card salvat"
              )}
            </label>
            <label className="flex items-center">
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
