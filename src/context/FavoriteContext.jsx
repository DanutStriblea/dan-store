import { createContext, useState, useEffect, useCallback } from "react"; // Importăm funcționalități React.
import PropTypes from "prop-types"; // PropTypes ajută la validarea tipurilor de prop-uri pentru componenta noastră.
import { supabase } from "../supabaseClient"; // Importăm clientul Supabase pentru gestionarea bazei de date.
import { v4 as uuidv4 } from "uuid"; // Importăm generatorul UUID pentru crearea ID-urilor unice.

export const FavoriteContext = createContext(); // Creăm contextul global pentru gestionarea favoritelor.

const FavoriteProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]); // Starea globală pentru articolele favorite.
  const [userId, setUserId] = useState(null); // ID-ul utilizatorului autentificat (sau `null` dacă este delogat).

  // Funcție pentru validarea unui UUID (verifică formatul unui ID)
  const isValidUUID = (uuid) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      uuid
    );
  };

  // Ascultăm evenimentele de autentificare (logare/delogare).
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          // Dacă utilizatorul s-a logat:
          setUserId(session.user.id); // Setăm ID-ul utilizatorului.
          combineFavorites(); // Combinăm favoritele din localStorage cu cele din baza de date.
        } else if (event === "SIGNED_OUT") {
          // Dacă utilizatorul s-a delogat:
          setUserId(null); // Resetăm ID-ul utilizatorului.
          setFavoriteItems([]); // Golim lista de favorite.
          localStorage.removeItem("favoriteItems"); // Resetăm localStorage.
        }
      }
    );

    return () => {
      // Curățăm listener-ul atunci când componenta se demontează.
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Funcție pentru preluarea favoritelor în funcție de starea utilizatorului.
  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      // Dacă utilizatorul nu este logat, preluăm favoritele din localStorage.
      const localFavorites =
        JSON.parse(localStorage.getItem("favoriteItems")) || [];
      setFavoriteItems(localFavorites); // Actualizăm starea globală cu datele din localStorage.
      return;
    }

    try {
      // Dacă utilizatorul este logat, preluăm favoritele din baza de date.
      const { data, error } = await supabase
        .from("favorites")
        .select(
          `
          product_id,
          products (
            id,
            title,
            price,
            images
          )
        `
        )
        .eq("user_id", userId);

      if (error) {
        return; // Gestionăm erorile (dacă apar).
      }

      // Transformăm datele din baza de date într-un format util pentru aplicație.
      setFavoriteItems(
        data.map((item) => ({
          product_id: item.product_id,
          title: item.products.title,
          price: item.products.price,
          images: item.products.images,
        }))
      );
    } catch (error) {
      console.error("Eroare la încărcarea produselor favorite:", error);
    }
  }, [userId]); // Funcția depinde doar de `userId`.

  // Efect pentru preluarea favoritelor ori de câte ori `userId` se schimbă.
  useEffect(() => {
    fetchFavorites(); // Apelăm funcția pentru a prelua favoritele.
  }, [userId, fetchFavorites]);

  // Funcție pentru adăugarea unui produs la favorite.
  const addToFavorites = async (product) => {
    let productId = product.id;

    // Dacă ID-ul nu este valid, generăm unul nou.
    if (!isValidUUID(productId)) {
      productId = uuidv4();
    }

    // Verificăm dacă produsul există deja în favorite.
    if (favoriteItems.some((item) => item.product_id === productId)) {
      return; // Dacă există deja, nu facem nimic.
    }

    if (userId) {
      // Dacă utilizatorul este logat, adăugăm produsul în baza de date.
      try {
        await supabase.from("favorites").insert({
          user_id: userId,
          product_id: productId,
        });
      } catch (error) {
        console.error("Eroare la adăugarea în baza de date:", error);
      }
    } else {
      // Dacă utilizatorul este delogat, salvăm produsul în localStorage.
      const localFavorites =
        JSON.parse(localStorage.getItem("favoriteItems")) || [];
      localFavorites.push({
        product_id: productId,
        title: product.title,
        price: product.price,
        images: product.images,
      });
      localStorage.setItem("favoriteItems", JSON.stringify(localFavorites)); // Actualizăm localStorage.
    }

    // Actualizăm starea globală.
    setFavoriteItems((prevItems) => [
      ...prevItems,
      {
        product_id: productId,
        title: product.title,
        price: product.price,
        images: product.images,
      },
    ]);
  };

  // Funcție pentru eliminarea unui produs din favorite.
  const removeFromFavorites = async (productId) => {
    // Actualizăm starea globală imediat.
    setFavoriteItems((prevItems) =>
      prevItems.filter((item) => item.product_id !== productId)
    );

    if (userId) {
      // Dacă utilizatorul este logat, eliminăm produsul din baza de date.
      try {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
        if (error) {
          console.error("Eroare la eliminarea din favorite:", error);
        }
      } catch (error) {
        console.error("Eroare la eliminarea din favorite:", error);
      }
    } else {
      // Dacă utilizatorul este delogat, eliminăm produsul din localStorage.
      const localFavorites =
        JSON.parse(localStorage.getItem("favoriteItems")) || [];
      const updatedFavorites = localFavorites.filter(
        (item) => item.product_id !== productId
      );
      localStorage.setItem("favoriteItems", JSON.stringify(updatedFavorites));
    }
  };

  // Funcție pentru combinarea favoritelor din localStorage cu cele din baza de date.
  const combineFavorites = useCallback(async () => {
    if (!userId) return; // Dacă utilizatorul nu este logat, ieșim din funcție.

    const localFavorites =
      JSON.parse(localStorage.getItem("favoriteItems")) || [];

    const { data: dbFavorites, error: dbError } = await supabase
      .from("favorites")
      .select(
        `
        product_id,
        products (
          id,
          title,
          price,
          images
        )
      `
      )
      .eq("user_id", userId);

    if (dbError) {
      console.error("Error fetching favorites from database:", dbError);
      return;
    }

    // Combinăm favoritele din localStorage cu cele din baza de date, evitând duplicatele.
    const combinedFavorites = [...localFavorites];
    dbFavorites.forEach((dbItem) => {
      if (
        !combinedFavorites.some((item) => item.product_id === dbItem.product_id)
      ) {
        combinedFavorites.push({
          product_id: dbItem.product_id,
          title: dbItem.products.title,
          price: dbItem.products.price,
          images: dbItem.products.images,
        });
      }
    });

    // Adăugăm în baza de date produsele din localStorage care lipsesc.
    const newFavoritesToAdd = localFavorites.filter(
      (item) =>
        !dbFavorites.some((dbItem) => dbItem.product_id === item.product_id)
    );

    try {
      await Promise.all(
        newFavoritesToAdd.map(async (item) => {
          await supabase.from("favorites").insert({
            user_id: userId,
            product_id: item.product_id,
          });
        })
      );
    } catch (error) {
      console.error("Eroare la sincronizarea favoritelor:", error);
    }

    // Actualizăm starea globală și golim localStorage.
    setFavoriteItems(combinedFavorites);
    localStorage.removeItem("favoriteItems");
  }, [userId]);

  // Dacă `userId` se schimbă, apelăm `combineFavorites` pentru a sincroniza favoritele.
  useEffect(() => {
    if (userId) {
      combineFavorites();
    }
  }, [userId, combineFavorites]);

  return (
    <FavoriteContext.Provider
      value={{ favoriteItems, addToFavorites, removeFromFavorites }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

FavoriteProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FavoriteProvider;
