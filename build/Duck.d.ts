import BaseDuck from './BaseDuck';
export declare type COMBINE_REDUCERS<T extends {
    [key: string]: () => any;
}> = (state: STATE_OF_REDUCERS<T>, action: any) => STATE_OF_REDUCERS<T>;
declare type STATE_OF_REDUCERS<REDUCERS extends {
    [key: string]: () => any;
}> = {
    [key in keyof REDUCERS]: ReturnType<REDUCERS[key]>;
};
export default class Duck extends BaseDuck {
    readonly reducers: {};
    readonly reducer: COMBINE_REDUCERS<this['reducers']>;
}
export {};
