import "./i18n";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadCriticalRoutes } from "./app/routes/preloadRoutes";

createRoot(document.getElementById("root")!).render(<App />);

// Preload critical route chunks after initial render
preloadCriticalRoutes();

