import { Duck } from "../../src";
declare enum TYPE {
    INCREMENT = 0,
    INCREMENT_IF_ODD = 1,
    DECREMENT = 2,
    INCREMENT_ASYNC = 3
}
export default class MyDuck extends Duck {
    readonly quickTypes: {
        INCREMENT: TYPE.INCREMENT;
        INCREMENT_IF_ODD: TYPE.INCREMENT_IF_ODD;
        DECREMENT: TYPE.DECREMENT;
        INCREMENT_ASYNC: TYPE.INCREMENT_ASYNC;
    };
    readonly reducers: {
        count: (state: number, action: any) => number;
    };
    readonly rawSelectors: {
        count(state: {
            count: number;
        }): number;
    };
    readonly creators: {
        increment: (step?: number) => {
            type: string;
            step: number;
        };
        incrementIfOdd: (step?: number) => {
            type: string;
            step: number;
        };
        decrement: (step?: number) => {
            type: string;
            step: number;
        };
        incrementAsync: () => {
            type: string;
        };
    };
    readonly step: number;
    saga(): IterableIterator<any>;
}
export {};
