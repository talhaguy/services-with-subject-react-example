import { isPlainObject } from "lodash";
import { useContext, createContext, useState, useEffect } from "react";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import { TodoApi } from "./api";

export class StateStore<State> extends BehaviorSubject<State> {
  public updateState(updatedState: State): void {
    this.next(updatedState);
  }

  public patchState(updatedState: Partial<State>): void {
    if (isPlainObject(this.value)) {
      this.next({
        ...this.value,
        ...updatedState,
      });
    } else {
      this.next(updatedState as State);
    }
  }

  public getState(): State {
    return this.value;
  }

  public select<Selected>(
    projector: SelectProjector<State, Selected>
  ): Observable<Selected | State> {
    if (!projector) {
      return this.pipe(distinctUntilChanged());
    } else if (projector && isPlainObject(this.value)) {
      return this.pipe(map(projector), distinctUntilChanged());
    } else {
      return this.pipe(distinctUntilChanged());
    }
  }
}

export interface SelectProjector<
  State extends { [key: string]: any },
  Selected
> {
  (state: State): Selected;
}

export function useStoreObservable<State, Selected>(
  store: StateStore<State>,
  projector: SelectProjector<State, Selected>
) {
  const [value, setValue] = useState<Selected>(projector(store.value));

  useEffect(() => {
    const sub = store.select(projector).subscribe((v) => {
      setValue(v as Selected);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [store, projector]);

  return value;
}

//////////////////////////////////////////////////////

export interface TodosState {
  loading: boolean;
  todos: Todo[];
}

export interface Todo {
  id: string;
  title: string;
  complete: boolean;
}

export const todoStateStore = new StateStore<TodosState>({
  loading: false,
  todos: [],
});

export function createStoreActions(
  store: typeof todoStateStore,
  todoApi: TodoApi
) {
  return {
    loadTodos() {
      store.patchState({
        loading: true,
      });
      todoApi.getTodos().subscribe((todos) => {
        store.patchState({
          todos,
          loading: false,
        });
      });
    },
  };
}

export const TodoStateStoreContext = createContext({
  store: todoStateStore,
  actions: createStoreActions(todoStateStore, new TodoApi()),
});

export function useTodoStore(): [
  typeof todoStateStore,
  ReturnType<typeof createStoreActions>
] {
  const store = useContext(TodoStateStoreContext);
  return [store.store, store.actions];
}
