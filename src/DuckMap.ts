/**
 * Duck可以拥有几个子Duck，映射在不同的route上，相互隔离，同时又在一个store上行效。
 */
import Duck, { DuckOptions } from "./Duck";
import { SagaIterator } from "redux-saga";
import { Action } from "redux";

function getOptions(duck, options, keys) {
  return keys.reduce((o, key) => {
    /**
     * 可以这样定义 [Duck, 'baseUrl', {params: 'routeParams'}, (options, duck)=>({params:options.params.bind(duck)})]
     * 字串 表示同步baseUrl配置到子Duck上
     * 对象 表示将父配置的routeParams映射到子Duck的params配置上
     * 函数 表示使用函数进行映射，这里请注意不要访问duck的属性（特别是ducks属性），因为可能会导致死循环。推荐仅传递引用。
     */
    if (typeof key === "object") {
      Object.keys(key).forEach(childKey => {
        const parentKey = key[childKey];
        let opt;
        // if (parentKey in duck) {
        //   opt = duck[parentKey]
        // } else {
        opt = options[parentKey];
        // }
        o[childKey] = opt;
      });
      // } else if (key in duck) {
      //   o[key] = duck[key]
    } else if (typeof key === "function") {
      Object.assign(o, key(options, duck));
    } else if (key in options) {
      o[key] = options[key];
    }
    return o;
  }, {});
}

export type ChildDuck = { new (...any: any[]): Duck };
export type DIRECTLY_DUCK<TDuckClass> = TDuckClass;

export type PARAM_STRING = string;
export type PARAM_MAP = { [key: string]: string };
export type PARAM_GETTER = (opts: any, duck: any) => Object;
export type PARAM = PARAM_STRING | PARAM_MAP | PARAM_GETTER;
// 6个应该够用了吧？
export type PARAM_LIST_DUCK<TDuckClass> =
  | [TDuckClass, PARAM]
  | [TDuckClass, PARAM, PARAM]
  | [TDuckClass, PARAM, PARAM, PARAM]
  | [TDuckClass, PARAM, PARAM, PARAM, PARAM]
  | [TDuckClass, PARAM, PARAM, PARAM, PARAM, PARAM]
  | [TDuckClass, PARAM, PARAM, PARAM, PARAM, PARAM, PARAM];

export type DUCK_OPTION<TDuckClass> =
  | DIRECTLY_DUCK<TDuckClass>
  | PARAM_LIST_DUCK<TDuckClass>;
/**
 * Ducks配置格式
 */
export type DUCKS_OPTIONS<TDucks> = {
  [key in keyof TDucks]?: DUCK_OPTION<new (...opts: any[]) => TDucks[key]>
};

export type MEMBER_OF<TObject extends Object, TKey extends keyof TObject> = TObject[TKey]
export type DUCKS_STATE<TDucks extends Object> = {
  [key in keyof TDucks]?: MEMBER_OF<TDucks[key], 'initialState'>
}

export default class DuckMap<
  TState = any,
  TTypes = any,
  TCreators = any,
  TSelectors = any,
  TMoreOptions = {},
  TDucks = {}
> extends Duck<
  TState & DUCKS_STATE<TDucks>,
  TTypes,
  TCreators,
  TSelectors,
  TMoreOptions & { ducks?: DUCKS_OPTIONS<TDucks> }
> {
  private _ducks: TDucks;
  private _mapSagas: (() => SagaIterator)[];
  /** 提供ducks继承 */
  protected extendOptions(opt1, opt2, ...externals) {
    return super.extendOptions(opt1, opt2, ...externals, [
      "ducks",
      false,
      false
    ]);
  }
  get ducks(): TDucks {
    if (this._ducks) {
      return this._ducks;
    }
    const { ducks = {} } = this.options;
    const map = {};
    const namespace = this.namespace;
    const parentSelector = this.selector;
    const parentRoute = this.route;
    Object.keys(ducks).forEach(route => {
      let Duck = ducks[route];
      let duckOptions = {};
      let extendKeys = [];
      if (Array.isArray(Duck)) {
        [Duck, ...extendKeys] = Duck;
        duckOptions = getOptions(this, this.options, extendKeys);
      }
      map[route] = new Duck({
        namespace,
        route: parentRoute ? `${parentRoute}/${route}` : route,
        selector: state => parentSelector(state)[route],
        ...duckOptions
      });
    });
    return (this._ducks = <TDucks>map);
  }
  protected eachDucks(callback) {
    const ducks = this.ducks;
    Object.keys(ducks).forEach(route => {
      callback(ducks[route], route);
    });
  }
  get reducers() {
    const reducers = super.reducers;
    // 整合个ducks的reducer
    this.eachDucks((duck, route) => {
      reducers[route] = duck.reducer;
    });
    return reducers;
  }
  get sagas() {
    if (this._mapSagas) {
      return this._mapSagas;
    }
    const mySagas = super.sagas;
    let ducksSagas = [];
    this.eachDucks(duck => {
      ducksSagas = ducksSagas.concat(duck.sagas);
    });
    return (this._mapSagas = ducksSagas.concat(mySagas));
  }
}
