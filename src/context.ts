import { createContext } from "react";
import { TodoApi } from "./api";
import { Stores, TodosStateStore } from "./state";

export const todosStateStore = new TodosStateStore(
  {
    loading: false,
    todos: [],
  },
  new TodoApi()
);

export const StoreContext = createContext<Stores>({
  todos: todosStateStore,
});
