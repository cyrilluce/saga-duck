import Duck from "./Duck";
import DuckMap from "./DuckMap";

class FooDuck extends Duck {
  get rawTypes() {
    enum Types {
      FOO
    }
    return {
      ...super.rawTypes,
      ...Types
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
  get rawCreators() {
    return {
      ...super.rawCreators,
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
    }
  }

  *saga() {
    yield* super.saga();
    this.types.FOO;
    this.State.foo;
    this.selector(null).foo;
    this.selectors.foo(null, 1);
  }
}

class BarDuck extends FooDuck {
  get rawTypes() {
    enum Types {
      BAR
    }
    return {
      ...super.rawTypes,
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
  get rawCreators() {
    return {
      ...super.rawCreators,
      bar() {}
    };
  }
  test() {
    this.types.BAR;
    this.State.bar;
    this.selector(null).bar;
  }
}

class FooDuckMap extends DuckMap {
  get reducers() {
    return {
      ...super.reducers,
      foo() {
        return 1;
      }
    };
  }
  get rawDucks() {
    return {
      ...super.rawDucks,
      foo1: FooDuck
    };
  }
  *saga() {
    yield* super.saga();
    this.State.foo.toExponential;
    this.State.foo1.foo.toLowerCase;
    this.ducks.foo1.types.FOO;
  }
}

class BarDuckMap extends FooDuckMap {
  get rawTypes() {
    return { ...super.rawTypes, FUN: 1 };
  }
  get rawDucks() {
    return {
      ...super.rawDucks,
      bar1: BarDuck
    };
  }
  *saga() {
    yield* super.saga();
    this.ducks.foo1.types.FOO;
    this.ducks.bar1.types.BAR;
  }
}
