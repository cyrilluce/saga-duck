/**
 * saga-duck TS3.0+
 * @author cluezhang
 */
import BaseDuck from "./BaseDuck";
import { CombinedState, combineReducers, Reducer, ReducersMapObject, StateFromReducersMapObject } from "redux";
export type COMBINE_REDUCERS<T extends { [key: string]: () => any }> = (
  state: STATE_OF_REDUCERS<T>,
  action
) => STATE_OF_REDUCERS<T>;
type STATE_OF_REDUCERS<REDUCERS extends { [key: string]: () => any }> = {
  [key in keyof REDUCERS]: ReturnType<REDUCERS[key]>;
};

/**
 * 支持`reducers`配置（如需单一的`reducer`，请使用`BaseDuck`）
 *
 * Duck support `reducers` ( If you need single `reducer`, please use `BaseDuck`)
 */
export default class Duck extends BaseDuck {
  // ----------------------- reducers -----------------------
  /**
   * 定义reducers，Duck的state类型也从它自动生成
   * 
   * Define reducers, Duck's state type will auto generate from it.
   * @example```
get reducers(){
    const { types } = this
    return {
        ...super.reducers,
        foo(state = "", action): string {
            switch (action.type) {
            case types.FOO:
                return action.payload;
            }
            return state;
        }
    }
}
   ```
   */
  get reducers(): ReducersMapObject {
    return {};
  }
  /** 内部属性，仅供父Duck或Redux store使用 Interal property, only use for parent Duck or Redux store.*/
  get reducer(): Reducer<CombinedState<Readonly<StateFromReducersMapObject<this["reducers"]>>>> {
    return combineReducers(this.reducers as any);
  }
}
