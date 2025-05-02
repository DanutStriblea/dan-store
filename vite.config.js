/* global process */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  // Folosește variabila de mediu VITE_DEPLOY_TARGET pentru a diferenția mediu.
  // Dacă variabila nu este setată, se va folosi implicit "ghpages".
  const deployTarget = process.env.VITE_DEPLOY_TARGET || "ghpages";

  // Pentru Vercel, base trebuie să fie "/" (servește de la rădăcină).
  // Pentru GitHub Pages (gh-pages), base va fi "/dan-store/" conform câmpului "homepage".
  const basePath = deployTarget === "vercel" ? "/" : "/dan-store/";

  console.log(
    `Building with deploy target: ${deployTarget}, base: ${basePath}`
  );

  return {
    base: basePath,
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:4242",
          changeOrigin: true,
        },
      },
    },
  };
});

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
