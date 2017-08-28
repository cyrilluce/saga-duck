/**
 * Duck可以拥有几个子Duck，映射在不同的route上，相互隔离，同时又在一个store上行效。
 */
import Duck from "./Duck";
import { SagaIterator } from "redux-saga";

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

type ChildDuck = { new (...any: any[]): Duck };

export interface DuckMapOptions {
  ducks: {
    [key: string]: ChildDuck;
  };
}

export default class DuckMap<
  TState = any,
  TTypes = any,
  TCreators = any,
  TSelectors = any,
  TMoreOptions = {},
  Ducks = {}
> extends Duck<
  TState,
  TTypes,
  TCreators,
  TSelectors,
  TMoreOptions & {ducks: Ducks}
> {
  private _ducks: Ducks;
  private _mapSagas: (() => SagaIterator)[];
  /** 提供ducks继承 */
  extendOptions(opt1, opt2, ...externals) {
    return super.extendOptions(opt1, opt2, ...externals, [
      "ducks",
      false,
      false
    ]);
  }
  get ducks() {
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
    this._ducks = <Ducks>map;
    return map;
  }
  eachDucks(callback) {
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
