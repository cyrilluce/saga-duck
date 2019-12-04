/**
 * 仅供typescript下使用，将redux-saga的yield select(selector)结果转换为实际类型
 * For typescript only, cast redux-saga yield select(selector) to actual result
 * 用法/usage： const result = asResult(selector, yield select(selector))
 */
export function asResult<T>(fn: (...any: any[]) => T, result: any): T {
  return result;
}

/**
 * 常用工具方法 - 生成reducer
 * helper - generate simple reducer
 * 用法/usage： num : reduceFromPayload(types.SET_NUM, 0)
 */
export function reduceFromPayload<TState, TType = string>(
  actionType: TType,
  initialState: TState
) {
  return (
    state: TState = initialState,
    action: { type: TType; payload?: TState }
  ) => {
    if (action.type === actionType) {
      return action.payload;
    }
    return state;
  };
}
/**
 * 常用工具方法 - 生成creator
 * helper - generate simple action creator
 * 用法/usage： inc: createToPayload(types.INC)
 */
export function createToPayload<TState, TType = string>(actionType: TType) {
  return (payload: TState) => ({
    type: actionType,
    payload
  });
}

/**
 * Memorize function result, for React Performance optimize
 * **MENTION** Should ONLY used to cache data associate with duck and dispatch, and duck MUST be stateless.
 *
 * 缓存与duck及dispatch关联的数据生成，使得每次输出都是一致的，方便React性能优化。
 * **注意** 仅能用于只和duck与dispatch有关的数据生成，并且duck必须是无状态的（即不可变的）
 *
 * @param {*} fn (duck, dispatch, {refs}) => any
 * @return {Function} memorizedFn (duckComponent | props) => cache
 * @deprecated use `React.useMemo` instead
 *    ```typescript
 *    const handlers = React.useMemo(() => { return {...} }, [duck, dispatch])
 *    ```
 */
export function memorize<T>(
  fn: (duck: any, dispatch: any) => T
): (reactInstanceOrProps: any) => T {
  const cacheKey = "_sagaDuckMemorized";
  const idKey = "_sagaDuckUniqId";
  const fnId = fn[idKey] || (fn[idKey] = generateId("MEMORIZE-FN"));
  return function memorizedFn(duckComponent) {
    let cacheHost;
    let props;
    if (duckComponent.isReactComponent && duckComponent.props) {
      props = duckComponent.props;
    } else {
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
