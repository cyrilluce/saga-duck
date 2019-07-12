import { SagaIterator, Task } from "redux-saga";
import Duck from "./Duck";
export declare const INIT = "@@duck-runtime-init";
export declare const END = "@@duck-runtime-end";
export interface DuckCmpProps<T = any> {
    duck: T;
    store: any;
    dispatch: (action: any) => any;
}
export interface DuckRuntimeOptions {
    middlewares?: any[];
    enhancers?: any[];
}
export default class DuckRuntime<TState = any> {
    duck: Duck;
    private middlewares;
    private enhancers;
    private sagaMiddleware;
    store: any;
    private _tasks;
    constructor(duck: any, options?: DuckRuntimeOptions);
    _initStore(): void;
    addSaga(sagas: Array<() => SagaIterator>): Task;
    destroy(): void;
    connect(): (Container: any) => any;
    root(autoDestroy?: boolean): (Container: any) => any;
    connectRoot(): (Container: any) => any;
}
