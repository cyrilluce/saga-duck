declare module 'saga-duck/Duck' {
	import { Reducer } from "redux";
	import { SagaIterator } from "redux-saga";
	export type DynamicOption<Result, TDuck> = (duck: TDuck) => Result;
	export type StaticOption<Result> = Result;
	export type Option<Result, TDuck> = StaticOption<Result> | DynamicOption<Result, TDuck>;
	export type TYPES<T> = {
	    readonly [P in keyof T]: string;
	};
	export type DuckReducer<TState, TDuck> = (state: TState, action: any, duck: TDuck) => TState;
	export type DuckSelector<TState, TGlobalState = any> = (state: TGlobalState) => TState;
	export type Saga<TDuck> = (duck: TDuck) => SagaIterator;
	export type SELECTORS<T, TState> = {
	    [P in keyof T]: (state: TState) => T[P];
	};
	export type WRAPPED_SELECTORS<T> = {
	    [P in keyof T]: (globalState: any) => T[P];
	};
	export type REDUCERS<TState> = {
	    [key in keyof TState]: Reducer<TState[key]>;
	};
	export interface DuckOptions<TDuck, TState, TTypes, TCreators, TSelectors> {
	    namespace?: string;
	    route?: string;
	    initialState?: Option<TState, TDuck>;
	    typeList?: (keyof TTypes)[];
	    types?: TTypes;
	    constList?: string[];
	    creators?: DynamicOption<Partial<TCreators>, TDuck>;
	    reducer?: DuckReducer<TState, TDuck>;
	    reducers?: DynamicOption<Partial<REDUCERS<TState>>, TDuck>;
	    selector?: (globalState: any) => TState;
	    selectors?: SELECTORS<Partial<TSelectors>, TState>;
	    sagas?: Saga<TDuck>[];
	}
	export type ExtendOption = [string, boolean, boolean];
	export default class Duck<TState = any, TTypes = any, TCreators = any, TSelectors = any, TMoreOptions = {}> {
	    protected id: string;
	    options: TMoreOptions & DuckOptions<this, TState, TTypes, TCreators, TSelectors>;
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
	    constructor(options?: TMoreOptions & DuckOptions<Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>, TState, TTypes, TCreators, TSelectors>, ...extendOptions: (TMoreOptions & DuckOptions<Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>, TState, TTypes, TCreators, TSelectors>)[]);
	    protected extend(options: TMoreOptions & DuckOptions<this, TState, TTypes, TCreators, TSelectors>): void;
	    protected extendOptions(parent: TMoreOptions & DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions>, child: TMoreOptions & DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions>, ...extraOptionDefines: Array<ExtendOption>): TMoreOptions & DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions>;
	    readonly namespace: string;
	    readonly route: string;
	    protected readonly actionTypePrefix: string;
	    readonly types: TYPES<TTypes>;
	    readonly consts: object;
	    readonly creators: TCreators;
	    readonly initialState: TState;
	    readonly reducer: Reducer<TState>;
	    readonly reducers: REDUCERS<TState>;
	    readonly selector: DuckSelector<TState>;
	    readonly selectors: WRAPPED_SELECTORS<TSelectors>;
	    readonly localSelectors: SELECTORS<TSelectors, TState>;
	    readonly sagas: (() => SagaIterator)[];
	    static mergeStates(oldState: any, states: any): any;
	    static mergeReducers(...reducers: any[]): any;
	    static mergeOption(parent: any, child: any, key: any, isArray: any, isGetter: any): any;
	    static memorize(fn: any): (duckComponent: any) => any;
	}
	export const memorize: typeof Duck.memorize;

}
declare module 'saga-duck/DuckComponent' {
	/// <reference types="react" />
	import { ComponentClass, StatelessComponent } from "react";
	import { Dispatch } from "redux";
	import Duck from 'saga-duck/Duck';
	export interface DuckComponentProps<T extends Duck = Duck<any>, State = any> {
	    duck: T;
	    store: State;
	    dispatch: Dispatch<any>;
	}
	export type DuckStatelessComponent<Props = any, T extends Duck = Duck<any>, State = any> = StatelessComponent<Props & DuckComponentProps<T, State>>;
	export type DuckComponentClass<Props = any, T extends Duck = Duck<any>, State = any> = ComponentClass<Props & DuckComponentProps<T, State>>;
	export type DuckComponent<Props = any, T extends Duck = Duck<any>, State = any> = DuckStatelessComponent<Props, T, State> | DuckComponentClass<Props, T, State>;

}
declare module 'saga-duck/DuckMap' {
	import Duck, { DuckOptions } from 'saga-duck/Duck';
	import { Action } from "redux";
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
	    [key in keyof TDucks]: DUCK_OPTION<new () => TDucks[key]>;
	};
	export default class DuckMap<TState = any, TTypes = any, TCreators = any, TSelectors = any, TMoreOptions = {}, TDucks = {}> extends Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions & {
	    ducks?: DUCKS_OPTIONS<TDucks>;
	}> {
	    private _ducks;
	    private _mapSagas;
	    protected extendOptions(opt1: any, opt2: any, ...externals: any[]): TMoreOptions & {
	        ducks?: DUCKS_OPTIONS<TDucks>;
	    } & DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions & {
	        ducks?: DUCKS_OPTIONS<TDucks>;
	    }>;
	    readonly ducks: TDucks;
	    protected eachDucks(callback: any): void;
	    readonly reducers: {
	        [key in keyof TState]: <A extends Action>(state: TState[key], action: A) => TState[key];
	    };
	    readonly sagas: any[];
	}

}
declare module 'saga-duck/DuckRuntime' {
	/// <reference types="react" />
	import { ComponentClass } from "react";
	import { Store } from "redux";
	import { SagaIterator } from "redux-saga";
	import Duck from 'saga-duck/Duck';
	import { DuckComponent } from 'saga-duck/DuckComponent';
	export const INIT = "@@duck-runtime-init";
	export const END = "@@duck-runtime-end";
	export default class DuckRuntime<TState = any> {
	    duck: Duck<TState>;
	    private middlewares;
	    private sagaMiddleware;
	    store: Store<TState>;
	    constructor(duck: any, ...middlewares: any[]);
	    _initStore(): void;
	    addSaga(sagas: Array<() => SagaIterator>): void;
	    connect(): (Container: DuckComponent<any, Duck<any, any, any, any, {}>, any>) => ComponentClass<Pick<any, any>>;
	    root(): (Container: any) => ComponentClass<{}>;
	    connectRoot(): (Container: any) => ComponentClass<Pick<any, any>>;
	}

}
declare module 'saga-duck/purify' {
	/// <reference types="react" />
	import { ComponentType, ComponentClass } from "react";
	export function shouldComponentUpdate(instance: any, props: any, state: any): boolean;
	export function purify(component: ComponentType): ComponentClass;

}
declare module 'saga-duck/index' {
	export { default as Duck, memorize } from 'saga-duck/Duck';
	export { default as DuckMap } from 'saga-duck/DuckMap';
	export { default as DuckRuntime, INIT, END } from 'saga-duck/DuckRuntime';
	export { DuckComponent } from 'saga-duck/DuckComponent';
	export { purify, shouldComponentUpdate } from 'saga-duck/purify';

}
declare module 'saga-duck' {
	}
