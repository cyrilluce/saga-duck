import * as React from "react"
import Counter from "./Counter"
import { DuckCmpProps } from "../../src/DuckRuntime"
import Duck from "./RootDuck"

export default function Root({ duck, store, dispatch }: DuckCmpProps<Duck>) {
  const {
    selectors,
    creators,
    ducks: { counter1, counter2, counter3, counter4 }
  } = duck
  return (
    <div>
      counter1:
      <Counter duck={counter1} store={store} dispatch={dispatch} />
      counter2:
      <Counter duck={counter2} store={store} dispatch={dispatch} />
      counter3:
      <Counter duck={counter3} store={store} dispatch={dispatch} />
      myself: total increment times: {selectors.total(store)} <br />
      <button onClick={() => dispatch(creators.increment())}>
        Increment all
      </button>
      <hr />
      动态counter1:
      <Counter duck={counter4.getDuck(1)} store={store} dispatch={dispatch} />
      动态counter2:
      <Counter duck={counter4.getDuck(2)} store={store} dispatch={dispatch} />
    </div>
  )
}
