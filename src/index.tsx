import React from "react";
import ReactDOM from "react-dom";
import { TodoApi } from "./api";
import App from "./App";
import "./index.css";
import {
  createStoreActions,
  todoStateStore,
  TodoStateStoreContext,
} from "./state";

ReactDOM.render(
  <React.StrictMode>
    <TodoStateStoreContext.Provider
      value={{
        store: todoStateStore,
        actions: createStoreActions(todoStateStore, new TodoApi()),
      }}
    >
      <App />
    </TodoStateStoreContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
