import { Duck, reduceFromPayload } from "../../src";
import { takeEvery, call, put, select } from "redux-saga/effects";
import { delay } from "redux-saga";
export default class MyDuck extends Duck {
  get rawTypes() {
    enum TYPE {
      /** 增加 */
      INCREMENT,
      INCREMENT_IF_ODD,
      DECREMENT,
      INCREMENT_ASYNC
    }
    return {
      ...super.rawTypes,
      ...TYPE
    };
  }
  get reducers() {
    const { types } = this;
    return {
      ...super.reducers,
      count: (state = 0, action) => {
        switch (action.type) {
          case types.INCREMENT:
            return state + action.step;
          case types.INCREMENT_IF_ODD:
            return state % 2 !== 0 ? state + action.step : state;
          case types.DECREMENT:
            return state - action.step;
          default:
            return state;
        }
      }
    };
  }
  get rawSelectors() {
    type State = this["State"];
    return {
      ...super.rawSelectors,
      count(state: State) {
        return state.count;
      }
    };
  }
  get rawCreators() {
    const { types, step: defaultStep } = this;
    return {
      ...super.rawCreators,
      increment: (step = defaultStep) => ({
        type: types.INCREMENT,
        step
      }),
      incrementIfOdd: (step = defaultStep) => ({
        type: types.INCREMENT_IF_ODD,
        step
      }),
      decrement: (step = defaultStep) => ({
        type: types.DECREMENT,
        step
      }),
      incrementAsync: () => ({ type: types.INCREMENT_ASYNC })
    };
  }
  get step() {
    return 1;
  }
  *saga() {
    yield* super.saga();
    const { types, selector, selectors, creators, step } = this;
    yield takeEvery(types.INCREMENT_ASYNC, function*() {
      yield call(delay, 1000);
      // select state of this duck
      const state = selector(yield select());
      // select some value of this duck
      const currentNumber = selectors.count(yield select());
      // use custom property in options
      // use action creators
      yield put(creators.increment(step));
    });
  }
}
