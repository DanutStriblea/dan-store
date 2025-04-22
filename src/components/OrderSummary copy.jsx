import PropTypes from "prop-types";
import { useContext, useEffect, useState, useCallback } from "react";
import { CartContext } from "../context/CartContext";
import { supabase } from "../supabaseClient";

const OrderSummary = ({ deliveryCost, orderId }) => {
  const { cartItems } = useContext(CartContext); // Accesăm coșul din context
  const [orderSummary, setOrderSummary] = useState(null); // Stare pentru rezumatul comenzii
  const [loading, setLoading] = useState(true); // Spinner pentru încărcare

  // Calculăm totalul produselor
  const calculateTotalProductCost = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.product_price, 0);
  }, [cartItems]);

  // Generăm rezumatul comenzii din CartContext
  const generateOrderSummary = useCallback(
    () => ({
      products: cartItems.map((item) => ({
        id: item.product_id,
        title: item.products?.title || "Produs necunoscut",
        quantity: item.quantity,
        price: item.product_price,
      })),
      deliveryCost,
      total: calculateTotalProductCost() + deliveryCost,
    }),
    [cartItems, deliveryCost, calculateTotalProductCost]
  );

  // Funcție pentru a prelua order_summary din Supabase
  const fetchOrderSummaryFromSupabase = useCallback(async () => {
    if (!orderId) {
      console.error("Nu există un orderId valid.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("order_details")
        .select("order_summary")
        .eq("id", orderId)
        .single();

      if (error) {
        console.error(
          "Eroare la preluarea order_summary din Supabase:",
          error.message
        );
      } else {
        setOrderSummary(data.order_summary); // Salvăm rezumatul comenzii în stare
      }
    } catch (err) {
      console.error(
        "Eroare neașteptată la preluarea order_summary:",
        err.message
      );
    } finally {
      setLoading(false); // Încărcarea s-a încheiat
    }
  }, [orderId]);

  // Funcție pentru sincronizarea order_summary în Supabase
  // Funcție pentru sincronizarea order_summary în Supabase
  const syncOrderSummaryToSupabase = useCallback(async () => {
    const generatedOrderSummary = generateOrderSummary();

    try {
      const { error } = await supabase
        .from("order_details")
        .update({ order_summary: generatedOrderSummary })
        .eq("id", orderId);

      if (error) {
        console.error(
          "Eroare la actualizarea order_summary în Supabase:",
          error.message
        );
      } else {
        console.log(
          "Order summary sincronizat cu succes:",
          generatedOrderSummary
        );
        // Re-fetch pentru a actualiza starea locală cu datele din baza de date
        fetchOrderSummaryFromSupabase();
      }
    } catch (err) {
      console.error(
        "Eroare neașteptată la sincronizarea order_summary:",
        err.message
      );
    }
  }, [generateOrderSummary, orderId, fetchOrderSummaryFromSupabase]);

  useEffect(() => {
    fetchOrderSummaryFromSupabase(); // Preluăm datele la montarea componentei
  }, [orderId, fetchOrderSummaryFromSupabase]);

  useEffect(() => {
    if (orderId && cartItems.length > 0) {
      syncOrderSummaryToSupabase(); // Sincronizăm când se schimbă cartItems sau alte date
    }
  }, [cartItems, deliveryCost, orderId, syncOrderSummaryToSupabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!orderSummary) {
    return <div>Eroare: Nu s-au găsit detalii despre comandă.</div>;
  }

  const { products = [], total } = orderSummary;

  return (
    <div className="mb-6 border rounded-md p-4 bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">4. Sumar comanda</h2>

      <div className="space-y-2">
        {products.map((product, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>
              {product.title} (x{product.quantity})
            </span>
            <span>{product.price.toFixed(2)} RON</span>
          </div>
        ))}

        <div className="flex justify-between text-sm mt-4">
          <span>Cost livrare:</span>
          <span>{deliveryCost.toFixed(2)} RON</span>
        </div>

        <hr className="my-2 border-t" />

        <div className="flex justify-between text-base font-bold">
          <span>Total:</span>
          <span>{total.toFixed(2)} RON</span>
        </div>
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  deliveryCost: PropTypes.number.isRequired, // Costul livrării
  orderId: PropTypes.string.isRequired, // ID-ul comenzii
};

export default OrderSummary;
