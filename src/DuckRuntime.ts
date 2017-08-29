/**
 * 组合ducks，创建redux store
 */
import { Component, createElement, ComponentClass, ComponentType, StatelessComponent } from "react";
import {
  createStore as createReduxStore,
  applyMiddleware,
  Store,
  Dispatch
} from "redux";
import createSagaMiddleware, { SagaIterator, SagaMiddleware } from "redux-saga";
import { connect } from "react-redux";
import { parallel } from "redux-saga-catch";

import Duck from "./Duck";
import { DuckComponent, DuckComponentProps } from "./DuckComponent";

/** Fire when React Root Component mounted */
export const INIT = "@@duck-runtime-init";
/** Fire when React Root Component unmounted */
export const END = "@@duck-runtime-end";

export default class DuckRuntime<TState = any> {
  duck: Duck<TState>;
  private middlewares: any[];
  private sagaMiddleware: SagaMiddleware<any>;
  public store: Store<TState>;
  /**
     * 
     * @param {*} duck
     * @param middlewares
     */
  constructor(duck, ...middlewares) {
    this.duck = duck;
    this.middlewares = middlewares;

    this._initStore();
  }
  /**
     * 创建redux store
     */
  _initStore() {
    const sagaMiddleware = (this.sagaMiddleware = createSagaMiddleware());

    const createStore = applyMiddleware(sagaMiddleware, ...this.middlewares)(
      createReduxStore
    );

    const duck = this.duck;
    this.store = createStore(<any>duck.reducer);

    this.addSaga(duck.sagas);
  }
  /**
     * 添加sagas到store中
     * add sagas to store, will auto run.
     * @param {Array<Saga|Generator>} sagas 
     */
  addSaga(sagas: Array<() => SagaIterator>) {
    this.sagaMiddleware.run(function*() {
      yield parallel(sagas);
    });
  }
  /**
     * 快速连接到React组件上
     * connect Redux store to React Component
     * 用法/usage： 
     * @duckContainer.connect()
     * class Container extends React.Component{}
     */
  connect() {
    const duck = this.duck;
    return function decorate(
      Container: DuckComponent
    ) {
      return connect(
        state => ({ store: state }),
        dispatch => ({
          duck,
          dispatch
        })
      )(Container);
    };
  }
  /**
   * 声明React根组件，当组件创建时，发出INIT动作；销毁时发出END动作；
   * declare root container, fire INIT action while mount, END action while unmount.
   */
  root() {
    const store = this.store;
    return function decorate(Container): ComponentClass {
      class AttachedContainer extends Component {
        componentDidMount() {
          store.dispatch({ type: INIT });
          if (super.componentDidMount) {
            return super.componentDidMount(...arguments);
          }
        }
        componentWillUnmount() {
          store.dispatch({ type: END });
          if (super.componentWillUnmount) {
            return super.componentWillUnmount(...arguments);
          }
        }
        render() {
          return createElement(Container, this.props);
        }
      }
      (AttachedContainer as ComponentClass).displayName = `duckRoot(${Container.displayName ||
        Container.name ||
        "Unknown"})`;
      return AttachedContainer;
    };
  }
  /**
   * equals to:
   * duckRuntime.connect()(
   *   duckRuntime.root()(Container)
   * )
   * 同时绑定Root及connect
   */
  connectRoot() {
    const decorateRoot = this.root();
    const decorateConnect = this.connect();
    return function decorate(Container) {
      return decorateConnect(decorateRoot(Container));
    };
  }
}
