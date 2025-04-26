import PropTypes from "prop-types";
import { useContext, useEffect, useState, useCallback } from "react";
import { CartContext } from "../context/CartContext";
import { supabase } from "../supabaseClient";

const OrderSummary = ({
  deliveryCost,
  orderId,
  containerClass,
  titleClass,
}) => {
  const { cartItems } = useContext(CartContext);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculăm totalul produselor din coș
  const calculateTotalProductCost = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.product_price, 0);
  }, [cartItems]);

  // Generăm local un rezumat al comenzii folosind datele din coș
  const generateOrderSummary = useCallback(() => {
    return {
      products: cartItems.map((item) => ({
        id: item.product_id,
        title: item.products?.title || "Produs necunoscut",
        quantity: item.quantity,
        price: item.product_price,
      })),
      deliveryCost,
      total: calculateTotalProductCost() + deliveryCost,
    };
  }, [cartItems, deliveryCost, calculateTotalProductCost]);

  // Preluăm order_summary din Supabase cu maybeSingle()
  const fetchOrderSummaryFromSupabase = useCallback(async () => {
    if (!orderId) {
      console.error("Nu există un orderId valid.");
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("order_details")
        .select("order_summary")
        .eq("id", orderId)
        .maybeSingle();

      if (error) {
        console.error(
          "Eroare la preluarea order_summary din Supabase:",
          error.message
        );
        // Folosim fallback-ul generat local
        setOrderSummary(generateOrderSummary());
      } else if (!data || data.order_summary === null) {
        console.warn(
          "Nu s-au găsit detalii despre comandă pentru orderId:",
          orderId,
          "- se folosește rezumatul generat local."
        );
        setOrderSummary(generateOrderSummary());
      } else {
        setOrderSummary(data.order_summary);
      }
    } catch (err) {
      console.error(
        "Eroare neașteptată la preluarea order_summary:",
        err.message
      );
      setOrderSummary(generateOrderSummary());
    } finally {
      setLoading(false);
    }
  }, [orderId, generateOrderSummary]);

  // Sincronizăm rezumatul generat local în baza de date
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
        // Re-preluăm datele actualizate
        await fetchOrderSummaryFromSupabase();
      }
    } catch (err) {
      console.error(
        "Eroare neașteptată la sincronizarea order_summary:",
        err.message
      );
    }
  }, [generateOrderSummary, orderId, fetchOrderSummaryFromSupabase]);

  useEffect(() => {
    fetchOrderSummaryFromSupabase();
  }, [orderId, fetchOrderSummaryFromSupabase]);

  useEffect(() => {
    if (orderId && cartItems.length > 0) {
      syncOrderSummaryToSupabase();
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
    <div
      className={
        containerClass
          ? containerClass
          : "mb-6 border rounded-md p-4 bg-gray-50 shadow-md"
      }
    >
      <h2 className={titleClass ? titleClass : "text-lg font-semibold mb-4"}>
        Sumar comanda
      </h2>

      <div className="space-y-2">
        {products.map((product, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>
              {product.title} (x{product.quantity})
            </span>
            <span>{product.price.toFixed(2)} RON</span>
          </div>
        ))}

        <div className="flex justify-between text-sm text-gray-600 mt-6">
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
  deliveryCost: PropTypes.number.isRequired,
  orderId: PropTypes.string.isRequired,
  containerClass: PropTypes.string,
  titleClass: PropTypes.string,
};

export default OrderSummary;
