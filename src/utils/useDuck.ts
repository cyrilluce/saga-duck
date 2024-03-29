import * as React from "react";
import BaseDuck from "../BaseDuck";
import DuckRuntime, { DuckCmpProps, END, INIT } from "../DuckRuntime";
import { DuckClass } from "./connectWithDuck";
/**
 * hook style DuckRuntime binding.
 */

export default function useDuck<TDuck extends BaseDuck>(
  Duck: DuckClass<TDuck>,
  extraMiddlewares: any[] = []
): DuckCmpProps<TDuck> {
  const duckRuntime = React.useMemo(() => {
    return new DuckRuntime(new Duck(), ...extraMiddlewares);
  }, [Duck]);
  const { duck, store } = duckRuntime;
  const [state, setState] = React.useState(store.getState());
  React.useEffect(() => {
    setState(store.getState());
    store.subscribe(() => {
      setState(store.getState());
    });
    return () => {
      duckRuntime.destroy();
    };
  }, [store, duckRuntime]);
  return {
    duck: duck,
    store: state,
    dispatch: store.dispatch
  };
}
