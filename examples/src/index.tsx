import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { DuckRuntime, DuckCmpProps } from "../../src";
import Root from "./Root";
import Duck from "./RootDuck";
import { createLogger } from "redux-logger";

const connectWithDuck = (Component, Duck) => {
  return () => {
    const middlewares = process.env.NODE_ENV === "development"
      ? [createLogger({ collapsed: true })]
      : [];
    const duckRuntime = new DuckRuntime(
      new Duck(),
      middlewares
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
