import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { supabase } from "../supabaseClient";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Funcție ce preia coșul din localStorage
  const fetchCartItemsFromLocalStorage = () => {
    const localCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    localCartItems.forEach((item) => {
      item.product_price = item.quantity * item.products.price;
    });
    setCartItems(localCartItems);
  };

  // Funcție ce încarcă coșul: dacă utilizatorul este autentificat, preia din BD; altfel, din localStorage.
  const loadCart = useCallback(async () => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error fetching user session:", sessionError);
      fetchCartItemsFromLocalStorage();
      return;
    }
    const user = sessionData?.session?.user;
    if (user) {
      const { data: dbCartItems, error: dbError } = await supabase
        .from("cart")
        .select(
          "id, quantity, product_id, product_price, products (title, images, description, price)"
        )
        .eq("user_id", user.id);
      if (dbError) {
        console.error("Error fetching cart from database:", dbError);
        fetchCartItemsFromLocalStorage();
      } else {
        const adjustedCartItems = (dbCartItems || []).map((item) => ({
          ...item,
          product_price: item.quantity * item.products.price,
        }));
        setCartItems(adjustedCartItems);
      }
    } else {
      fetchCartItemsFromLocalStorage();
    }
  }, []);

  useEffect(() => {
    // La montare se încarcă coșul
    loadCart();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        combineCartItems();
      } else if (event === "SIGNED_OUT") {
        fetchCartItemsFromLocalStorage();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadCart]);

  const combineCartItems = async () => {
    const localCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const { data, error: userError } = await supabase.auth.getSession();

    if (userError) {
      console.error("Error fetching user session:", userError);
      return;
    }

    const user = data?.session?.user;
    if (!user) return;

    const { data: dbCartItems, error: dbError } = await supabase
      .from("cart")
      .select(
        "id, quantity, product_id, product_price, products (title, images, description, price)"
      )
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Error fetching cart from database:", dbError);
      return;
    }

    const combinedItems = [...localCartItems];

    dbCartItems.forEach((dbItem) => {
      const existingItemIndex = combinedItems.findIndex(
        (item) => item.product_id === dbItem.product_id
      );
      if (existingItemIndex > -1) {
        combinedItems[existingItemIndex].quantity += dbItem.quantity;
        combinedItems[existingItemIndex].product_price =
          combinedItems[existingItemIndex].quantity * dbItem.products.price;
      } else {
        combinedItems.push({
          product_id: dbItem.product_id,
          quantity: dbItem.quantity,
          product_price: dbItem.product_price,
          products: dbItem.products,
        });
      }
    });

    await Promise.all(
      combinedItems.map(async (item) => {
        const existingDbItem = dbCartItems.find(
          (dbItem) => dbItem.product_id === item.product_id
        );
        if (existingDbItem) {
          await supabase
            .from("cart")
            .update({ quantity: item.quantity })
            .eq("user_id", user.id)
            .eq("product_id", item.product_id);
        } else {
          await supabase.from("cart").insert({
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product_price: item.product_price,
          });
        }
      })
    );

    localStorage.removeItem("cartItems");
    setCartItems(combinedItems);
  };

  const addToCart = async (product, quantity = 1) => {
    const { data, error: userError } = await supabase.auth.getSession();
    if (userError) {
      console.error("Error fetching user:", userError);
      return;
    }

    const user = data?.session?.user;
    if (!user) {
      const localCartItems =
        JSON.parse(localStorage.getItem("cartItems")) || [];
      const existingItem = localCartItems.find(
        (item) => item.product_id === product.id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.product_price = existingItem.quantity * product.price;
      } else {
        localCartItems.push({
          product_id: product.id,
          product_price: quantity * product.price,
          quantity,
          products: {
            title: product.title,
            images: product.images,
            description: product.description,
            price: product.price,
          },
        });
      }
      localStorage.setItem("cartItems", JSON.stringify(localCartItems));
      setCartItems(localCartItems);
      return;
    }

    const existingItem = cartItems.find(
      (item) => item.product_id === product.id
    );
    if (existingItem) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                product_price: (item.quantity + quantity) * product.price,
              }
            : item
        )
      );
      const { error } = await supabase
        .from("cart")
        .update({
          quantity: existingItem.quantity + quantity,
          product_price: (existingItem.quantity + quantity) * product.price,
        })
        .eq("id", existingItem.id);
      if (error) {
        console.error("Error updating cart item:", error);
      }
    } else {
      const newItem = {
        product_id: product.id,
        product_price: quantity * product.price,
        quantity,
        products: {
          title: product.title,
          images: product.images,
          description: product.description,
          price: product.price,
        },
      };
      setCartItems((prevItems) => [...prevItems, newItem]);
      const { data, error } = await supabase
        .from("cart")
        .insert([
          {
            user_id: user.id,
            product_id: product.id,
            quantity,
            product_price: quantity * product.price,
          },
        ])
        .select("id");
      if (error) {
        console.error("Error adding item to cart:", error);
      } else if (data && data.length > 0) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === product.id ? { ...item, id: data[0].id } : item
          )
        );
      }
    }
  };

  const removeFromCart = async (productId) => {
    const { data, error: userError } = await supabase.auth.getSession();
    if (userError) {
      console.error("Error fetching user:", userError);
      return;
    }
    const user = data?.session?.user;
    if (!user) {
      const localCartItems =
        JSON.parse(localStorage.getItem("cartItems")) || [];
      const updatedCartItems = localCartItems.filter(
        (item) => item.product_id !== productId
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
      setCartItems(updatedCartItems);
      return;
    }
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) {
      console.error("Error removing item from cart:", error);
    } else {
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product_id !== productId)
      );
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const { data, error: userError } = await supabase.auth.getSession();
    if (userError) {
      console.error("Error fetching user:", userError);
      return;
    }
    const user = data?.session?.user;
    if (!user) {
      const localCartItems =
        JSON.parse(localStorage.getItem("cartItems")) || [];
      const item = localCartItems.find((item) => item.product_id === productId);
      if (item) {
        item.quantity = quantity;
        item.product_price = item.products.price * quantity;
        localStorage.setItem("cartItems", JSON.stringify(localCartItems));
        setCartItems(localCartItems);
      }
      return;
    }
    const item = cartItems.find((item) => item.product_id === productId);
    if (!item) return;
    const newProductPrice = item.products.price * quantity;
    const { error } = await supabase
      .from("cart")
      .update({ quantity, product_price: newProductPrice })
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) {
      console.error("Error updating quantity:", error);
    } else {
      await loadCart();
    }
  };

  const getQuantity = (productId) => {
    const item = cartItems.find((item) => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return cartItems.some((item) => item.product_id === productId);
  };

  const resetQuantity = (productId) => {
    const localCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const itemIndex = localCartItems.findIndex(
      (item) => item.product_id === productId
    );
    if (itemIndex !== -1) {
      localCartItems[itemIndex].quantity = 1;
      localCartItems[itemIndex].product_price =
        1 * localCartItems[itemIndex].products.price;
      localStorage.setItem("cartItems", JSON.stringify(localCartItems));
    }
  };

  // Noua secțiune: ștergerea intrării din order_details când coșul este gol
  useEffect(() => {
    if (cartItems.length === 0) {
      const tempOrderId = localStorage.getItem("tempOrderId");
      if (tempOrderId) {
        const deleteOrderDetails = async () => {
          const { error } = await supabase
            .from("order_details")
            .delete()
            .eq("id", tempOrderId);
          if (error) {
            console.error("Eroare la ștergerea order_details:", error);
          } else {
            console.log(`Order_details cu id ${tempOrderId} a fost șters.`);
            localStorage.removeItem("tempOrderId");
          }
        };
        deleteOrderDetails();
      }
    }
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getQuantity,
        isInCart,
        resetQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CartProvider;
