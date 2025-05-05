import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Folosim o stare care reține id-ul comenzii expandate;
  // dacă e null, nicio comandă nu este deschisă.
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from("submitted_orders")
          .select("*, products_ordered")
          .order("created_at", { ascending: false });

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          return;
        }

        const enrichedOrders = await Promise.all(
          ordersData.map(async (order) => {
            const products = JSON.parse(order.products_ordered);
            const enrichedProducts = await Promise.all(
              products.map(async (product) => {
                const { data: productData, error: productError } =
                  await supabase
                    .from("products")
                    .select("images")
                    .eq("id", product.product_id)
                    .single();

                if (productError) {
                  console.error(
                    `Error fetching product image for product ID ${product.product_id}:`,
                    productError
                  );
                }

                return {
                  ...product,
                  image: productData?.images?.[0] || "/logo.png",
                };
              })
            );
            return { ...order, products_ordered: enrichedProducts };
          })
        );

        setOrders(enrichedOrders);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Funcție de toggle: dacă comanda dată e deja deschisă, o închide (setează null),
  // altfel setează expandedOrderId la id-ul comenzii respective.
  const toggleOrder = (orderId) => {
    setExpandedOrderId((prevOrderId) =>
      prevOrderId === orderId ? null : orderId
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center mt-8">
        <h1 className="text-xl sm:text-3xl font-bold mb-3">
          Nu ai comenzi finalizate
        </h1>
        <hr className="border-t border-gray-200 mb-8" />
        <Link
          to="/"
          className="bg-sky-900 text-white px-3 py-2 rounded-md transform transition duration-250 hover:bg-sky-800 active:scale-105 active:bg-sky-700 w-full sm:w-auto text-center"
        >
          Înapoi la cumpărături
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-sky-900">
        Comenzile tale
      </h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-slate-50 shadow-lg shadow-slate-400 rounded-xl overflow-hidden max-w-[800px] mx-auto"
          >
            {/* Header: Order number, data, status, total și toggle (dropdown) */}
            <div
              onClick={() => toggleOrder(order.id)}
              className="bg-slate-200 p-4 border-b cursor-pointer"
            >
              <div className="flex justify-between items-center">
                {/* Stânga: Detalii comandă */}
                <div>
                  <h2 className="text-l font-bold text-sky-900">
                    Comanda nr.{" "}
                    <span className="text-slate-400 font-semibold">
                      {order.order_number.substring(0, 8)}
                    </span>
                  </h2>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="mx-2">&bull;</span>
                    <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full">
                      {order.status || "in procesare"}
                    </span>
                  </div>
                </div>
                {/* Dreapta: Total și icon toggle */}
                <div className="flex flex-col justify-center items-end">
                  <div className="text-right">
                    <p className="text-sky-900 text-sm">Total</p>
                    <p className="text-l font-bold text-sky-900">
                      {order.order_total} RON
                    </p>
                  </div>
                  <div className="pt-2">
                    <svg
                      className={`h-6 w-6 transition-transform duration-300 ${
                        expandedOrderId === order.id ? "rotate-180" : "rotate-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Dropdown: Adrese & Produse comandate (afișează dacă expandedOrderId este egal cu order.id) */}
            {expandedOrderId === order.id && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Livrare */}
                  <div className="bg-gray-50 p-2 rounded-md shadow-lg shadow-slate-200">
                    <h3 className="text-xs font-semibold">Livrare</h3>
                    <p className="text-gray-700 text-xs">
                      {order.delivery_address}, {order.delivery_city},{" "}
                      {order.delivery_county}
                    </p>
                  </div>
                  {/* Facturare */}
                  <div className="bg-gray-50 p-2 rounded-md shadow-lg shadow-slate-200">
                    <h3 className="text-xs font-semibold">Facturare</h3>
                    <p className="text-gray-700 text-xs">
                      {order.billing_address}, {order.billing_city},{" "}
                      {order.billing_county}
                    </p>
                  </div>
                  {/* Metoda de plată */}
                  <div className="bg-gray-50 p-2 rounded-md shadow-lg shadow-slate-200">
                    <h3 className="text-xs font-semibold">Metoda de plată</h3>
                    <p className="text-gray-700 text-xs">
                      {order.payment_method}
                    </p>
                  </div>
                </div>

                {/* Produse comandate */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Produse comandate
                  </h3>
                  <ul className="divide-y divide-gray-200">
                    {order.products_ordered.map((product, index) => (
                      <li
                        key={index}
                        className="py-3 flex items-center space-x-3"
                      >
                        <Link
                          to={`/product/${product.product_id}`}
                          className="flex items-center space-x-3"
                        >
                          <img
                            src={product.image}
                            alt={product.product_name}
                            className="w-16 h-16 object-cover rounded-md border"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {product.product_name}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {product.quantity} x{" "}
                              {(product.price / product.quantity).toFixed(2)}{" "}
                              RON
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Butoane de acțiune */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-semibold py-1 px-2 rounded transition duration-200"
                    onClick={() =>
                      alert(
                        `Functionalitate neimplementata Order ${order.order_number}`
                      )
                    }
                  >
                    Returnează
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold py-1 px-2 rounded transition duration-200"
                    onClick={() =>
                      alert(
                        `Functionalitate neimplementata Order ${order.order_number}`
                      )
                    }
                  >
                    Anulează comanda
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
