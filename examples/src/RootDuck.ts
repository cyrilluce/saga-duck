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
  increment()
}
interface Selectors{
  total: number
}
interface Options{
  step: number
  getStep: (...any: any[]) => number
}
interface Ducks{
  counter1: CounterDuck
  counter2: CounterDuck
  counter3: CounterDuck
}
class CounterStep2Duck extends CounterDuck{
  get step(){
    return 2
  }
}
class CounterStep3Duck extends CounterDuck{
  get step(){
    return 3
  }
}
export default class MyRootDuck extends DuckMap{
  get rawTypes(){
    enum Types{
      "INCREMENT", "CHILD_INCREMENT"
    }
    return {
      ...super.rawTypes,
      ...Types
    }
  }
  get reducers(){
    const {types}=this
    return {
      ...super.reducers,
      total: (state = 0, action) => {
        switch (action.type) {
          case types.CHILD_INCREMENT:
            return state + 1;
          default:
            return state;
        }
      }
    }
  }
  get rawSelectors(){
    return {
      ...super.rawSelectors,
      total: state => state.total
    }
  }
  get rawCreators(){
    return {
      ...super.rawCreators,
      increment: () => ({ type: this.types.INCREMENT })
    }
  }
  get rawDucks(){
    return {
      ...super.rawDucks,
      counter1: CounterDuck,
      counter2: CounterStep2Duck,
      counter3: CounterStep3Duck
    }
  }
  *saga(){
    yield* super.saga()
    const { types, ducks: { counter1, counter2, counter3 } }=this
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
}
