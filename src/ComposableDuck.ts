import BaseDuck, { DuckOptions } from "./BaseDuck";
import Duck, { COMBINE_REDUCERS } from "./Duck";
import { CombinedState, combineReducers, Reducer, StateFromReducersMapObject } from "redux";
import { fork } from "redux-saga/effects";
import { parallel } from "redux-saga-catch";

type DuckType<T extends BaseDuck> = { new (options?: DuckOptions): T };
type DUCKS_REDUCERS<T extends Record<string, BaseDuck>> = {
  [key in keyof T]: T[key] extends BaseDuck ? T[key]["reducer"] : never;
};
type DUCKS<T extends Record<string, DuckType<BaseDuck>>> = {
  [key in keyof T]: InstanceType<T[key]>;
};
/**
 * 支持组合多个子Duck（`ducks`）的Duck，同时它自身也支持`reducers`，
 * 但需注意相同`route`下，`ducks`会覆盖`reducers`的状态
 *
 * Duck support compose multi sub duck(`ducks`), also support `reducers`,
 * but reminder with same `route`, `ducks` will override `reducers`'s state.
 */
export default class ComposableDuck extends Duck {
  protected get _disallowInheritGetters() {
    return [...super._disallowInheritGetters, "ducks"];
  }
  protected get _cacheGetters() {
    return [...super._cacheGetters, "ducks"];
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
  protected makeDucks<T extends Record<string, DuckType<BaseDuck>>>(
    ducks: T
  ): DUCKS<T> {
    const map = {} as DUCKS<T>;
    for (const route of Object.keys(ducks)) {
      let Duck = ducks[route];
      map[route as keyof T] = new Duck(this.getSubDuckOptions(route)) as any;
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
      this.makeDucks<this["quickDucks"]>(this.quickDucks),
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
  get reducer(): Reducer<CombinedState<Readonly<
    StateFromReducersMapObject<this["reducers"] & DUCKS_REDUCERS<this["ducks"]>>
  >>> {
    const ducksReducers: any = {};
    for (const key of Object.keys(this.ducks)) {
      ducksReducers[key] = this.ducks[key].reducer;
    }
    return combineReducers<StateFromReducersMapObject<this["reducers"] & DUCKS_REDUCERS<this["ducks"]>>>({
      ...this.reducers,
      ...ducksReducers
    });
  }
  private *ducksSaga() {
    const { ducks } = this;
    let sagas: any[] = [];
    for (const key of Object.keys(ducks)) {
      const duck = ducks[key];
      sagas = sagas.concat(duck.sagas);
    }
    yield parallel(sagas);
  }
  *saga() {
    yield* super.saga();
    yield fork([this, this.ducksSaga]);
  }
}
