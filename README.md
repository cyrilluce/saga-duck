# saga-duck
extensible and composable duck for redux-saga

See also
[ducks-modular-redux](https://github.com/erikras/ducks-modular-redux)
[extensible-duck](https://github.com/investtools/extensible-duck)

# example
![example of Counters](examples/example.gif)

# usage
## install
```sh
npm i saga-duck -S
```

## Documents
[Document-中文](https://cyrilluce.gitbooks.io/saga-duck)

## memtion
Ducks should be stateless, so we can use React FSC(functional stateless compoment) and optimize later.
You should only access store by duck.selector or duck.selectors.

## single duck
```js
import { Duck } from "saga-duck";
import { takeEvery, call, put, select } from "redux-saga/effects";
import { delay } from "redux-saga";

export default class MyDuck extends Duck {
  init() {
    super.init();
    this.extend(
      {
        /** actionTypes */
        typeList: [
          "INCREMENT",
          "INCREMENT_IF_ODD",
          "DECREMENT",
          "INCREMENT_ASYNC"
        ],
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
      }
    );
  }
}
```

## extend duck
```js
import { Duck } from "saga-duck";
import Base from "./CounterDuck";

export default class Duck extends Base {
  init() {
    super.init();
    this.extend(
      {
        /** custom options will be overwrite */
        step: 10,
        /** merge */
        typeList: ["MORE"],
        /** reducer will overwrite, reducers will merge */
        reducers: duck => ({ more: (state, action) => 1 }),
        /** merge */
        selectors: { more: state => state.more },
        /** merge */
        creators: duck => ({ more: () => ({ type: duck.types.MORE }) }),
        /** merge */
        sagas: [function*() {}]
      }
    );
  }
}
```

## compose ducks
```js
import { DuckMap } from "saga-duck";
import CounterDuck from "./CounterDuck";

export default class MyRootDuck extends DuckMap {
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
            /** DO NOT access duck.ducks here */
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
            
          }
        ]
      }
    );
  }
}
```

## Run and connect to React
```js
import { DuckRuntime } from "saga-duck";
import Root from "./Root";
import Duck from "./RootDuck";

const duckRuntime = new DuckRuntime(new Duck({...}));
const ConnectedComponent = duckRuntime.connectRoot()(Root);

ReactDOM.render(
  <Provider store={duckRuntime.store}>
    <ConnectedComponent />
  </Provider>,
  document.getElementById("root")
);
```

## Helpers
### purify
make React DuckComponent pure, only rerender when props and duck state changed.
```javascript
import { purify } from 'saga-duck'
export default purify(function DuckComponent({ duck, store, dispatch }){ ... })
```

### memorize
stabilize objects/functions reference, prevent React props unnecessary change.
```javascript
import { memorize } from 'saga-duck'
const getHandler = memorize((duck, dispatch) => ()=>dispatch(duck.creators.bar()) )

function Container(props){
  const handler = gethandler(props)
  return <Foo handler={handler} />
}
```

### reduceFromPayload / createToPayload
Create simple reducer / actionCreator
```javascript
import { reduceFromPayload, createToPayload } from 'saga-duck'

const options = {
  reducers: ({types}) => ({
    id: reduceFromPayload(types.SET_ID, 0),
    ...
  }),
  creators: ({types}) => ({
    setId: createToPayload(types.SET_ID),
    ...
  })
}

// equal to
const original = {
  reducers: ({types}) => ({
    id: (state=0, action)=>{
      switch(action.type){
        case types.SET_ID:
          return action.payload
        default:
          return state
      }
    },
    ...
  }),
  creators: ({types}) => ({
    setId: (id)=>({ type: types.SET_ID, payload: id }),
    ...
  })
}
```

## Typescript support
See [Duck example](./examples/src/CounterDuck.ts) and [DuckMap example](./examples/src/RootDuck.ts), and please use typescript **2.6.1**
```typescript
import { Duck, asResult } from "../../src";
import { takeEvery, call, put, select } from "redux-saga/effects";
import { delay } from "redux-saga";

type State = number;
enum TYPE{
  INCREMENT,
  INCREMENT_IF_ODD,
  DECREMENT,
  INCREMENT_ASYNC
};
interface Creators{
  increment(step?: number): { type: string; step: number };
}
interface Selectors{
  count: number;
}
interface Options{
  step?: number;
  getStep?: () => number;
}
export default class MyDuck extends Duck<
  State,
  typeof TYPE,
  Creators,
  Selectors,
  Options
> {
  init() {
    super.init();
    this.extend(
      {
        types: TYPE,
        ...
        sagas: [
          this.sagaMain
        ]
      }
    );
  }
  *sagaMain(duck: this){
    // typeof state: State
    const state = asResult(
      duck.selector,
      yield select(duck.selector)
    )
    // for typescript limitation, in this statement `state` will be `any`
    // const state = yield select(duck.selector)
  }
}
```