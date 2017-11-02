import * as React from "react";
import Duck from "./CounterDuck";

export default function Counter({
  duck,
  store,
  dispatch
}: {
  duck: Duck;
  store: any;
  dispatch: (any: any) => any;
}) {
  const { selectors, creators } = duck;
  const value = selectors.count(store);
  return (
    <div>
      Clicked: {value} times
      <button onClick={() => dispatch(creators.increment())}>+</button>
      <button onClick={() => dispatch(creators.decrement())}>-</button>
      <button onClick={() => dispatch(creators.incrementIfOdd())}>
        Increment if odd
      </button>
      <button onClick={() => dispatch(creators.incrementAsync())}>
        Increment async
      </button>
    </div>
  );
}
