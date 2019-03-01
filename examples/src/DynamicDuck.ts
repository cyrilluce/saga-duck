import { Duck } from "../../src"

export default abstract class DynamicDuck extends Duck {
  abstract get ProtoDuck(): new (params) => Duck

  private DuckPool = {}

  get reducer(): any {
    return (state = {}, action) => {
      if (action.type.startsWith(this.actionTypePrefix)) {
        let key = action.type
          .slice(this.actionTypePrefix.length + 1)
          .split("/")[0]
        if (key in this.DuckPool) {
          return {
            ...state,
            ...{ [key]: this.DuckPool[key].reducer(state[key], action) }
          }
        }
      }
      return state
    }
  }

  getDuck(seed) {
    let id = this.generateId(seed)
    if (this.DuckPool[id]) return this.DuckPool[id]

    const parentSelector = this.selector

    let target = new this.ProtoDuck({
      route: id,
      namespace: this.actionTypePrefix,
      selector: state => {
        let route = id
        return parentSelector(state)[route] || {}
      }
    })
    this.DuckPool[id] = target
    return target
  }

  generateId(seed) {
    return `Dynamic-${seed}`
  }
}
