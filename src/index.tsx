import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { StoreContext, todosStateStore } from "./context";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <StoreContext.Provider
      value={{
        todos: todosStateStore,
      }}
    >
      <App />
    </StoreContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
