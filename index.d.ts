declare module 'saga-duck/Duck' {
	export type DynamicOption<Result, TDuck> = (duck: TDuck) => Result;
	export type StaticOption<Result> = Result;
	export type Option<Result, TDuck> = StaticOption<Result> | DynamicOption<Result, TDuck>;
	export type TYPES<T> = {
	    readonly [P in keyof T]: string;
	};
	export type DuckReducer<TState, TDuck> = (state: TState, action: any, duck: TDuck) => TState;
	export type DuckSelector<TState, TGlobalState = any> = (state: TGlobalState) => TState;
	export type Saga<TDuck> = (duck: TDuck) => any;
	export type SELECTORS<T, TState> = {
	    [P in keyof T]: (state: TState) => T[P];
	};
	export type WRAPPED_SELECTORS<T> = {
	    [P in keyof T]: (globalState: any) => T[P];
	};
	export type REDUCERS<TState> = {
	    [key in keyof TState]: (state: TState[key], action: any) => TState[key];
	};
	export type REDUCER<TState> = (state: TState, action: any) => TState;
	export interface DuckOptions<TDuck, TState, TTypes, TCreators, TSelectors> {
	    namespace?: string;
	    route?: string;
	    initialState?: Option<TState, TDuck>;
	    typeList?: (keyof TTypes)[];
	    types?: Partial<TTypes>;
	    constList?: string[];
	    creators?: DynamicOption<Partial<TCreators>, TDuck>;
	    reducer?: DuckReducer<Partial<TState>, TDuck>;
	    reducers?: DynamicOption<Partial<REDUCERS<TState>>, TDuck>;
	    selector?: (globalState: any) => TState;
	    selectors?: SELECTORS<Partial<TSelectors>, TState>;
	    sagas?: Saga<TDuck>[];
	}
	export type ExtendOption = [string, boolean, boolean];
	export default class Duck<TState = any, TTypes = any, TCreators = any, TSelectors = any, TMoreOptions = {}> {
	    protected id: string;
	    options: Partial<TMoreOptions> & DuckOptions<this, TState, TTypes, TCreators, TSelectors>;
	    private _types;
	    private _consts;
	    private _creators;
	    private _reducers;
	    private _reducer;
	    private _initialState;
	    private _constList;
	    private _selector;
	    private _selectors;
	    private _sagas;
	    constructor(...extendOptions: (Partial<TMoreOptions> & DuckOptions<Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>, TState, TTypes, TCreators, TSelectors>)[]);
	    protected init(): void;
	    protected extend(options: Partial<TMoreOptions> & DuckOptions<this, TState, TTypes, TCreators, TSelectors>): void;
	    protected extendOptions(parent: Partial<TMoreOptions> & DuckOptions<this, TState, TTypes, TCreators, TSelectors>, child: Partial<TMoreOptions> & DuckOptions<this, TState, TTypes, TCreators, TSelectors>, ...extraOptionDefines: Array<ExtendOption>): Partial<TMoreOptions> & DuckOptions<this, TState, TTypes, TCreators, TSelectors>;
	    readonly namespace: string;
	    readonly route: string;
	    protected readonly actionTypePrefix: string;
	    readonly types: TYPES<TTypes>;
	    readonly consts: object;
	    readonly creators: TCreators;
	    readonly initialState: TState;
	    readonly reducer: REDUCER<TState>;
	    readonly reducers: REDUCERS<TState>;
	    readonly selector: DuckSelector<TState>;
	    readonly selectors: WRAPPED_SELECTORS<TSelectors>;
	    readonly localSelectors: SELECTORS<TSelectors, TState>;
	    readonly sagas: (() => any)[];
	    asState(state: any): TState;
	    static mergeStates(oldState: any, states: any): any;
	    static mergeReducers(...reducers: any[]): any;
	    static mergeOption(parent: any, child: any, key: any, isArray: any, isGetter: any): any;
	    static memorize<T>(fn: (duck: any, dispatch: any) => T): (reactInstanceOrProps: any) => T;
	}
	export const memorize: typeof Duck.memorize;

}
declare module 'saga-duck/DuckMap' {
	import Duck, { DuckOptions } from 'saga-duck/Duck';
	export type ChildDuck = {
	    new (...any: any[]): Duck;
	};
	export type DIRECTLY_DUCK<TDuckClass> = TDuckClass;
	export type PARAM_STRING = string;
	export type PARAM_MAP = {
	    [key: string]: string;
	};
	export type PARAM_GETTER = (opts: any, duck: any) => Object;
	export type PARAM = PARAM_STRING | PARAM_MAP | PARAM_GETTER;
	export type PARAM_LIST_DUCK<TDuckClass> = [TDuckClass, PARAM] | [TDuckClass, PARAM, PARAM] | [TDuckClass, PARAM, PARAM, PARAM] | [TDuckClass, PARAM, PARAM, PARAM, PARAM] | [TDuckClass, PARAM, PARAM, PARAM, PARAM, PARAM] | [TDuckClass, PARAM, PARAM, PARAM, PARAM, PARAM, PARAM];
	export type DUCK_OPTION<TDuckClass> = DIRECTLY_DUCK<TDuckClass> | PARAM_LIST_DUCK<TDuckClass>;
	export type DUCKS_OPTIONS<TDucks> = {
	    [key in keyof TDucks]?: DUCK_OPTION<new (...opts: any[]) => TDucks[key]>;
	};
	export type MEMBER_OF<TObject extends Object, TKey extends keyof TObject> = TObject[TKey];
	export type DUCKS_STATE<TDucks extends Object> = {
	    [key in keyof TDucks]?: MEMBER_OF<TDucks[key], 'initialState'>;
	};
	export default class DuckMap<TState = any, TTypes = any, TCreators = any, TSelectors = any, TMoreOptions = {}, TDucks = {}> extends Duck<TState & DUCKS_STATE<TDucks>, TTypes, TCreators, TSelectors, TMoreOptions & {
	    ducks?: DUCKS_OPTIONS<TDucks>;
	}> {
	    private _ducks;
	    private _mapSagas;
	    protected extendOptions(opt1: any, opt2: any, ...externals: any[]): Partial<TMoreOptions & {
	        ducks?: DUCKS_OPTIONS<TDucks>;
	    }> & DuckOptions<this, TState & DUCKS_STATE<TDucks>, TTypes, TCreators, TSelectors>;
	    readonly ducks: TDucks;
	    protected eachDucks(callback: any): void;
	    readonly reducers: {
	        [key in keyof (TState & DUCKS_STATE<TDucks>)]: (state: (TState & DUCKS_STATE<TDucks>)[key], action: any) => (TState & DUCKS_STATE<TDucks>)[key];
	    };
	    readonly sagas: any[];
	}

}
declare module 'saga-duck/DuckRuntime' {
	import { SagaIterator } from "redux-saga";
	import Duck from 'saga-duck/Duck';
	export const INIT = "@@duck-runtime-init";
	export const END = "@@duck-runtime-end";
	export interface DuckCmpProps<T = any> {
	    duck: T;
	    store: any;
	    dispatch: (action: any) => any;
	}
	export default class DuckRuntime<TState = any> {
	    duck: Duck<TState>;
	    private middlewares;
	    private sagaMiddleware;
	    store: any;
	    constructor(duck: any, ...middlewares: any[]);
	    _initStore(): void;
	    addSaga(sagas: Array<() => SagaIterator>): void;
	    connect(): (Container: any) => any;
	    root(): (Container: any) => any;
	    connectRoot(): (Container: any) => any;
	}

}
declare module 'saga-duck/purify' {
	export function shouldComponentUpdate(instance: any, props: any, state: any): boolean;
	export function purify(component: any): any;

}
declare module 'saga-duck/index' {
	export { default as Duck, memorize } from 'saga-duck/Duck';
	export { default as DuckMap } from 'saga-duck/DuckMap';
	export { default as DuckRuntime, DuckCmpProps, INIT, END } from 'saga-duck/DuckRuntime';
	export { purify, shouldComponentUpdate } from 'saga-duck/purify';

}
declare module 'saga-duck' {
	import main = require('saga-duck/index');
	export = main;
}