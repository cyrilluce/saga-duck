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

/**
 * 动态配置（函数式），传入当前Duck实例，返回最终的配置。
 */
export type DynamicOption<Result, TDuck> = (duck: TDuck) => Result;
/**
 * 静态配置，直接就是最终值。
 */
export type StaticOption<Result> = Result;
/**
 * 配置兼容动态及静态。
 */
export type Option<Result, TDuck> =
  | StaticOption<Result>
  | DynamicOption<Result, TDuck>;

/**
 * 最终types会转换为MAP，值并不需要关注，Duck自动添加前缀保证Duck间隔离。
 */
export type TYPES<T> = { readonly [P in keyof T]: string };

/**
 * Duck的根reducer，通常用reducers替代
 */
export type DuckReducer<TState, TDuck> = (
  state: TState,
  action: any,
  duck: TDuck
) => TState;
/**
 * Duck的根选择器
 */
export type DuckSelector<TState, TGlobalState = any> = (
  state: TGlobalState
) => TState;
/**
 * Duck关联的Saga逻辑
 */
export type Saga<TDuck> = (duck: TDuck) => any;

/**
 * 本地选择器定义
 */
export type SELECTORS<T, TState> = { [P in keyof T]: (state: TState) => T[P] };
/**
 * 已包装的全局选择器定义，直接用于全局redux store state
 */
export type WRAPPED_SELECTORS<T> = {
  [P in keyof T]: (globalState: any) => T[P]
};

/**
 * Reducers定义
 */
export type REDUCERS<TState> = {
  [key in keyof TState]: (state: TState[key], action: any) => TState[key]
};

/**
 * Duck的构造参数
 */
export interface DuckOptions<TDuck, TState, TTypes, TCreators, TSelectors> {
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
  initialState?: Option<TState, TDuck>;
  /** ActionType字串列表，会自动生成duck.types，如果用typescript，建议用types配置，配合enum使用 */
  typeList?: (keyof TTypes)[];
  /** ActionType映射，注意最终ActionType的值并不是定义时候的值（会加前缀），如果用typescript，建议用enum  */
  types?: TTypes;
  /**
   * 常量定义，不常用
   * @deprecated
   */
  constList?: string[];
  /** action creator MAP映射 */
  creators?: DynamicOption<Partial<TCreators>, TDuck>;
  /** 根reducer */
  reducer?: DuckReducer<TState, TDuck>;
  /** Reducers MAP映射 */
  reducers?: DynamicOption<Partial<REDUCERS<TState>>, TDuck>;
  selector?: (globalState: any) => TState;
  selectors?: SELECTORS<Partial<TSelectors>, TState>;
  sagas?: Saga<TDuck>[];
}

/**
 * 扩展定义 [optionKey, isGetter, isArray]
 */
export type ExtendOption = [string, boolean, boolean];

export default class Duck<
  TState = any,
  TTypes = any,
  TCreators = any,
  TSelectors = any,
  TMoreOptions = {}
> {
  protected id: string;
  options: TMoreOptions &
    DuckOptions<this, TState, TTypes, TCreators, TSelectors>;
  private _types: TYPES<TTypes>;
  private _consts: object;
  private _creators: TCreators;
  private _reducers: REDUCERS<TState>;
  private _reducer: Reducer<TState>;
  private _initialState: TState;
  private _constList: object;
  private _selector: (globalState: any) => TState;
  private _selectors: WRAPPED_SELECTORS<TSelectors>;
  private _sagas: (() => any)[];
  /**
   * 
   * @param {*} options 
   *    namespace, route, typeList, constList, 
   *    creators, initialState, reducer, selector, selectors,
   *    sagas
   */
  constructor(
    options?: TMoreOptions &
      DuckOptions<
        Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>,
        TState,
        TTypes,
        TCreators,
        TSelectors
      >,
    ...extendOptions: (TMoreOptions &
      DuckOptions<
        Duck<TState, TTypes, TCreators, TSelectors, TMoreOptions>,
        TState,
        TTypes,
        TCreators,
        TSelectors
      >)[]
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
  protected extend(
    options: TMoreOptions &
      DuckOptions<this, TState, TTypes, TCreators, TSelectors>
  ): void {
    const parent = this.options;
    // options = assignDefaults(options)

    this.options = this.extendOptions(parent, options);
  }
  protected extendOptions(
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
  protected get actionTypePrefix(): string {
    const { namespace, route } = this.options;
    return route ? `${namespace}/${route}/` : `${namespace}/`;
  }
  /** ActionType常量Map，根据options.types或typeList生成 */
  get types(): TYPES<TTypes> {
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
    return (this._types = finalTypes as TYPES<TTypes>);
  }

  /** 其它常量定义 @deprecated */
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
    const { creators = () => ({}) } = this.options;
    return (this._creators = <TCreators>creators(this));
  }
  /** initialState已经建议在reducer/reducers中实现，此属性不推荐使用 @deprecated */
  get initialState(): TState {
    if (this._initialState) {
      return this._initialState;
    }
    const { initialState } = this.options;
    return (this._initialState =
      typeof initialState === "function" ? initialState(this) : initialState);
  }
  /** root reducer，自动带上Duck作为第3个参数，或从reducers生成，自动带上Duck作为第1个参数 */
  get reducer(): Reducer<TState> {
    if (this._reducer) {
      return this._reducer;
    }
    const reducers = this.reducers;
    const reducerList = [];
    if (Object.keys(reducers).length > 0) {
      // 这里强制转ReducersMapObject有问题，比较奇怪，只能用any将就一下
      reducerList.push(combineReducers(this.reducers as any));
    }
    const { reducer } = this.options;
    if (reducer) {
      reducerList.push((state = this.initialState, action) => {
        return reducer(state, action, this);
      });
    }
    return (this._reducer = Duck.mergeReducers(...reducerList));
  }
  get reducers(): REDUCERS<TState> {
    const { reducers } = this.options;
    return reducers(this) as REDUCERS<TState>;
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
  get selectors(): WRAPPED_SELECTORS<TSelectors> {
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
    return (this._selectors = <WRAPPED_SELECTORS<
      TSelectors
    >>interceptedSelectors);
  }
  /** selectors without root selector wrap, only use for local state */
  get localSelectors(): SELECTORS<TSelectors, TState> {
    return this.options.selectors;
  }
  /** saga列表，自动包装duck作为第一个参数 */
  get sagas(): (() => any)[] {
    if (this._sagas) {
      return this._sagas;
    }
    const { sagas = [] } = this.options;
    return (this._sagas = sagas.map(saga => () => saga(this)));
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
