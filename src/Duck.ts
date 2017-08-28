/**
 * 尝试改进Duck
 * @author cluezhang
 */
import {
  combineReducers,
  ActionCreator,
  Reducer,
  ReducersMapObject
} from "redux";
import { SagaIterator } from "redux-saga";

function defaultCreators() {
  return {};
}
function defaultReducer(state) {
  return state;
}
function defaultReducers() {
  return {};
}
function assignDefaults(options) {
  return {
    typeList: [],
    constList: [],
    creators: defaultCreators,
    // initialState: {},
    // reducer: defaultReducer,
    reducers: defaultReducers,
    selectors: {},
    sagas: [],
    ...options
  };
}

let idSeed = 1;
function generateId(prefix = "SAGA-DUCK") {
  return `${prefix}-${idSeed++}`;
}

// export default interface Duck<
//   TState = any,
//   TTypes extends Types = {},
//   TCreators extends Creators = {},
//   TSelectors extends Selectors = {},
//   TMoreOptions = {}
// > {};

type DynamicOption<Result, TDuck extends Duck> = (duck: TDuck) => Result;
type StaticOption<Result> = Result;
export type Option<Result, TDuck extends Duck> =
  | StaticOption<Result>
  | DynamicOption<Result, TDuck>;

export interface Types {
  [key: string]: string | number;
}

type DuckReducer<State, TDuck> = (
  state: State,
  action: any,
  duck: TDuck
) => State;
type DuckSelector<TState = any, TGlobalState = any> = (
  state: TGlobalState
) => TState;

type Saga<TDuck> = (duck: TDuck) => SagaIterator;

interface OptSelectors<State> {
  [key: string]: (state: State) => any;
}

export interface DuckOptions<
  TState = any,
  TTypes = any,
  TCreators = any,
  TSelectors = any,
  TMoreOptions extends object = {}
> {
  /** 
   * 命名空间 
   * @deprecated
   */
  namespace?: string;
  /** store路径，使用DuckMap组合时无需声明 */
  route?: string;
  /**
   * 初始状态，不推荐使用，请直接使用reducer的默认参数
   * @deprecated
   */
  initialState?: Option<
    any,
    Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>
  >;
  /** ActionType字串列表，会自动生成duck.types */
  typeList?: (keyof TTypes)[];
  /** 或者可以简单点？这样就可以用typeof了 TODO  */
  types?: TTypes;
  constList?: string[];
  /** action creators */
  creators?: DynamicOption<
    TCreators,
    Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>
  >;
  /** reducer */
  reducer?: DuckReducer<
    TState,
    Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>
  >;
  /** Reducers */
  reducers?: DynamicOption<
    ReducersMapObject,
    Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>
  >;
  selector?: (globalState: any) => TState;
  selectors?: OptSelectors<TState>;
  sagas?: Saga<Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>>[];
}

export interface Creators {
  [key: string]: (...args: any[]) => any;
}

export interface Selectors {
  [key: string]: (state: any) => any;
}

type CombileOptions<Old, New> = Old & New;

/**
 * 扩展定义 [optionKey, isGetter, isArray]
 */
type ExtendOption = [string, boolean, boolean];

export default class Duck<
  TState = any,
  TTypes = any,
  TCreators = any,
  TSelectors = any,
  TMoreOptions extends object = {}
