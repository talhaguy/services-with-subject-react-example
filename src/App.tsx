import { useEffect } from "react";
import { Todo } from "./state";
import { useObservable, useSelectState, useStore } from "./hooks";
import "./App.css";

function App() {
  return <TodoList />;
}

//////////////////////////////////////

interface TodoListProps {}

function TodoList(props: TodoListProps) {
  const todosStore = useStore("todos");
  const todos = useObservable(todosStore.todos$);
  const loading = useObservable(todosStore.loading$);
  // alternate way if class does not expose a desired observable:
  // const todos = useSelectState(todosStore, (state) => {
  //   return { todos: state.todos, loading: state.loading };
  // });

  useEffect(() => {
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

//////////////////////////////////////

interface TodoItemProps {
  todo: Todo;
}

function TodoItem({ todo }: TodoItemProps) {
  return <p>{todo.title}</p>;
}

//////////////////////////////////////

export default App;
