import {
  Component,
  createElement,
  ComponentClass,
  ComponentType,
  StatelessComponent
} from "react";
import {
  createStore as createReduxStore,
  applyMiddleware,
  Store,
  Dispatch,
  Action
} from "redux";
import Duck from "./Duck";

export interface DuckComponentProps<T extends Duck = Duck<any>, State = any> {
  duck: T;
  store: State;
  dispatch: Dispatch<any>;
}
export type DuckStatelessComponent<
  Props = any,
  T extends Duck = Duck<any>,
  State = any
> = StatelessComponent<Props & DuckComponentProps<T, State>>;
export type DuckComponentClass<
  Props = any,
  T extends Duck = Duck<any>,
  State = any
> = ComponentClass<Props & DuckComponentProps<T, State>>;
export type DuckComponent<
  Props = any,
  T extends Duck = Duck<any>,
  State = any
> =
  | DuckStatelessComponent<Props, T, State>
  | DuckComponentClass<Props, T, State>;
