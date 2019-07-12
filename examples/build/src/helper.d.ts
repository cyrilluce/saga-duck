/// <reference types="react" />
export declare function asResult<T>(fn: (...any: any[]) => T, result: any): T;
export declare function reduceFromPayload<T>(actionType: string | number, initialState: T): (state: T, action: {
    type: import("react").ReactText;
    payload?: T;
}) => T;
export declare function createToPayload<T>(actionType: string | number): (payload: T) => {
    type: import("react").ReactText;
    payload: T;
};
export declare function memorize<T>(fn: (duck: any, dispatch: any) => T): (reactInstanceOrProps: any) => T;
export declare function generateId(prefix?: string): string;
