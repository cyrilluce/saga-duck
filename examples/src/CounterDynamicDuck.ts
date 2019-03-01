import DynamicDuck from "./DynamicDuck"
import CounterDuck from "./CounterDuck"

class CounterStep4Duck extends CounterDuck {
  get step() {
    return 4
  }
}

export default class CounterDynamicDuck extends DynamicDuck {
  get ProtoDuck() {
    return CounterStep4Duck
  }
}
