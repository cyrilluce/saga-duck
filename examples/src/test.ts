import BaseDuck from '../../src/BaseDuck'
import Duck from "../../src/Duck";
import ComposableDuck from "../../src/ComposableDuck";
import { select } from "redux-saga/effects";

type SimpleState = number
class FooSimpleDuck extends BaseDuck{
  get reducer(){
    return (state: SimpleState, action)=>{
      return state
    }
  }
  *saga(){
    yield* super.saga()
    const state = this.selector(yield select())
    state.toExponential // SimpleState = number
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
    this.creators.bar()
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
