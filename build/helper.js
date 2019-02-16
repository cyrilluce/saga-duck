export function asResult(fn, result) {
    return result;
}
export function reduceFromPayload(actionType, initialState) {
    return (state = initialState, action) => {
        if (action.type === actionType) {
            return action.payload;
        }
        return state;
    };
}
export function createToPayload(actionType) {
    return (payload) => ({
        type: actionType,
        payload
    });
}
export function memorize(fn) {
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
let idSeed = 1;
export function generateId(prefix = "SAGA-DUCK") {
    return `${prefix}-${idSeed++}`;
}
