// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./utils/ScrollToTop";
import "./index.css";
import App from "./App.jsx";
import "./font.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop behavior="smooth" restoreBehavior="auto" offset={80} />
      <App />
    </BrowserRouter>
  </StrictMode>
);
