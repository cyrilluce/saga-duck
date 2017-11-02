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
export function reduceFromPayload<T>(
  actionType: string | number,
  initialState: T
) {
  return (
    state: T = initialState,
    action: { type: string | number; payload?: T }
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
export function createToPayload<T>(actionType: string | number) {
  return (payload: T) => ({
    type: actionType,
    payload
  });
}
