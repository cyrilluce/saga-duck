import { DuckMap } from "../../src"
import { takeEvery, call, put, select } from "redux-saga/effects"
import CounterDuck from "./CounterDuck"
import CounterDynamicDuck from "./CounterDynamicDuck"

class CounterStep2Duck extends CounterDuck {
  get step() {
    return 2
  }
}
class CounterStep3Duck extends CounterDuck {
  get step() {
    return 3
  }
}
export default class MyRootDuck extends DuckMap {
  get quickTypes() {
    enum Types {
      "INCREMENT",
      "CHILD_INCREMENT"
    }
    return {
      ...super.quickTypes,
      ...Types
    }
  }
  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      total: (state = 0, action) => {
        switch (action.type) {
          case types.CHILD_INCREMENT:
            return state + 1
          default:
            return state
        }
      }
    }
  }
  get rawSelectors() {
    return {
      ...super.rawSelectors,
      total: state => state.total
    }
  }
  get creators() {
    return {
      ...super.creators,
      increment: () => ({ type: this.types.INCREMENT })
    }
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      counter1: CounterDuck,
      counter2: CounterStep2Duck,
      counter3: CounterStep3Duck,
      counter4: CounterDynamicDuck
    }
  }
  *saga() {
    yield* super.saga()
    const {
      types,
      ducks: { counter1, counter2, counter3 }
    } = this
    // Increment all counters
    yield takeEvery(types.INCREMENT, function*() {
      yield put(counter1.creators.increment())
      yield put(counter2.creators.increment())
      yield put(counter3.creators.increment())
    })

    // Count child counters increments
    yield takeEvery(
      [
        counter1.types.INCREMENT,
        counter2.types.INCREMENT,
        counter3.types.INCREMENT
      ],
      function*() {
        yield put({ type: types.CHILD_INCREMENT })
      }
    )
  }
}
