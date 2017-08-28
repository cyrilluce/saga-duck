import { Duck } from "../../src";
import { takeEvery, call, put, select } from "redux-saga/effects";
import { delay } from "redux-saga";

const types = {
  /** 增加 */
  INCREMENT: '',
  INCREMENT_IF_ODD: '',
  DECREMENT: '',
  INCREMENT_ASYNC: ''
};
interface Creators{
  increment(step: number): { type: string; step: number };
  incrementIfOdd(): { type: string };
  decrement(): { type: string };
  incrementAsync(): { type: string };
}
interface Selectors{
  count: (any) => number;
}
interface Options{
  step?: number;
  getStep?: () => number;
}
export default class MyDuck extends Duck<
  number,
  typeof types,
  Creators,
  Selectors,
  Options
> {
  constructor() {
    super(
      {
        /** actionTypes */
        types,
        /** single reducer */
        reducer: (state = 0, action, duck) => {
          const { types } = duck;
          switch (action.type) {
            case types.INCREMENT:
              return state + (action.step || 1);
            case types.INCREMENT_IF_ODD:
              return state % 2 !== 0 ? state + 1 : state;
            case types.DECREMENT:
              return state - 1;
            default:
              return state;
          }
        },
        /** extensible reducers */
        // reducers: ({types})=({ count: (state=0, action)=>... })
        /** selectors, will auto map current duck's state */
        selectors: {
          count: state => state
        },
        /** action creators */
        creators: ({ types }) => ({
          increment: step => ({ type: types.INCREMENT, step }),
          incrementIfOdd: () => ({ type: types.INCREMENT_IF_ODD }),
          decrement: () => ({ type: types.DECREMENT }),
          incrementAsync: () => ({ type: types.INCREMENT_ASYNC })
        }),
        /** custom options */
        step: 1,
        // getStep: () => 1,

        /** sagas */
        sagas: [
          function*({
            types,
            creators,
            selector,
            selectors,
            options: { step, getStep }
          }) {
            // use types define
            yield takeEvery(types.INCREMENT_ASYNC, function*() {
              yield call(delay, 1000);
              // select state of this duck
              const state = yield select(selector);
              // select some value of this duck
              const currentNumber = yield select(selectors.count);
              // use custom property in options
              const incStep = (getStep && getStep()) || step;
              // use action creators
              yield put(creators.increment(incStep));
            });
          }
        ]
      },
      /** for extensible usage */
      ...arguments
    );
  }
}
