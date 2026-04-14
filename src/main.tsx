import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import PlatformTracker from "./PlatformTracker";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlatformTracker />
  </StrictMode>
);
