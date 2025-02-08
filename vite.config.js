import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/dan-store/", // Înlocuiește 'repository-name' cu numele repository-ului tău
});
