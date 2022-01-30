import { isPlainObject } from "lodash";
import React, { useContext, createContext, useState, useEffect } from "react";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import { TodoApi } from "./api";

///// LIBRARY ////////////////////////////////////////////////////////////////

/**
 * A BaseStore with functionality that is common to all stores
 */
export interface BaseStore<State> {
  /**
   * Standard Observable subscribe method.
   */
  subscribe: BehaviorSubject<State>["subscribe"];
  /**
   * Gets the current value of the store state.
   */
  getValue: () => State;
  /**
   * Selects a slice of the state as an Observable.
   * Will only emit on state changes using referential check.
   * Will prevent re-renders on updates to properties outside of the slice.
   */
  selectState: <Selected>(
    projector: SelectProjector<State, Selected>
  ) => Observable<Selected>;
}

/**
 * Creates a BaseStore. Used for composing with custom stores.
 */
export function createBaseStore<State>(
  state: BehaviorSubject<State>
): BaseStore<State> {
  return {
    subscribe: state.subscribe,
    getValue(): State {
      return state.value;
    },
    selectState: <Selected,>(projector: SelectProjector<State, Selected>) => {
      return selectState(state, projector) as Observable<Selected>;
    },
  };
}

function selectState<State, Selected>(
  store: BehaviorSubject<State>,
  projector?: SelectProjector<State, Selected>
): Observable<Selected | State> {
  if (!projector) {
    return store.pipe(distinctUntilChanged());
  } else if (projector && isPlainObject(store.value)) {
    return store.pipe(map(projector), distinctUntilChanged());
  } else {
    return store.pipe(distinctUntilChanged());
  }
}

/**
 * Function used to map state to a slice of that state.
 */
export interface SelectProjector<State, Selected> {
  (state: State): Selected;
}

/**
 * Hook that subscribes to a slice of the state returned from the projector.
 * Unsubscribes on cleanup.
 */
export function useStoreObservable<State, Selected>(
  store: BaseStore<State>,
  projector: SelectProjector<State, Selected>
): Selected {
  const [value, setValue] = useState<Selected>(
    projector(store.getValue() as State)
  );

  useEffect(() => {
    const sub = store.selectState(projector).subscribe((v) => {
      setValue(v);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [store, projector]);

  return value;
}

///// CUSTOM STORE ////////////////////////////////////////////////////////////////

// 1) Define your state
export interface TodosState {
  loading: boolean;
  todos: Todo[];
}

export interface Todo {
  id: string;
  title: string;
  complete: boolean;
}

// 2) Create your store
// BehaviorSubject holds state
// Use object composition to get shared properties from base store
// Add your state updater functions
export function createTodoStore(
  initialState: TodosState = {
    loading: false,
    todos: [] as Todo[],
  },
  todoApi: typeof TodoApi
) {
  const state = new BehaviorSubject<TodosState>(initialState);
  const baseStore = createBaseStore(state);

  return {
    ...baseStore,

    loadTodos() {
      state.next({
        ...state.value,
        loading: true,
      });
      todoApi.getTodos().subscribe((todos) => {
        state.next({
          todos,
          loading: false,
        });
      });
    },
  };
}

export type TodosStateStore = ReturnType<typeof createTodoStore>;

export const todoStore = createTodoStore(
  {
    loading: false,
    todos: [],
  },
  TodoApi
);

// 3) Create a context for the ability to swap out stores for testing
export const TodoStateStoreContext = createContext(todoStore);

// 4) Create a hook to get the store
export function useTodoStore(): TodosStateStore {
  const store = useContext(TodoStateStoreContext);
  return store;
}

export function WithStoreProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TodoStateStoreContext.Provider value={todoStore}>
        {children}
      </TodoStateStoreContext.Provider>
    </>
  );
}
