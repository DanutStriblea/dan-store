import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/repository-name/", // Înlocuiește 'repository-name' cu numele repository-ului tău
});
