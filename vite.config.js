// /* eslint-env node */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/dan-store/" : "/", // Ajustăm baza în funcție de mediu
  plugins: [react()],
}));

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import dotenv from "dotenv";

// dotenv.config();

// export default defineConfig(({ mode }) => {
//   return {
//     plugins: [react()],
//     base: mode === "production" ? "/dan-store/" : "/",
//     define: {
//       "process.env": {
//         VITE_SUPABASE_URL: JSON.stringify(process.env.VITE_SUPABASE_URL),
//         VITE_SUPABASE_ANON_KEY: JSON.stringify(
//           process.env.VITE_SUPABASE_ANON_KEY
//         ),
//       },
//     },
//   };
// });
