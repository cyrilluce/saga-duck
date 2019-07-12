import { StatelessComponent, ComponentClass } from "react";
export declare function shouldComponentUpdate(instance: any, props: any, state: any): boolean;
export interface PurifyType {
    <T>(component: StatelessComponent<T>): ComponentClass<T>;
    <T, C extends ComponentClass<T>>(component: C): C;
}
export declare const purify: PurifyType;
