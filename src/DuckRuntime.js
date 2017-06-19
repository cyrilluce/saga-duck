/**
 * 组合ducks，创建redux store
 */
import { createStore as createReduxStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { all } from "redux-saga/effects";
import { connect } from "react-redux";

/** store初始重置动作 */
export const INIT = "@@duck-runtime-init";
export const END = "@@duck-runtime-end";
/** store销毁Action（用于部分有状态的组件进行清理） */
// 现在页面都是单例，或可不用管销毁，只管初始重置？
// export const DESTROY = "@@duck-runtime-destroy";

export default class DuckRuntime {
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

    const createStore = applyMiddleware(sagaMiddleware, ...this.middlewares)(createReduxStore);

    const duck = this.duck;
    this.store = createStore(duck.reducer);

    this.addSaga(duck.sagas);
  }
  /**
     * 添加sagas到store中
     * @param {Array<Saga|Generator>} sagas 
     */
  addSaga(sagas) {
    this.sagaMiddleware.run(function*() {
      yield all(sagas.map(saga => saga()));
    });
  }
  /**
     * 快速连接到React组件上
     * 用法： 
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
   */
  root() {
    const store = this.store;
    return function decoreate(Container) {
      return class AttachedContainer extends Container {
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
      };
    };
  }
}
