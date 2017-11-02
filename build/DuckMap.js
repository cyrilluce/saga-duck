import Duck from "./Duck";
function getOptions(duck, options, keys) {
    return keys.reduce((o, key) => {
        if (typeof key === "object") {
            Object.keys(key).forEach(childKey => {
                const parentKey = key[childKey];
                let opt;
                opt = options[parentKey];
                o[childKey] = opt;
            });
        }
        else if (typeof key === "function") {
            Object.assign(o, key(options, duck));
        }
        else if (key in options) {
            o[key] = options[key];
        }
        return o;
    }, {});
}
export default class DuckMap extends Duck {
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
            map[route] = new Duck(Object.assign({ namespace, route: parentRoute ? `${parentRoute}/${route}` : route, selector: state => parentSelector(state)[route] }, duckOptions));
        });
        return (this._ducks = map);
    }
    eachDucks(callback) {
        const ducks = this.ducks;
        Object.keys(ducks).forEach(route => {
            callback(ducks[route], route);
        });
    }
    get reducers() {
        const reducers = super.reducers;
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
