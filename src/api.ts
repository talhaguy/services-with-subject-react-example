import { mapTo, Observable, timer } from "rxjs";
import { Todo } from "./state";

export class TodoApi {
  public getTodos(): Observable<Todo[]> {
    return timer(1000).pipe(
      mapTo([
        {
          id: "123",
          title: "The first",
          complete: false,
        },
        {
          id: "456",
          title: "The second",
          complete: false,
        },
        {
          id: "789",
          title: "The third",
          complete: false,
        },
      ])
    );
  }
}
