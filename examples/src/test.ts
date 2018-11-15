import BaseDuck from "../../src/BaseDuck";
import Duck from "../../src/Duck";
import ComposableDuck from "../../src/ComposableDuck";
import { takeEvery, call, put, select, take } from "redux-saga/effects";
import { delay } from "redux-saga";

type SimpleState = number;
class FooSimpleDuck extends BaseDuck {
  get reducer() {
    return (state: SimpleState, action) => {
      return state;
    };
  }
  *saga() {
    yield* super.saga();
    const state = this.selector(yield select());
    state.toExponential; // SimpleState = number
  }
}

class FooDuck extends Duck {
  get quickTypes() {
    enum Types {
      FOO
    }
    return {
      ...super.quickTypes,
      ...Types
    };
  }
  get rawTypes() {
    return {
      ...super.quickTypes,
      FOOO: "FOOOO"
    };
  }
  get reducers() {
    const { types } = this;
    return {
      ...super.reducers,

      foo(state = "", action): string {
        switch (action.type) {
          case types.FOO:
            return action.payload;
        }
        return state;
      }
    };
  }
  get creators() {
    return {
      ...super.creators,
      foo() {}
    };
  }
  get rawSelectors() {
    type State = this["State"];
    return {
      ...super.rawSelectors,
      foo(state: State, a: number) {
        return state.foo;
      }
    };
  }

  *saga() {
    yield* super.saga();
    this.types.FOO;
    this.types.FOOO;
    this.State.foo;
    this.selector(null).foo;
    this.selectors.foo(null, 1);
  }
}

class BarDuck extends FooDuck {
  get quickTypes() {
    enum Types {
      BAR
    }
    return {
      ...super.quickTypes,
      ...Types
    };
  }
  get reducers() {
    return {
      ...super.reducers,
      bar() {
        return "";
      }
    };
  }
  get rawSelectors() {
    type State = this["State"];
    return {
      ...super.rawSelectors,
      bar(state: State, a: number) {
        return state.bar;
      }
    };
  }
  get creators() {
    return {
      ...super.creators,
      bar() {}
    };
  }
  test() {
    this.creators.bar();
  }
}

class FooDuckMap extends ComposableDuck {
  get quickTypes() {
    enum Types {
      BAR
    }
    return {
      ...super.quickTypes,
      ...Types
    };
  }
  get reducers() {
    return {
      ...super.reducers,
      foo() {
        return 1;
      }
    };
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      foo1: FooDuck
    };
  }
  get rawDucks() {
    return {
      ...super.rawDucks,
      foo2: new FooDuck(this.getSubDuckOptions("foo2"))
    };
  }
  *saga() {
    yield* super.saga();
    const { types, selector, selectors, creators, ducks } = this;
    const state = selector(yield select());
  }
}

class BarDuckMap extends FooDuckMap {
  get quickTypes() {
    return { ...super.quickTypes, FUN: 1 };
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      bar1: BarDuck
    };
  }
  *saga() {
    yield* super.saga();
    this.ducks.foo1.types.FOO;
    this.ducks.bar1.types.BAR;
  }
}

class SingleDuck extends Duck {
  get quickTypes() {
    return {
      ...super.quickTypes,
      INCREMENT: 1,
      INCREMENT_ASYNC: 1
    };
  }
  get reducers() {
    const { types } = this;
    return {
      ...super.reducers,
      count: (state = 0, action) => {
        switch (action.type) {
          case types.INCREMENT:
            return state + 1;
          default:
            return state;
        }
      }
    };
  }
  *saga() {
    yield* super.saga();
    const { types, selector } = this;
    yield takeEvery(types.INCREMENT_ASYNC, function*() {
      yield call(delay, 1000);
      // select state of this duck
      const { count } = selector(yield select());
      yield put({ type: types.INCREMENT });
    });
  }
}

class ExtendedDuck extends SingleDuck {
  get quickTypes() {
    return {
      ...super.quickTypes,
      MORE: 1
    };
  }
  get reducers() {
    return {
      ...super.reducers,
      more: (state, action) => 1
    };
  }
  get rawSelectors() {
    return {
      ...super.rawSelectors,
      more(state) {
        return state.more;
      }
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      more() {
        return {
          type: types.MORE
        };
      }
    };
  }
  *saga() {
    yield* super.saga();
    const { types, selector, selectors, creators } = this;
    yield take([types.INCREMENT, types.MORE]);
    const { count, more } = selector(yield select());
    const _more = selectors.more(yield select());
    yield put(creators.more());
  }
}

class ComposedDuck extends ComposableDuck {
  get quickTypes() {
    return {
      ...super.quickTypes,
      PARENT: 1
    };
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      duck1: SingleDuck,
      duck2: ExtendedDuck,
      duck3: ExtendedDuck
    };
  }
  *saga() {
    yield* super.saga();
    const {
      types,
      selector,
      ducks: { duck1, duck2, duck3 }
    } = this;
    yield takeEvery(types.PARENT, function*() {
      yield put({ type: duck1.types.INCREMENT });
      yield put(duck2.creators.more());
      yield put(duck3.creators.more());
    });
    // { parent, duck1: {count}, duck2: {count, more}, duck3: {count, more} }
    const state = selector(yield select());
  }
}
