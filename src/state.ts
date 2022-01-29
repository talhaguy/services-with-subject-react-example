import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import { TodoApi } from "./api";

// base class for generic state methods and props
// this class stays the same, it is just inherited from
export class StateStore<State> {
  private state: BehaviorSubject<State>;
  public state$: Observable<State>;

  constructor(initialState: State) {
    this.state = new BehaviorSubject<State>(initialState);
    this.state$ = this.state.asObservable();
  }

  public select<Selected>(
    projector: SelectProjector<State, Selected>
  ): Observable<Selected> {
    return this.state$.pipe(map(projector), distinctUntilChanged());
  }

  public patchState(updatedState: Partial<State>): void {
    this.state.next({
      ...this.state.value,
      ...updatedState,
    });
  }

  public getState(): State {
    return this.state.value;
  }
}

export interface SelectProjector<
  State extends { [key: string]: any },
  Selected
> {
  (state: State): Selected;
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

// create your own custom state store that extends from the base one
export class TodosStateStore extends StateStore<TodosState> {
  // expose desired slices of state
  public todos$ = this.select((state) => state.todos);
  public loading$ = this.select((state) => state.loading);

  constructor(initialState: TodosState, private todoApi: TodoApi) {
    super(initialState);
  }

  // create methods to operate on state
  loadTodos() {
    this.patchState({
      loading: true,
    });
    this.todoApi.getTodos().subscribe((todos) => {
      this.patchState({
        todos,
        loading: false,
      });
    });
  }
}

export interface Stores {
  todos: TodosStateStore;
}
