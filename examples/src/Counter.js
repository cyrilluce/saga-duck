import React from 'react'

export default function Counter({ duck, store, dispatch }) {
  const { selectors, creators } = duck;
  const value = selectors.count(store)
  return (
    <div>
      Clicked: {value} times
      <button onClick={()=>dispatch(creators.increment())}>
        +
      </button>
      <button onClick={()=>dispatch(creators.decrement())}>
        -
      </button>
      <button onClick={()=>dispatch(creators.incrementIfOdd())}>
        Increment if odd
      </button>
      <button onClick={()=>dispatch(creators.incrementAsync())}>
        Increment async
      </button>
    </div>
  );
}
