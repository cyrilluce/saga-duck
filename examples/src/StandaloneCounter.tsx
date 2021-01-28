import * as React from "react";
import Duck from "./CounterDuck";
import { useDuck } from "../../src";
import { createLogger } from "redux-logger";

export default function StandaloneCounter() {
    const { duck, store, dispatch } = useDuck(Duck, [createLogger({ collapsed: true })])
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