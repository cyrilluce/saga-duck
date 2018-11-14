import Duck from "./Duck";
import DuckMap from "./DuckMap";
class FooDuck extends Duck {
    get quickTypes() {
        let Types;
        (function (Types) {
            Types[Types["FOO"] = 0] = "FOO";
        })(Types || (Types = {}));
        return Object.assign({}, super.quickTypes, Types);
    }
    get rawTypes() {
        return Object.assign({}, super.quickTypes, { FOOO: 'FOOOO' });
    }
    get reducers() {
        const { types } = this;
        return Object.assign({}, super.reducers, { foo(state = "", action) {
                switch (action.type) {
                    case types.FOO:
                        return action.payload;
                }
                return state;
            } });
    }
    get creators() {
        return Object.assign({}, super.creators, { foo() { } });
    }
    get rawSelectors() {
        return Object.assign({}, super.rawSelectors, { foo(state, a) {
                return state.foo;
            } });
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
        let Types;
        (function (Types) {
            Types[Types["BAR"] = 0] = "BAR";
        })(Types || (Types = {}));
        return Object.assign({}, super.quickTypes, Types);
    }
    get reducers() {
        return Object.assign({}, super.reducers, { bar() {
                return "";
            } });
    }
    get creators() {
        return Object.assign({}, super.creators, { bar() { } });
    }
    test() {
        this.types.BAR;
        this.State.bar;
        this.selector(null).bar;
    }
}
class FooDuckMap extends DuckMap {
    get reducers() {
        return Object.assign({}, super.reducers, { foo() {
                return 1;
            } });
    }
    get quickDucks() {
        return Object.assign({}, super.quickDucks, { foo1: FooDuck });
    }
    get rawDucks() {
        return Object.assign({}, super.rawDucks, { foo2: new FooDuck(this.getSubDuckOptions('foo2')) });
    }
    *saga() {
        yield* super.saga();
        this.State.foo.toExponential;
        this.State.foo1.foo.toLowerCase;
        this.ducks.foo1.types.FOO;
    }
}
class BarDuckMap extends FooDuckMap {
    get quickTypes() {
        return Object.assign({}, super.quickTypes, { FUN: 1 });
    }
    get quickDucks() {
        return Object.assign({}, super.quickDucks, { bar1: BarDuck });
    }
    *saga() {
        yield* super.saga();
        this.ducks.foo1.types.FOO;
        this.ducks.bar1.types.BAR;
    }
}
