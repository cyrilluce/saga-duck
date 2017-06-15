/**
 * 尝试改进Duck
 * @author cluezhang
 */
import { combineReducers } from 'redux'

function defaultCreators() {
  return {}
}
function defaultReducer(state) {
  return state
}
function defaultReducers() {
  return {}
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
  }
}

export default class Duck {
  /**
   * 
   * @param {*} options 
   *    namespace, route, typeList, constList, 
   *    creators, initialState, reducer, selector, selectors,
   *    sagas
   */
  constructor(options, ...extendOptions) {
    this.options = {
      namespace: 'global',
      route: '',
      ...assignDefaults(options)
    }
    if (extendOptions.length) {
      extendOptions.forEach(options => {
        this.extend(options)
      })
    }
  }
  /** 扩展Duck */
  extend(options) {
    const parent = this.options
    // options = assignDefaults(options)

    this.options = this.extendOptions(parent, options)
  }
  extendOptions(parent, child, ...extraOptionDefines) {
    const options = {
      ...parent,
      ...child
    }
    ;[
      // optionKey, isArray, isGetter
      ['constList', true],
      ['typeList', true],
      ['creators', false, true],
      ['reducers', false, true],
      ['selectors', false],
      ['sagas', true],
      ...extraOptionDefines
    ].forEach(([key, isArray, isGetter]) => {
      const opt = Duck.mergeOption(parent, child, key, isArray, isGetter)
      if (opt) {
        options[key] = opt
      }
    })
    return options
  }
  get namespace() {
    return this.options.namespace
  }
  get route() {
    return this.options.route
  }
  /** ActionType前缀 */
  get actionTypePrefix() {
    const { namespace, route } = this.options
    return route ? `${namespace}/${route}/` : `${namespace}/`
  }
  /** ActionType常量Map，根据options.typeList生成 */
  get types() {
    if (this._types) {
      return this._types
    }
    const { typeList = [] } = this.options
    const prefix = this.actionTypePrefix
    const types = (this._types = {})
    typeList.forEach(type => {
      types[type] = prefix + type
    })
    return types
  }

  /** 其它常量定义 */
  get consts() {
    if (this._consts) {
      return this._consts
    }
    const { constList = [] } = this.options
    const consts = {}
    constList.forEach(word => {
      consts[word] = word
    })
    return (this._consts = consts)
  }
  /** creators生成 */
  get creators() {
    if (this._creators) {
      return this._creators
    }
    const { creators = () => ({}) } = this.options
    return (this._creators = creators(this))
  }
  get initialState() {
    if (this._initialState) {
      return this._initialState
    }
    const { initialState } = this.options
    return (this._initialState = typeof initialState === 'function'
      ? initialState()
      : initialState)
  }
  /** root reducer，自动带上Duck作为第3个参数，或从reducers生成，自动带上Duck作为第1个参数 */
  get reducer() {
    if (this._reducer) {
      return this._reducer
    }
    const reducers = this.reducers
    const reducerList = []
    if (Object.keys(reducers).length > 0) {
      reducerList.push(combineReducers(this.reducers))
    }
    const { reducer } = this.options
    if (reducer) {
      reducerList.push((state = this.initialState, action) => {
        return reducer(state, action, this)
      })
    }
    return (this._reducer = Duck.mergeReducers(...reducerList))
  }
  get reducers() {
    const { reducers } = this.options
    return reducers(this)
  }
  /** 根选择器，根据options.selector与options.route共同生成 */
  get selector() {
    if (this._selector) {
      return this._selector
    }
    const { route, selector } = this.options
    return (this._selector =
      selector || (route && (state => state[route])) || (state => state))
  }
  /** selectors生成，会自动以根selector包装 TODO 或可考虑与selector合并，既是方法 */
  get selectors() {
    if (this._selectors) {
      return this._selectors
    }
    const { selectors = {} } = this.options
    const rootSelector = this.selector
    const interceptedSelectors = {}
    Object.keys(selectors).forEach(key => {
      interceptedSelectors[key] = function(state) {
        return selectors[key].call(selectors, rootSelector(state))
      }
    })
    return (this._selectors = interceptedSelectors)
  }
  /** saga列表，自动包装duck作为第一个参数 */
  get sagas() {
    if (this._sagas) {
      return this._sagas
    }
    const { sagas = [] } = this.options
    return (this._sagas = sagas.map(saga => () => {
      return saga(this)
    }))
  }
  static mergeStates(oldState, states) {
    const newState = { ...oldState }
    let hasChanged = false
    states.forEach(myState => {
      if (myState !== oldState) {
        hasChanged = true
        Object.assign(newState, myState)
      }
    })
    return hasChanged ? newState : oldState
  }
  /** 不同于redux的combineReducers，它是直接合并（即不在属性上独立） */
  static mergeReducers(...reducers) {
    if (!reducers.length) {
      return defaultReducer
    }
    if (reducers.length === 1) {
      return reducers[0]
    }
    return (state, action, ...extras) => {
      return Duck.mergeStates(
        state,
        reducers.map(reducer => reducer(state, action, ...extras))
      )
    }
  }
  /** 继承、合并配置 */
  static mergeOption(parent, child, key, isArray, isGetter) {
    if (!(key in child) || !(key in parent)) {
      return null
    }
    const a = parent[key]
    const b = child[key]
    if (isGetter) {
      const isFnA = typeof a === 'function'
      const isFnB = typeof b === 'function'
      return duck => {
        const av = isFnA ? a(duck) : a
        const bv = isFnB ? b(duck) : b
        return isArray ? [...av, ...bv] : { ...av, ...bv }
      }
    }
    return isArray ? [...a, ...b] : { ...a, ...b }
  }
}
