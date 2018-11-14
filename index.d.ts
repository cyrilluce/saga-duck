declare module 'saga-duck/Duck' {
	export type STATE_OF_REDUCERS<REDUCERS extends {
	    [key: string]: () => any;
	}> = {
	    [key in keyof REDUCERS]: ReturnType<REDUCERS[key]>;
	};
	export type REDUCER<TState> = (state: TState, action: any) => TState; type GLOBAL_SELECTOR<T> = T extends (state: any, ...rest: infer U) => infer K ? (globalState: any, ...rest: U) => K : never; type GLOBAL_SELECTORS<T> = {
	    [key in keyof T]: GLOBAL_SELECTOR<T[key]>;
	};
	export interface DuckOptions {
	    namespace: string;
	    selector(globalState: any): any;
	    route: string;
	}
	export type TYPES<T> = {
	    readonly [P in keyof T]: string;
	};
	export default class Duck {
	    protected options: DuckOptions;
	    protected id: string;
	    constructor(options?: DuckOptions);
	    protected readonly actionTypePrefix: string;
	    protected readonly _cacheGetters: string[];
	    private _makeCacheGetters;
	    readonly types: TYPES<this["quickTypes"]> & this["rawTypes"];
	    readonly quickTypes: {};
	    readonly rawTypes: {};
	    protected makeTypes<T>(typeEnum: T): TYPES<T>;
	    readonly reducers: {};
	    readonly reducer: REDUCER<this["State"]>;
	    readonly State: STATE_OF_REDUCERS<this["reducers"]>;
	    readonly selector: (globalState: any) => this["State"];
	    readonly selectors: GLOBAL_SELECTORS<this["rawSelectors"]>;
	    readonly rawSelectors: {};
	    readonly localSelectors: this["rawSelectors"];
	    readonly creators: {};
	    saga(): IterableIterator<any>;
	    readonly sagas: any[];
	    static memorize<T>(fn: (duck: any, dispatch: any) => T): (reactInstanceOrProps: any) => T;
	}
	export const memorize: typeof Duck.memorize;
	export {};

}
declare module 'saga-duck/DuckMap' {
	import Duck, { DuckOptions, STATE_OF_REDUCERS, REDUCER } from 'saga-duck/Duck'; type DuckType<T extends Duck> = {
	    new (options?: DuckOptions): T;
	}; type DUCKS_STATES<T extends Record<string, Duck>> = {
	    [key in keyof T]: T[key]["State"];
	}; type DUCKS<T extends Record<string, DuckType<Duck>>> = {
	    [key in keyof T]: InstanceType<T[key]>;
	};
	export default class DuckMap extends Duck {
	    protected readonly _cacheGetters: string[];
	    readonly State: STATE_OF_REDUCERS<this["reducers"]> & DUCKS_STATES<this["ducks"]>;
	    protected getSubDuckOptions(route: string): DuckOptions;
	    protected makeDucks<T extends Record<string, DuckType<Duck>>>(ducks: T): DUCKS<T>;
	    readonly ducks: DUCKS<this["quickDucks"]> & this["rawDucks"];
	    readonly quickDucks: {};
	    readonly rawDucks: {};
	    readonly reducer: REDUCER<this["State"]>;
	    private ducksSaga;
	    saga(): IterableIterator<any>;
	}
	export {};

}
declare module 'saga-duck/DuckRuntime' {
	import { SagaIterator, Task } from "redux-saga";
	import Duck from 'saga-duck/Duck';
	export const INIT = "@@duck-runtime-init";
	export const END = "@@duck-runtime-end";
	export interface DuckCmpProps<T = any> {
	    duck: T;
	    store: any;
	    dispatch: (action: any) => any;
	}
	export default class DuckRuntime<TState = any> {
	    duck: Duck;
	    private middlewares;
	    private sagaMiddleware;
	    store: any;
	    private _tasks;
	    constructor(duck: any, ...middlewares: any[]);
	    _initStore(): void;
	    addSaga(sagas: Array<() => SagaIterator>): Task;
	    destroy(): void;
	    connect(): (Container: any) => any;
	    root(autoDestroy?: boolean): (Container: any) => any;
	    connectRoot(): (Container: any) => any;
	}

}
declare module 'saga-duck/helper' {
	export function asResult<T>(fn: (...any: any[]) => T, result: any): T;
	export function reduceFromPayload<T>(actionType: string | number, initialState: T): (state: T, action: {
	    type: string | number;
	    payload?: T;
	}) => T;
	export function createToPayload<T>(actionType: string | number): (payload: T) => {
	    type: string | number;
	    payload: T;
	};

}
declare module 'saga-duck/purify' {
	import { StatelessComponent, ComponentClass } from "react";
	export function shouldComponentUpdate(instance: any, props: any, state: any): boolean;
	export interface PurifyType {
	    <T>(component: StatelessComponent<T>): ComponentClass<T>;
	    <T, C extends ComponentClass<T>>(component: C): C;
	}
	export const purify: PurifyType;

}
declare module 'saga-duck/index' {
	export { default as Duck, memorize } from 'saga-duck/Duck';
	export { default as DuckMap } from 'saga-duck/DuckMap';
	export { default as DuckRuntime, DuckCmpProps, INIT, END } from 'saga-duck/DuckRuntime';
	export { purify, shouldComponentUpdate } from 'saga-duck/purify';
	export { asResult, reduceFromPayload, createToPayload } from 'saga-duck/helper';

}
declare module 'saga-duck' {
	export * from 'saga-duck/index';
}
