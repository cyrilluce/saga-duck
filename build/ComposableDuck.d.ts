import { DuckOptions } from "./BaseDuck";
import Duck, { COMBINE_REDUCERS } from "./Duck";
declare type DuckType<T extends Duck> = {
    new (options?: DuckOptions): T;
};
declare type DUCKS_REDUCERS<T extends Record<string, Duck>> = {
    [key in keyof T]: T[key]["reducer"];
};
declare type DUCKS<T extends Record<string, DuckType<Duck>>> = {
    [key in keyof T]: InstanceType<T[key]>;
};
export default class ComposableDuck extends Duck {
    protected readonly _cacheGetters: string[];
    protected getSubDuckOptions(route: string): DuckOptions;
    protected makeDucks<T extends Record<string, DuckType<Duck>>>(ducks: T): DUCKS<T>;
    readonly ducks: DUCKS<this["quickDucks"]> & this["rawDucks"];
    readonly quickDucks: {};
    readonly rawDucks: {};
    readonly reducer: COMBINE_REDUCERS<this["reducers"] & DUCKS_REDUCERS<this["ducks"]>>;
    private ducksSaga;
    saga(): IterableIterator<any>;
}
export {};
