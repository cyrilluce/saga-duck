import * as React from "react";
import Duck from "./CounterDuck";
import { DuckCmpProps } from "../../src/DuckRuntime";
import { purify } from "../../src/purify";

export default purify(function Counter({
  duck,
  store,
  dispatch
}: DuckCmpProps<Duck>) {
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
});