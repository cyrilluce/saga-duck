import { Component, createElement } from "react";
import { createStore as createReduxStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import { connect } from "react-redux";
import { parallel } from "redux-saga-catch";
export const INIT = "@@duck-runtime-init";
export const END = "@@duck-runtime-end";
export default class DuckRuntime {
    constructor(duck, middlewares = [], enhancers = []) {
        this._tasks = [];
        this.duck = duck;
        this.middlewares = middlewares || [];
        this.enhancers = enhancers || [];
        this._initStore();
    }
    _initStore() {
        const duck = this.duck;
        const sagaMiddleware = (this.sagaMiddleware = createSagaMiddleware());
        const enhancer = compose(applyMiddleware(sagaMiddleware, ...this.middlewares), ...this.enhancers);
        this.store = createReduxStore(duck.reducer, enhancer);
        this.addSaga(duck.sagas);
    }
    addSaga(sagas) {
        const task = this.sagaMiddleware.run(function* () {
            yield parallel(sagas);
        });
        this._tasks.push(task);
        return task;
    }
    destroy() {
        const tasks = this._tasks;
        this._tasks = [];
        tasks.forEach(task => {
            task.cancel();
        });
    }
    connect() {
        const duck = this.duck;
        return function decorate(Container) {
            return connect(state => ({ store: state }), dispatch => ({
                duck,
                dispatch
            }))(Container);
        };
    }
    root(autoDestroy = true) {
        const duckRuntime = this;
        const store = this.store;
        return function decorate(Container) {
            class AttachedContainer extends Component {
                componentDidMount() {
                    store.dispatch({ type: INIT });
                    if (super.componentDidMount) {
                        return super.componentDidMount();
                    }
                }
                componentWillUnmount() {
                    store.dispatch({ type: END });
                    if (autoDestroy) {
                        duckRuntime.destroy();
                    }
                    if (super.componentWillUnmount) {
                        return super.componentWillUnmount();
                    }
                }
                render() {
                    return createElement(Container, this.props);
                }
            }
            AttachedContainer.displayName = `duckRoot(${Container.displayName ||
                Container.name ||
                "Unknown"})`;
            return AttachedContainer;
        };
    }
    connectRoot() {
        const decorateRoot = this.root();
        const decorateConnect = this.connect();
        return function decorate(Container) {
            return decorateConnect(decorateRoot(Container));
        };
    }
}
