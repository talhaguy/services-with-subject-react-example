import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { WithStoreProviders } from "./state";

ReactDOM.render(
  <React.StrictMode>
    <WithStoreProviders>
      <App />
    </WithStoreProviders>
  </React.StrictMode>,
  document.getElementById("root")
);
