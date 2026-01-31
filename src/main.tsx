import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force light mode - dark mode disabled
document.documentElement.classList.remove("dark");

createRoot(document.getElementById("root")!).render(<App />);
