import { useEffect } from "react";
import { Todo, useStoreObservable, useTodoStore } from "./state";
import "./App.css";

function App() {
  return <TodoList />;
}

//////////////////////////////////////////////////////////////////////////////

interface TodoListProps {}

function TodoList(props: TodoListProps) {
  // 1) Get the store
  const todosStore = useTodoStore();
  // 2) Select the desired slice of state using useStoreObservable
  const todos = useStoreObservable(todosStore, (state) => state.todos);
  const loading = useStoreObservable(todosStore, (state) => state.loading);

  useEffect(() => {
    // 3) Use store updates as necessary
    todosStore.loadTodos();
  }, [todosStore]);

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {todos?.map((todo) => {
            return (
              <li key={todo.id}>
                <TodoItem todo={todo} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

//////////////////////////////////////////////////////////////////////////////

interface TodoItemProps {
  todo: Todo;
}

function TodoItem({ todo }: TodoItemProps) {
  return <p>{todo.title}</p>;
}

//////////////////////////////////////////////////////////////////////////////

export default App;
