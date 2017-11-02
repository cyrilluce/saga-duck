import { Duck, DuckMap } from "../../src";
import { takeEvery, call, put, select } from "redux-saga/effects";
import CounterDuck from "./CounterDuck";

interface State{
  total: number
}
interface Types{
  INCREMENT: string
  CHILD_INCREMENT: string
}
interface Creators{

}
interface Selectors{
  total: number
}
interface Options{
  step: number
  getStep: (...any: any[]) => number
}
interface Ducks{
  [key: string]: Duck
  counter1: CounterDuck
  counter2: CounterDuck
  counter3: CounterDuck
}
export default class MyRootDuck extends DuckMap<
  State,
  Types,
  Creators,
  Selectors,
  Options,
  Ducks
> {
  init() {
    super.init();
    this.extend(
      {
        /** child ducks, { [route]: ChildDuck }, can access by duck.ducks[route] */
        ducks: {
          /** no options */
          counter1: CounterDuck,
          /** copy options.step to child duck */
          counter2: [CounterDuck, "step"],
          /** copy transformed options to child duck */
          counter3: [
            CounterDuck,
            (opts, duck) => ({ getStep: opts.getStep.bind(duck) })
          ]
        },
        /** custom options, can map to child ducks */
        step: 2,
        getStep: () => 3,
        typeList: ["INCREMENT", "CHILD_INCREMENT"],
        /** extensible reducers, child ducks reducer will merge according to route key */
        reducers: ({ types }) => ({
          total: (state = 0, action) => {
            switch (action.type) {
              case types.CHILD_INCREMENT:
                return state + 1;
              default:
                return state;
            }
          }
        }),
        selectors: {
          total: state => state.total
        },
        creators: ({ types }) => ({
          increment: () => ({ type: types.INCREMENT })
        }),
        sagas: [
          function*({ types, ducks: { counter1, counter2, counter3 } }) {
            // Increment all counters
            yield takeEvery(types.INCREMENT, function*() {
              yield put(counter1.creators.increment());
              yield put(counter2.creators.increment());
              yield put(counter3.creators.increment());
            });

            // Count child counters increments
            yield takeEvery(
              [
                counter1.types.INCREMENT,
                counter2.types.INCREMENT,
                counter3.types.INCREMENT
              ],
              function*() {
                yield put({ type: types.CHILD_INCREMENT });
              }
            );
          }
        ]
      }
    );
  }
}
