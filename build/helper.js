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
