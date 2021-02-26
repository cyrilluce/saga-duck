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
  const [state, setState] = React.useState(store.getState());
  React.useEffect(() => {
    store.subscribe(() => {
      setState(store.getState());
    });
    return () => {
      duckRuntime.destroy();
    };
  }, []);
  return {
    duck: duck,
    store: state,
    dispatch: store.dispatch
  };
}
