import { memorize } from "./helper";
declare type GLOBAL_SELECTOR<T> = T extends (state: any, ...rest: infer U) => infer K ? (globalState: any, ...rest: U) => K : never;
declare type GLOBAL_SELECTORS<T> = {
    [key in keyof T]: GLOBAL_SELECTOR<T[key]>;
};
export interface DuckOptions {
    namespace: string;
    selector(globalState: any): any;
    route: string;
}
export declare type TYPES<T> = {
    readonly [P in keyof T]: string;
};
export default abstract class BaseDuck {
    protected options: DuckOptions;
    protected id: string;
    constructor(options?: DuckOptions);
    protected readonly actionTypePrefix: string;
    protected readonly _cacheGetters: string[];
    private _makeCacheGetters;
    readonly types: TYPES<this["quickTypes"]> & this["rawTypes"];
    readonly quickTypes: {};
    readonly rawTypes: {};
    protected makeTypes<T>(typeEnum: T): TYPES<T>;
    abstract readonly reducer: any;
    readonly State: ReturnType<this["reducer"]>;
    readonly selector: (globalState: any) => this["State"];
    readonly selectors: GLOBAL_SELECTORS<this["rawSelectors"]>;
    readonly rawSelectors: {};
    readonly localSelectors: this["rawSelectors"];
    readonly creators: {};
    saga(): IterableIterator<any>;
    readonly sagas: any[];
    static memorize: typeof memorize;
}
export {};
