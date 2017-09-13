export { default as Duck, memorize } from "./Duck";
export { default as DuckMap } from "./DuckMap";
export { default as DuckRuntime, DuckCmpProps, INIT, END } from "./DuckRuntime";
export { purify, shouldComponentUpdate } from "./purify";
/** For typescript only, cast redux-saga yield select(selector) to actual result */
export function asResult<T>(fn: (...any: any[]) => T, result: any): T {
  return result;
}