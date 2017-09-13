export { default as Duck, memorize } from "./Duck";
export { default as DuckMap } from "./DuckMap";
export { default as DuckRuntime, INIT, END } from "./DuckRuntime";
export { purify, shouldComponentUpdate } from "./purify";
export function asResult(fn, result) {
    return result;
}
