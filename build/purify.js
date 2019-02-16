import { Component } from "react";
const hasOwnProperty = Object.prototype.hasOwnProperty;
function is(x, y) {
    if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
    }
    else {
        return x !== x && y !== y;
    }
}
const duckKey = "duck";
const storeKey = "store";
function shallowEqual(objA, objB) {
    if (is(objA, objB)) {
        return true;
    }
    if (typeof objA !== "object" ||
        objA === null ||
        typeof objB !== "object" ||
        objB === null) {
        return false;
    }
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
        return false;
    }
    const isDuckComponent = duckKey in objA &&
        storeKey in objA &&
        (duckKey in objB && storeKey in objB);
    for (let i = 0; i < keysA.length; i++) {
        const key = keysA[i];
        if (isDuckComponent &&
            key === storeKey &&
            is(objA[duckKey].selector(objA[storeKey]), objB[duckKey].selector(objB[storeKey]))) {
            continue;
        }
        if (!hasOwnProperty.call(objB, key) || !is(objA[key], objB[key])) {
            return false;
        }
    }
    return true;
}
export function shouldComponentUpdate(instance, props, state) {
    return (!shallowEqual(instance.props, props) || !shallowEqual(instance.state, state));
}
function shouldComponentUpdateForReplace(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
}
export const purify = function (component) {
    if (typeof component.prototype.isReactComponent === "object") {
        const Cmp = component;
        if (Cmp.prototype.shouldComponentUpdate !== undefined) {
            console.warn("purify() only use to decorate class dose not implement shouldComponentUpdate");
        }
        Cmp.prototype.shouldComponentUpdate = shouldComponentUpdateForReplace;
        return Cmp;
    }
    else {
        const statelessRender = component;
        class PureRender extends Component {
            render() {
                return statelessRender(this.props);
            }
            shouldComponentUpdate(nextProps, nextState) {
                return shouldComponentUpdate(this, nextProps, nextState);
            }
        }
        PureRender.displayName = statelessRender && statelessRender.name;
        return PureRender;
    }
};
