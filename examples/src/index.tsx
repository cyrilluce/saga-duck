import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { connectWithDuck } from "../../src";
import Root from "./Root";
import Duck from "./RootDuck";
import { createLogger } from "redux-logger";

import StandaloneCounter from './StandaloneCounter'

const ConnectedRoot = connectWithDuck(Root, Duck, [createLogger({ collapsed: true })]);
ReactDOM.render(<ConnectedRoot />, document.getElementById("root"));

ReactDOM.render(<StandaloneCounter />, document.getElementById("standalone"));