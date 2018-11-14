import { combineReducers } from "redux";
const defaultDuckOptions = {
    namespace: "global",
    selector(a) {
        return a;
    },
    route: ""
};
let idSeed = 1;
function generateId(prefix = "SAGA-DUCK") {
    return `${prefix}-${idSeed++}`;
}
export default class Duck {
    constructor(options = defaultDuckOptions) {
        this.options = options;
        this.id = generateId();
        this._makeCacheGetters();
    }
    get actionTypePrefix() {
        const { namespace, route } = this.options;
        return route ? `${namespace}/${route}/` : `${namespace}/`;
    }
    get _cacheGetters() {
        return ["types", "reducers", "selectors", "creators"];
    }
    _makeCacheGetters() {
        const me = this;
        for (const property of this._cacheGetters) {
            let descriptor = null;
            let target = this;
            while (!descriptor) {
                target = Object.getPrototypeOf(target);
                if (!target) {
                    break;
                }
                descriptor = Object.getOwnPropertyDescriptor(target, property);
            }
            if (!descriptor) {
                continue;
            }
            let cache;
            Object.defineProperty(this, property, {
                get() {
                    if (!cache) {
                        cache = descriptor.get.call(me);
                    }
                    return cache;
                }
            });
        }
    }
    get types() {
        return Object.assign({}, this.makeTypes(this.quickTypes), this.rawTypes);
    }
    get quickTypes() {
        return {};
    }
    get rawTypes() {
        return {};
    }
    makeTypes(typeEnum) {
        const prefix = this.actionTypePrefix;
        let typeList = Object.keys(typeEnum);
        const types = {};
        if (typeEnum) {
            typeList = typeList.concat(Object.keys(typeEnum));
        }
        typeList.forEach(type => {
            types[type] = prefix + type;
        });
        return types;
    }
    get reducers() {
        return {};
    }
    get reducer() {
        return combineReducers(this.reducers);
    }
    get State() {
        return null;
    }
    get selector() {
        return this.options.selector;
    }
    get selectors() {
        const { selector, rawSelectors } = this;
        const selectors = {};
        for (const key of Object.keys(rawSelectors)) {
            selectors[key] = (globalState, ...rest) => rawSelectors[key](selector(globalState), ...rest);
        }
        return selectors;
    }
    get rawSelectors() {
        return {};
    }
    get localSelectors() {
        return this.rawSelectors;
    }
    get creators() {
        return {};
    }
    *saga() { }
    get sagas() {
        return [this.saga.bind(this)];
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
