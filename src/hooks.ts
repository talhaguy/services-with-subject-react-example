import { useContext, useEffect, useState } from "react";
import { Observable } from "rxjs";
import { StoreContext } from "./context";
import { SelectProjector, Stores } from "./state";

export function useStore(key: keyof Stores) {
  const stores = useContext(StoreContext);
  const store = stores[key];
  return store;
}

export function useSelectState<Selected>(
  store: Stores[keyof Stores],
  projector: SelectProjector<ReturnType<typeof store["getState"]>, Selected>
) {
  const [state, setState] = useState(projector(store.getState()));

  useEffect(() => {
    const state$ = store.select<Selected>(projector as any);
    const sub = state$.subscribe((updatedState) => {
      setState(updatedState);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [store, projector]);

  return state;
}

export function useObservable<Emitted>(obs$: Observable<Emitted>) {
  const [value, setValue] = useState<Emitted | null>(null);

  useEffect(() => {
    const sub = obs$.subscribe((v) => {
      setValue(v);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [obs$]);

  return value;
}
