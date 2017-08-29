import { Component, createElement } from "react";
import { createStore as createReduxStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { connect } from "react-redux";
import { parallel } from "redux-saga-catch";
export const INIT = "@@duck-runtime-init";
export const END = "@@duck-runtime-end";
export default class DuckRuntime {
    constructor(duck, ...middlewares) {
        this.duck = duck;
        this.middlewares = middlewares;
        this._initStore();
    }
    _initStore() {
        const sagaMiddleware = (this.sagaMiddleware = createSagaMiddleware());
        const createStore = applyMiddleware(sagaMiddleware, ...this.middlewares)(createReduxStore);
        const duck = this.duck;
        this.store = createStore(duck.reducer);
        this.addSaga(duck.sagas);
    }
    addSaga(sagas) {
        this.sagaMiddleware.run(function* () {
            yield parallel(sagas);
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
    root() {
        const store = this.store;
        return function decorate(Container) {
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
