import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // deploy/ holds the raw project folders being staged for separate
      // GitHub deploys (Visual Studio .vs/ caches, bin/, obj/, etc.) — not
      // part of this site's own source. Watching it crashed the dev
      // server outright (EBUSY) on a .vs/ file VS still had locked.
      ignored: ["**/deploy/**"],
    },
  },
});
