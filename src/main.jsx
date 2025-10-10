import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import resumeData from "./resumeData.json";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App resumeData={resumeData} />
  </React.StrictMode>
);
