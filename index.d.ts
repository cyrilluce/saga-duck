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
	export function memorize<T>(fn: (duck: any, dispatch: any) => T): (reactInstanceOrProps: any) => T;
	export function generateId(prefix?: string): string;

}
declare module 'saga-duck/BaseDuck' {
	import { memorize } from 'saga-duck/helper'; type GLOBAL_SELECTOR<T> = T extends (state: any, ...rest: infer U) => infer K ? (globalState: any, ...rest: U) => K : never; type GLOBAL_SELECTORS<T> = {
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
	export default abstract class BaseDuck {
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
	    abstract readonly reducer: any;
	    readonly State: ReturnType<this["reducer"]>;
	    readonly selector: (globalState: any) => this["State"];
	    readonly selectors: GLOBAL_SELECTORS<this["rawSelectors"]>;
	    readonly rawSelectors: {};
	    readonly localSelectors: this["rawSelectors"];
	    readonly creators: {};
	    saga(): IterableIterator<any>;
	    readonly sagas: any[];
	    static memorize: typeof memorize;
	}
	export {};

}
declare module 'saga-duck/Duck' {
	import BaseDuck from 'saga-duck/BaseDuck';
	export type COMBINE_REDUCERS<T extends {
	    [key: string]: () => any;
	}> = (state: STATE_OF_REDUCERS<T>, action: any) => STATE_OF_REDUCERS<T>; type STATE_OF_REDUCERS<REDUCERS extends {
	    [key: string]: () => any;
	}> = {
	    [key in keyof REDUCERS]: ReturnType<REDUCERS[key]>;
	};
	export default class Duck extends BaseDuck {
	    readonly reducers: {};
	    readonly reducer: COMBINE_REDUCERS<this['reducers']>;
	}
	export {};

}
declare module 'saga-duck/ComposableDuck' {
	import { DuckOptions } from 'saga-duck/BaseDuck';
	import Duck, { COMBINE_REDUCERS } from 'saga-duck/Duck'; type DuckType<T extends Duck> = {
	    new (options?: DuckOptions): T;
	}; type DUCKS_REDUCERS<T extends Record<string, Duck>> = {
	    [key in keyof T]: T[key]["reducer"];
	}; type DUCKS<T extends Record<string, DuckType<Duck>>> = {
	    [key in keyof T]: InstanceType<T[key]>;
	};
	export default class ComposableDuck extends Duck {
	    protected readonly _cacheGetters: string[];
	    protected getSubDuckOptions(route: string): DuckOptions;
	    protected makeDucks<T extends Record<string, DuckType<Duck>>>(ducks: T): DUCKS<T>;
	    readonly ducks: DUCKS<this["quickDucks"]> & this["rawDucks"];
	    readonly quickDucks: {};
	    readonly rawDucks: {};
	    readonly reducer: COMBINE_REDUCERS<this["reducers"] & DUCKS_REDUCERS<this["ducks"]>>;
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
	    private enhancers;
	    private middlewares;
	    private sagaMiddleware;
	    store: any;
	    private _tasks;
	    constructor(duck: any, middlewares?: any[], enhancers?: any[]);
	    _initStore(): void;
	    addSaga(sagas: Array<() => SagaIterator>): Task;
	    destroy(): void;
	    connect(): (Container: any) => any;
	    root(autoDestroy?: boolean): (Container: any) => any;
	    connectRoot(): (Container: any) => any;
	}

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
	export { default as BaseDuck, DuckOptions } from 'saga-duck/BaseDuck';
	export { default as Duck } from 'saga-duck/Duck';
	export { default as ComposableDuck, default as DuckMap } from 'saga-duck/ComposableDuck';
	export { default as DuckRuntime, DuckCmpProps, INIT, END } from 'saga-duck/DuckRuntime';
	export { purify, shouldComponentUpdate } from 'saga-duck/purify';
	export { asResult, reduceFromPayload, createToPayload, memorize } from 'saga-duck/helper';

}
declare module 'saga-duck' {
	export * from 'saga-duck/index';
}
