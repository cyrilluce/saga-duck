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
  }, []);
  const { duck, store } = duckRuntime;
  React.useEffect(() => {
    return () => {
      duckRuntime.destroy();
    };
  }, []);
  const [state, setState] = React.useState(store.getState());
  store.subscribe(() => {
    setState(store.getState());
  });
  return {
    duck: duck,
    store: state,
    dispatch: store.dispatch
  };
}
