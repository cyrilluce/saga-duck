/**
 * 组合ducks，创建redux store
 */
import { Component, createElement } from "react";
import { createStore as createReduxStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware, { SagaIterator, SagaMiddleware, Task } from "redux-saga";
import { connect } from "react-redux";
import { parallel } from "redux-saga-catch";
import Duck from "./Duck";

/** Fire when React Root Component mounted */
export const INIT = "@@duck-runtime-init";
/** Fire when React Root Component unmounted */
export const END = "@@duck-runtime-end";

export interface DuckCmpProps<T = any> {
  duck: T;
  store: any;
  dispatch: (action: any) => any;
}

export default class DuckRuntime<TState = any> {
  duck: Duck;
  private enhancers: any[];
  private middlewares: any[];
  private sagaMiddleware: SagaMiddleware<any>;
  public store: any;
  private _tasks: Task[] = [];
  /**
     *
     * @param {*} duck
     * @param middlewares
     * @param enhancers
     */
  constructor(duck, middlewares = [], enhancers = []) {
    this.duck = duck;
    this.middlewares = middlewares || [];
    this.enhancers = enhancers || [];

    this._initStore();
  }
  /**
     * 创建redux store
     */
  _initStore() {
    const duck = this.duck;
    const sagaMiddleware = (this.sagaMiddleware = createSagaMiddleware());
    const enhancer = compose(
      applyMiddleware(sagaMiddleware, ...this.middlewares),
      ...this.enhancers,
    );
    this.store = createReduxStore(<any>duck.reducer, <any>enhancer);
    this.addSaga(duck.sagas);
  }
  /**
     * 添加sagas到store中
     * add sagas to store, will auto run.
     * @param {Array<Saga|Generator>} sagas
     */
  addSaga(sagas: Array<() => SagaIterator>) {
    const task = this.sagaMiddleware.run(function*() {
      yield parallel(sagas);
    });
    this._tasks.push(task);
    return task;
  }
  /**
   * 停止一切已添加的sagas
   * stop every added sagas.
   */
  destroy(){
    const tasks = this._tasks;
    this._tasks = [];
    tasks.forEach(task=>{
      task.cancel();
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
    return function decorate(Container) {
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
   * @param autoDestroy 当React组件unmount时，自动销毁duckRuntime。 destroy duckRuntime when React unmount
   */
  root(autoDestroy = true) {
    const duckRuntime = this
    const store = this.store;
    return function decorate(Container): any {
      class AttachedContainer extends Component {
        componentDidMount() {
          store.dispatch({ type: INIT });
          if (super.componentDidMount) {
            return super.componentDidMount();
          }
        }
        componentWillUnmount() {
          store.dispatch({ type: END });
          if(autoDestroy){
            duckRuntime.destroy();
          }
          if (super.componentWillUnmount) {
            return super.componentWillUnmount();
          }
        }
        render() {
          return createElement(Container, (this as any).props);
        }
      }
      (AttachedContainer as any).displayName = `duckRoot(${Container.displayName ||
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
