export { default as BaseDuck, DuckOptions } from "./BaseDuck";
export { default as Duck } from "./Duck";
export {
  default as ComposableDuck,
  /**
   * `ComposableDuck`的别名 alias of `ComposableDuck`
   * 
   * 历史兼容 legacy compatibility
   */
  default as DuckMap
} from "./ComposableDuck";
export { default as DuckRuntime, DuckCmpProps, INIT, END } from "./DuckRuntime";
export { purify, shouldComponentUpdate } from "./purify";
export {
  asResult,
  reduceFromPayload,
  createToPayload,
  memorize
} from "./helper";
