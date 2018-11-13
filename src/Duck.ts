/**
 * saga-duck TS3.0+
 * @author cluezhang
 */
import { combineReducers } from "redux";
export type STATE_OF_REDUCERS<REDUCERS extends { [key: string]: () => any }> = {
  [key in keyof REDUCERS]: ReturnType<REDUCERS[key]>
};
export type REDUCER<TState> = (state: TState, action: any) => TState;
type GLOBAL_SELECTOR<T> = T extends (state: any, ...rest: infer U) => infer K
  ? (globalState: any, ...rest: U) => K
  : never;
type GLOBAL_SELECTORS<T> = { [key in keyof T]: GLOBAL_SELECTOR<T[key]> };
type RAW_SELECTORS<TState> = {
  [key: string]: (state: TState, ...rest: any[]) => any;
};
export interface DuckOptions {
  namespace: string;
  selector(globalState: any): any;
  route: string;
}
const defaultDuckOptions: DuckOptions = {
  namespace: "global",
  selector(a) {
    return a;
  },
  route: ""
};
export type TYPES<T> = { readonly [P in keyof T]: string };
let idSeed = 1;
function generateId(prefix = "SAGA-DUCK") {
  return `${prefix}-${idSeed++}`;
}

export default class Duck {
  protected id: string = generateId();

  /** 内部属性，ActionType前缀 */
  protected get actionTypePrefix(): string {
    const { namespace, route } = this.options;
    return route ? `${namespace}/${route}/` : `${namespace}/`;
  }
  // TODO creators、
  // get __cacheGetters(){
  //   return ['types']
  // }
  constructor(protected options: DuckOptions = defaultDuckOptions) {
    // const prototype = Object.getPrototypeOf(this)
    // for(const property of this.__cacheGetters){
    //   let cache: any
    //   Object.defineProperty(this, property, {
    //     get(){
    //       if(!cache){
    //         cache = prototype[property]
    //       }
    //     }
    //   })
    // }
  }
  // ------------------------ types --------------------
  /**
   * **不允许扩展**
   * 获取当前Duck的actionTypes，它从rawTypes生成，自动添加namespace及route前缀，避免不同duck实例的冲突。
   */
  @once
  get types(): TYPES<this["rawTypes"]> {
    return this.makeTypes(this.rawTypes) as TYPES<this["rawTypes"]>;
  }
  /**
   * 生成types工具方法，快速从enum转换
   * ```
get types(){
  enum Types{FOO}
  return {
    ...super.types,
    ...this.makeTypes(Types)
  }
}```
     * @param typeEnum 
     */
  makeTypes<T>(typeEnum: T): TYPES<T> {
    const prefix = this.actionTypePrefix;
    let typeList: string[] = Object.keys(typeEnum);
    const types = {} as TYPES<T>;
    if (typeEnum) {
      typeList = typeList.concat(Object.keys(typeEnum));
    }
    typeList.forEach(type => {
      types[type as string] = prefix + type;
    });
    return types;
  }

  /**
   * 声明Duck的ActionType Map
   */
  get rawTypes() {
    return {};
  }
  // ----------------------- reducers -----------------------
  /**
   * 定义reducers，Duck的state类型也从它自动生成
   */
  @once
  get reducers() {
    return {};
  }
  /** 内部属性，仅供Redux store使用 */
  get reducer(): REDUCER<this["State"]> {
    return combineReducers(this.reducers);
  }
  /** 内部属性，仅用于获取State类型（Duck['State']），不允许扩展 */
  get State(): STATE_OF_REDUCERS<this["reducers"]> {
    return null;
  }
  // ----------------------- selector/selectors ---------------------
  /** 获取当前duck对应的state，不允许扩展 */
  get selector(): (globalState: any) => this["State"] {
    return this.options.selector;
  }
  /** 获取当前duck对应的selectors，从rawSelectors生成，不允许扩展 */
  @once
  get selectors(): GLOBAL_SELECTORS<this["rawSelectors"]> {
    const { selector, rawSelectors } = this;
    const selectors = {} as GLOBAL_SELECTORS<this["rawSelectors"]>;
    for (const key of Object.keys(rawSelectors)) {
      selectors[key] = (globalState, ...rest) =>
        rawSelectors[key](selector(globalState), ...rest);
    }
    return selectors;
  }
  /** 定义Duck内部selectors */
  // TODO 如何让入参直接有类型？
  get rawSelectors() {
    return {};
  }
  /** 兼容  */
  get localSelectors(): this["rawSelectors"] {
    return this.rawSelectors;
  }
  // ---------------------- creators ------------------
  @once
  get creators(): this["rawCreators"] {
    return this.rawCreators;
  }
  /** 定义actionCreators */
  get rawCreators() {
    return {};
  }
  // ----------------------- saga ---------------------
  /**
   * saga主逻辑入口，请注意使用 `yield* super.saga()` 来继承
   */
  *saga() {}
  /** 兼容 */
  get sagas() {
    return [this.saga.bind(this)];
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
  static memorize<T>(
    fn: (duck: any, dispatch: any) => T
  ): (reactInstanceOrProps: any) => T {
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

/** 缓存getter属性 */
export function once(
  target,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  if (propertyKey && descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
  }
  const cacheKey = `_once_cache_${propertyKey}`;
  const originalFn = descriptor.get;
  descriptor.get = function() {
    if (!this[cacheKey]) {
      this[cacheKey] = originalFn.call(this);
    }
    return this[cacheKey];
  };
  return descriptor;
}
