import { DuckMap } from "../../src";
import CounterDuck from "./CounterDuck";
declare class CounterStep2Duck extends CounterDuck {
    readonly step: number;
}
declare class CounterStep3Duck extends CounterDuck {
    readonly step: number;
}
declare enum Types {
    "INCREMENT" = 0,
    "CHILD_INCREMENT" = 1
}
export default class MyRootDuck extends DuckMap {
    readonly quickTypes: {
        "INCREMENT": Types.INCREMENT;
        "CHILD_INCREMENT": Types.CHILD_INCREMENT;
    };
    readonly reducers: {
        total: (state: number, action: any) => number;
    };
    readonly rawSelectors: {
        total: (state: any) => any;
    };
    readonly creators: {
        increment: () => {
            type: string;
        };
    };
    readonly quickDucks: {
        counter1: typeof CounterDuck;
        counter2: typeof CounterStep2Duck;
        counter3: typeof CounterStep3Duck;
    };
    saga(): IterableIterator<any>;
}
export {};
