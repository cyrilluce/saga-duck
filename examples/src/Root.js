import * as React from 'react'
import Counter from "./Counter";

export default function Root({ duck, store, dispatch }) {
  const { selectors, creators, ducks: { counter1, counter2, counter3 } } = duck;
  return (
    <div>
      counter1:
      <Counter duck={counter1} store={store} dispatch={dispatch} />
      counter2:
      <Counter duck={counter2} store={store} dispatch={dispatch} />
      counter3:
      <Counter duck={counter3} store={store} dispatch={dispatch} />
      myself: total increment times: {selectors.total(store)} <br/>
      <button onClick={()=>dispatch(creators.increment())}>
        Increment all
      </button>
    </div>
  );
}
