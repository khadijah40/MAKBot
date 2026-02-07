import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import MAKBot from "./MAKBot.jsx";
import Settings from "./Settings.jsx";

const GOOGLE_CLIENT_ID =
  "901230616487-svqcaqtneo22e3hemlb3ccop7mdu6lg2.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<MAKBot />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  </StrictMode>,
);
