import * as React from "react";
import { Provider } from 'react-redux'
import DuckRuntime, { DuckCmpProps } from "../DuckRuntime";

type OMIT_DUCK_CMP<TProps> = Omit<TProps, 'duck' | 'store' | 'dispatch'>
export interface DuckClass<TDuck> {
  new(...any: any[]): TDuck
}

/**
 * Bind `Duck Component` with `Duck`, create a new Component without Duck props.
 * 
```
const ConnectedComponent = connectWithDuck(Component, Duck, [ createLogger() ])
```
 * 
 * @param Component 
 * @param Duck 
 * @param extraMiddlewares 
 */
export default function connectWithDuck<TProps extends DuckCmpProps<TDuck>, TState, TDuck>(
  Component: React.ComponentClass<TProps, TState>,
  Duck: DuckClass<TDuck>,
  extraMiddlewares?: any[]
): React.FunctionComponent<OMIT_DUCK_CMP<TProps>>
export default function connectWithDuck<TProps, TDuck>(
  Component: React.FunctionComponent<TProps>,
  Duck: DuckClass<TDuck>,
  extraMiddlewares?: any[]
): React.FunctionComponent<OMIT_DUCK_CMP<TProps>>
export default function connectWithDuck(Component, Duck, extraMiddlewares = []) {
  return function ConnectedWithDuck(props) {
    const { duckRuntime, ConnectedComponent } = React.useMemo(() => {
      const duckRuntime = new DuckRuntime(
        new Duck(),
        ...extraMiddlewares
      )

      const ConnectedComponent = duckRuntime.connectRoot()(Component)
      return {
        duckRuntime,
        ConnectedComponent
      }
    }, [])

    return (
      <Provider store={duckRuntime.store}>
        <ConnectedComponent {...props} />
      </Provider>
    )
  }
}