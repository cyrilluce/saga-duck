import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { DuckRuntime } from "saga-duck";
import Root from "./Root";
import Duck from "./RootDuck";

const connectWithDuck = (Component, Duck) => {
  return () => {
    const duckRuntime = new DuckRuntime(
      new Duck({
        step: 2,
        getStep: () => 3
      })
    );
    const ConnectedComponent = duckRuntime.root()(
      duckRuntime.connect()(Component)
    );
    return (
      <Provider store={duckRuntime.store}>
        <ConnectedComponent />
      </Provider>
    );
  };
};

const ConnectedRoot = connectWithDuck(Root, Duck);

ReactDOM.render(<ConnectedRoot />, document.getElementById("root"));
