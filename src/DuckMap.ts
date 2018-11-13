import Duck, { DuckOptions, STATE_OF_REDUCERS, REDUCER, once } from "./Duck";
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
  get State(): STATE_OF_REDUCERS<this["reducers"]> &
    DUCKS_STATES<this["ducks"]> {
    return null;
  }
  getSubDuckOptions(route: string): DuckOptions {
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
   * this.makeDucks({foo: Foo}) =>
   * @param ducks
   */
  makeDucks<T extends Record<string, DuckType<Duck>>>(ducks: T): DUCKS<T> {
    const map = {} as DUCKS<T>;
    for (const route of Object.keys(ducks)) {
      let Duck = ducks[route];
      map[route] = new Duck(this.getSubDuckOptions(route)) as any;
    }
    return map;
  }
  @once
  get ducks(): DUCKS<this["rawDucks"]> {
    return this.makeDucks(this.rawDucks) as DUCKS<this["rawDucks"]>;
  }
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
  *ducksSaga() {
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