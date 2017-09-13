import { combineReducers } from "redux";
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
    return Object.assign({ typeList: [], constList: [], creators: defaultCreators, reducers: defaultReducers, selectors: {}, sagas: [] }, options);
}
let idSeed = 1;
function generateId(prefix = "SAGA-DUCK") {
    return `${prefix}-${idSeed++}`;
}
export default class Duck {
    constructor(...extendOptions) {
        this.id = generateId();
        this.init();
        if (extendOptions.length) {
            extendOptions.forEach(options => {
                this.extend(options);
            });
        }
    }
    init() {
        this.options = assignDefaults({
            namespace: "global",
            route: ""
        });
    }
    extend(options) {
        const parent = this.options;
        this.options = this.extendOptions(parent, options);
    }
    extendOptions(parent, child, ...extraOptionDefines) {
        const options = Object.assign({}, parent, child);
        const defaultOptionDefines = [
            ["constList", true, false],
            ["typeList", true, false],
            ["types", false, false],
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
    get actionTypePrefix() {
        const { namespace, route } = this.options;
        return route ? `${namespace}/${route}/` : `${namespace}/`;
    }
    get types() {
        if (this._types) {
            return this._types;
        }
        const { types, typeList = [] } = this.options;
        const prefix = this.actionTypePrefix;
        let finalTypeList = typeList;
        const finalTypes = {};
        if (types) {
            finalTypeList = finalTypeList.concat(Object.keys(types));
        }
        finalTypeList.forEach(type => {
            finalTypes[type] = prefix + type;
        });
        return (this._types = finalTypes);
    }
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
    get creators() {
        if (this._creators) {
            return this._creators;
        }
        const { creators = () => ({}) } = this.options;
        return (this._creators = creators(this));
    }
    get initialState() {
        if (this._initialState) {
            return this._initialState;
        }
        const { initialState } = this.options;
        return (this._initialState =
            typeof initialState === "function" ? initialState(this) : initialState);
    }
    get reducer() {
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
    get reducers() {
        const { reducers } = this.options;
        return reducers(this);
    }
    get selector() {
        if (this._selector) {
            return this._selector;
        }
        const { route, selector } = this.options;
        return (this._selector =
            selector || (route && (state => state[route])) || (state => state));
    }
    get selectors() {
        if (this._selectors) {
            return this._selectors;
        }
        const { selectors = {} } = this.options;
        const rootSelector = this.selector;
        const interceptedSelectors = {};
        Object.keys(selectors).forEach(key => {
            interceptedSelectors[key] = function (state) {
                return selectors[key].call(selectors, rootSelector(state));
            };
        });
        return (this._selectors = interceptedSelectors);
    }
    get localSelectors() {
        return this.options.selectors;
    }
    get sagas() {
        if (this._sagas) {
            return this._sagas;
        }
        const { sagas = [] } = this.options;
        return (this._sagas = sagas.map(saga => () => saga(this)));
    }
    asState(state) {
        return state;
    }
    static mergeStates(oldState, states) {
        const newState = Object.assign({}, oldState);
        let hasChanged = false;
        states.forEach(myState => {
            if (myState !== oldState) {
                hasChanged = true;
                Object.assign(newState, myState);
            }
        });
        return hasChanged ? newState : oldState;
    }
    static mergeReducers(...reducers) {
        if (!reducers.length) {
            return defaultReducer;
        }
        if (reducers.length === 1) {
            return reducers[0];
        }
        return (state, action, ...extras) => {
            return Duck.mergeStates(state, reducers.map(reducer => reducer(state, action, ...extras)));
        };
    }
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
                return isArray ? [...av, ...bv] : Object.assign({}, av, bv);
            };
        }
        return isArray ? [...a, ...b] : Object.assign({}, a, b);
    }
    static memorize(fn) {
        const cacheKey = "_sagaDuckMemorized";
        const idKey = "_sagaDuckUniqId";
        const fnId = fn[idKey] || (fn[idKey] = generateId("MEMORIZE-FN"));
        return function memorizedFn(duckComponent) {
            let cacheHost;
            let props;
            if (duckComponent.isReactComponent && duckComponent.props) {
                props = duckComponent.props;
            }
            else {
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
