import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/themes.css";
import "./styles/base.css";
import App from "./App";
import { setFavicon } from "./lib/favicon";

setFavicon();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
