import { supabase } from "file:///C:/Users/test/Desktop/dan-store/src/supabaseClient.js";
import { products } from "file:///C:/Users/test/Desktop/dan-store/src/data.js";

// Funcția pentru inserarea produselor
const insertProducts = async () => {
  const { data, error } = await supabase
    .from("products") // Indică tabelul "products"
    .upsert(products, { onConflict: ["id"] }); // "upsert" va adăuga sau actualiza produsele în funcție de "id"

  if (error) {
    console.error("Eroare la inserarea produselor:", error.message);
  } else {
    console.log("Produse adăugate cu succes:", data);
  }
};

// Apelarea funcției pentru a adăuga produsele
insertProducts();

// apoi adauga in consola:
//cd C:/Users/test/Desktop/dan-store/src
// in Supabase, dezactiveaza RLS din tabelul products
//node insertProducts.js