> {
  id: string;
  options: TMoreOptions & DuckOptions<TState, TTypes, TCreators, TSelectors>;
  private _types: TTypes;
  private _consts: object;
  private _creators: TCreators;
  private _reducers: ReducersMapObject;
  private _reducer: Reducer<TState>;
  private _initialState: TState;
  private _constList: object;
  private _selector: (globalState: any) => TState;
  private _selectors: TSelectors;
  private _sagas: (() => SagaIterator)[];
  /**
   * 
   * @param {*} options 
   *    namespace, route, typeList, constList, 
   *    creators, initialState, reducer, selector, selectors,
   *    sagas
   */
  constructor(
    options?: TMoreOptions &
      DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions>,
    ...extendOptions: (TMoreOptions &
      DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions>)[]
  ) {
    this.id = generateId();
    this.options = {
      namespace: "global",
      route: "",
      ...assignDefaults(options)
    };
    if (extendOptions.length) {
      extendOptions.forEach(options => {
        this.extend(options);
      });
    }
  }
  /** 扩展Duck */
  extend(
    options: TMoreOptions &
      DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions>
  ): void {
    const parent = this.options;
    // options = assignDefaults(options)

    this.options = this.extendOptions(parent, options);
  }
  extendOptions(
    parent: TMoreOptions &
      DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions>,
    child: TMoreOptions &
      DuckOptions<TState, TTypes, TCreators, TSelectors, TMoreOptions>,
    ...extraOptionDefines: Array<ExtendOption>
  ) {
    const options = Object.assign({}, parent, child);
    const defaultOptionDefines: Array<ExtendOption> = [
      // optionKey, isArray, isGetter
      ["constList", true, false],
      ["typeList", true, false],
      ["creators", false, true],
      ["reducers", false, true],
      ["selectors", false, false],
      ["sagas", true, false]
    ];
    defaultOptionDefines
      .concat(extraOptionDefines)
      .forEach(([key, isArray, isGetter]) => {
        const opt = Duck.mergeOption(parent, child, key, isArray, isGetter);
        if (opt) {
          options[key] = opt;
        }
      });
    return options;
  }
  get namespace() {
    return this.options.namespace;
  }
  get route() {
    return this.options.route;
  }
  /** ActionType前缀 */
  get actionTypePrefix(): string {
    const { namespace, route } = this.options;
    return route ? `${namespace}/${route}/` : `${namespace}/`;
  }
  /** ActionType常量Map，根据options.types或typeList生成 */
  get types(): TTypes {
    if (this._types) {
      return this._types;
    }
    const { types, typeList = [] } = this.options;
    const prefix = this.actionTypePrefix;
    let finalTypeList: string[] = typeList;
    const finalTypes = {};
    if (types) {
      finalTypeList = Object.keys(types);
    }
    finalTypeList.forEach(type => {
      finalTypes[type as string] = prefix + type;
    });
    return (this._types = finalTypes as TTypes);
  }

  /** 其它常量定义 */
  get consts() {
    if (this._consts) {
      return this._consts;
    }
    const { constList = [] } = this.options;
    const consts = {};
    constList.forEach(word => {
      consts[word] = word;
    });
    return (this._consts = consts);
  }
  /** creators生成 */
  get creators(): TCreators {
    if (this._creators) {
      return this._creators;
    }
    const { creators = () => ({} as TCreators) } = this.options;
    return (this._creators = creators(this));
  }
  get initialState(): TState {
    if (this._initialState) {
      return this._initialState;
    }
    const { initialState } = this.options;
    return (this._initialState =
      typeof initialState === "function" ? initialState() : initialState);
  }
  /** root reducer，自动带上Duck作为第3个参数，或从reducers生成，自动带上Duck作为第1个参数 */
  get reducer(): DuckReducer<TState, this> {
    if (this._reducer) {
      return this._reducer;
    }
    const reducers = this.reducers;
    const reducerList = [];
    if (Object.keys(reducers).length > 0) {
      reducerList.push(combineReducers(this.reducers));
    }
    const { reducer } = this.options;
    if (reducer) {
      reducerList.push((state = this.initialState, action) => {
        return reducer(state, action, this);
      });
    }
    return (this._reducer = Duck.mergeReducers(...reducerList));
  }
  get reducers(): ReducersMapObject {
    const { reducers } = this.options;
    return reducers(this);
  }
  /** 根选择器，根据options.selector与options.route共同生成 */
  get selector(): DuckSelector<TState> {
    if (this._selector) {
      return this._selector;
    }
    const { route, selector } = this.options;
    return (this._selector =
      selector || (route && (state => state[route])) || (state => state));
  }
  /** selectors生成，会自动以根selector包装 TODO 或可考虑与selector合并，既是方法 */
  get selectors(): TSelectors {
    if (this._selectors) {
      return this._selectors;
    }
    const { selectors = {} } = this.options;
    const rootSelector = this.selector;
    const interceptedSelectors = {};
    Object.keys(selectors).forEach(key => {
      interceptedSelectors[key] = function(state) {
        return selectors[key].call(selectors, rootSelector(state));
      };
    });
    return (this._selectors = <TSelectors>interceptedSelectors);
  }
  /** selectors without root selector wrap, only use for local state */
  get localSelectors(): OptSelectors<TState> {
    return this.options.selectors || {};
  }
  /** saga列表，自动包装duck作为第一个参数 */
  get sagas(): (() => SagaIterator)[] {
    if (this._sagas) {
      return this._sagas;
    }
    const { sagas = [] } = this.options;
    return (this._sagas = sagas.map(
      saga =>
        function() {
          return saga(this);
        }
    ));
  }
  static mergeStates(oldState, states) {
    const newState = { ...oldState };
    let hasChanged = false;
    states.forEach(myState => {
      if (myState !== oldState) {
        hasChanged = true;
        Object.assign(newState, myState);
      }
    });
    return hasChanged ? newState : oldState;
  }
  /** 不同于redux的combineReducers，它是直接合并（即不在属性上独立） */
  static mergeReducers(...reducers) {
    if (!reducers.length) {
      return defaultReducer;
    }
    if (reducers.length === 1) {
      return reducers[0];
    }
    return (state, action, ...extras) => {
      return Duck.mergeStates(
        state,
        reducers.map(reducer => reducer(state, action, ...extras))
      );
    };
  }
  /** 继承、合并配置 */
  static mergeOption(parent, child, key, isArray, isGetter) {
    if (!(key in child) || !(key in parent)) {
      return null;
    }
    const a = parent[key];
    const b = child[key];
    if (isGetter) {
      const isFnA = typeof a === "function";
      const isFnB = typeof b === "function";
      return duck => {
        const av = isFnA ? a(duck) : a;
        const bv = isFnB ? b(duck) : b;
        return isArray ? [...av, ...bv] : { ...av, ...bv };
      };
    }
    return isArray ? [...a, ...b] : { ...a, ...b };
  }
  /**
   * Memorize function result, for React Performance optimize
   * **MENTION** Should ONLY used to cache data associate with duck and dispatch, and duck MUST be stateless.
   * 
   * 缓存与duck及dispatch关联的数据生成，使得每次输出都是一致的，方便React性能优化。
   * **注意** 仅能用于只和duck与dispatch有关的数据生成，并且duck必须是无状态的（即不可变的）
   * 
   * @param {*} fn (duck, dispatch, {refs}) => any
   * @return {Function} memorizedFn (duckComponent | props) => cache
   */
  static memorize(fn) {
    const cacheKey = "_sagaDuckMemorized";
    const idKey = "_sagaDuckUniqId";
    const fnId = fn[idKey] || (fn[idKey] = generateId("MEMORIZE-FN"));
    return function memorizedFn(duckComponent) {
      let cacheHost;
      let props;
      if (duckComponent.isReactComponent && duckComponent.props) {
        props = duckComponent.props;
      } else {
        props = duckComponent;
        duckComponent = null;
      }
      const { duck, dispatch } = props;
      cacheHost = duckComponent || duck;

      const cache = cacheHost[cacheKey] || (cacheHost[cacheKey] = {});
      if (!dispatch[idKey]) {
        dispatch[idKey] = generateId("DISPATCH");
      }
      const key = duck.id + ":" + dispatch[idKey] + ":" + fnId;
      if (!(key in cache)) {
        cache[key] = fn(duck, dispatch);
      }
      return cache[key];
    };
  }
}

export const memorize = Duck.memorize;
