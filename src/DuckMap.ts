import Duck, { DuckOptions, STATE_OF_REDUCERS, REDUCER } from "./Duck";
import { combineReducers } from "redux";
import { fork } from "redux-saga/effects";

type DuckType<T extends Duck> = { new (options?: DuckOptions): T };
type DUCKS_STATES<T extends Record<string, Duck>> = {
  [key in keyof T]: T[key]["State"]
};
type DUCKS<T extends Record<string, DuckType<Duck>>> = {
  [key in keyof T]: InstanceType<T[key]>
};
export default class DuckMap extends Duck {
  protected get _cacheGetters() {
    return [...super._cacheGetters, "ducks"];
  }
  get State(): STATE_OF_REDUCERS<this["reducers"]> &
    DUCKS_STATES<this["ducks"]> {
    return null;
  }
  protected getSubDuckOptions(route: string): DuckOptions {
    const { namespace, route: parentRoute } = this.options;
    const parentSelector = this.selector;
    return {
      namespace,
      route: parentRoute ? `${parentRoute}/${route}` : route,
      selector: state => parentSelector(state)[route]
    };
  }
  /**
   * ducks生成工具方法
   * this.makeDucks({foo: Foo}) => {foo: new Foo(...)}
   * @param ducks
   */
  protected makeDucks<T extends Record<string, DuckType<Duck>>>(ducks: T): DUCKS<T> {
    const map = {} as DUCKS<T>;
    for (const route of Object.keys(ducks)) {
      let Duck = ducks[route];
      map[route] = new Duck(this.getSubDuckOptions(route)) as any;
    }
    return map;
  }
  /**
   * **不允许扩展**，请使用`quickDucks`或`rawDucks`来定义
   *
   * 获取子ducks
   * 
   * **Disallow override**, please use `quickDucks` or `rawDucks` to define
   * 
   * Get sub ducks
   * @example
   * ```
*sagaFoo(){
  const { types, ducks } = this
  yield takeLatest(types.FOO, function*(){
    yield* ducks.foo.sagaFoo()
    yield put(ducks.foo.creators.foo(''))
  })
}```
   */
  get ducks(): DUCKS<this["quickDucks"]> & this["rawDucks"] {
    return Object.assign(
      {},
      this.makeDucks(this.quickDucks) as DUCKS<this["quickDucks"]>,
      this.rawDucks
    );
  }
  /**
   * 根据Duck类map快速生成子ducks
   * 
   * Quick declare sub ducks by Duck Class map.
   * @example
   * ```
  get quickDucks() {
    return {
      ...super.quickDucks,
      foo: FooDuck
    };
  }```
   */
  get quickDucks() {
    return {};
  }
  /**
   * 手工生成子duck，它会直接合并到ducks属性上，请注意尽量不要修改内置的duck options
   * 
   * Manually declare sub ducks, it will directly merge to `ducks` property,
   * reminder do not change internal duck options.
   * @example
   * ```
  get rawDucks(){
      return {
          ...super.rawDucks,
          foo: new FooDuck(this.getSubDuckOptions('foo'))
      }
  }```
   */
  get rawDucks() {
    return {};
  }
  get reducer(): REDUCER<this["State"]> {
    const ducksReducers = {};
    for (const key of Object.keys(this.ducks)) {
      ducksReducers[key] = this.ducks[key].reducer;
    }
    return combineReducers({
      ...this.reducers,
      ...ducksReducers
    });
  }
  private *ducksSaga() {
    const { ducks } = this;
    for (const key of Object.keys(ducks)) {
      const duck = ducks[key];
      yield fork([duck, duck.saga]);
    }
  }
  *saga() {
    yield* super.saga();
    yield* this.ducksSaga();
  }
}
