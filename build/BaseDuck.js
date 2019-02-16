import { generateId, memorize } from "./helper";
const defaultDuckOptions = {
    namespace: "global",
    selector(a) {
        return a;
    },
    route: ""
};
export default class BaseDuck {
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
        return ["types", "rawSelectors", "selectors", "creators"];
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
}
BaseDuck.memorize = memorize;
