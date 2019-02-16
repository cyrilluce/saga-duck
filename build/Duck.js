import BaseDuck from './BaseDuck';
import { combineReducers } from "redux";
export default class Duck extends BaseDuck {
    get reducers() {
        return {};
    }
    get reducer() {
        return combineReducers(this.reducers);
    }
}
