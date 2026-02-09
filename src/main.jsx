import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import MAKBot from "./MAKBot";
import GoogleAuthSuccess from "./GoogleAuthSuccess";
import Settings from "./Settings";
import SharedChat from "./SharedChat";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MAKBot />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/shared/:shareToken" element={<SharedChat />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);
