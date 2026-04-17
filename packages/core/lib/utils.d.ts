import { Intersect } from 'cosmokit';
import { Eval } from './eval.ts';
export type Values<S> = S[keyof S];
export type Keys<O, T = any> = Values<{
    [P in keyof O]: O[P] extends T | undefined ? P : never;
}> & string;
export type FlatKeys<O, T = any> = Keys<Flatten<O>, T>;
export type FlatPick<O, K extends FlatKeys<O>> = {
    [P in string & keyof O as K extends P | `${P}.${any}` ? P : never]: P extends K ? O[P] : FlatPick<O[P], Extract<K extends `${any}.${infer R}` ? R : never, FlatKeys<O[P]>>>;
};
export type DeepPartial<T> = T extends Values<AtomicTypes> ? T : T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;
export interface AtomicTypes {
    Number: number;
    String: string;
    Boolean: boolean;
    BigInt: bigint;
    Symbol: symbol;
    Date: Date;
    RegExp: RegExp;
    Function: Function;
    ArrayBuffer: ArrayBuffer;
    SharedArrayBuffer: SharedArrayBuffer;
}
export type Indexable = string | number | bigint;
export type Comparable = string | number | boolean | bigint | Date;
type FlatWrap<S, A extends 0[], P extends string> = {
    [K in P]: S;
} | (S extends Values<AtomicTypes> ? never : S extends any[] ? never : string extends keyof S ? never : A extends [0, ...infer R extends 0[]] ? FlatMap<S, R, `${P}.`> : never);
type FlatMap<S, T extends 0[], P extends string = ''> = Values<{
    [K in keyof S & string as `${P}${K}`]: FlatWrap<S[K], T, `${P}${K}`>;
}>;
type Sequence<N extends number, A extends 0[] = []> = A['length'] extends N ? A : Sequence<N, [0, ...A]>;
export type Flatten<S, D extends number = 5> = Intersect<FlatMap<S, Sequence<D>>>;
type DotPrefix<K extends string> = K extends `${infer F}.${string}` ? F : never;
export type Row<S> = string extends keyof S ? {
    [K in keyof S]-?: Row.Cell<NonNullable<S[K]>>;
} : {
    [K in keyof S as K extends `${string}.${string}` ? never : K]-?: Row.Cell<NonNullable<S[K]>>;
} & {
    [P in DotPrefix<keyof S & string>]: Row<{
        [K in keyof S & string as K extends `${P}.${infer R}` ? R : never]: S[K];
    }>;
};
export declare namespace Row {
    type Cell<T> = Eval.Expr<T, false> & (T extends Comparable ? {} : Row<T>);
    type Computed<S, T> = T | ((row: Row<S>) => T);
}
export declare function isComparable(value: any): value is Comparable;
export declare function isFlat(value: any): value is Values<AtomicTypes>;
export declare function randomId(): string;
export interface RegExpLike {
    source: string;
    flags?: string;
}
export declare function makeRegExp(source: string | RegExpLike, flags?: string): RegExp;
export declare function unravel(source: object, init?: (value: any) => any): {};
export declare function flatten(source: object, prefix?: string, ignore?: (value: any) => boolean): {};
export declare function getCell(row: any, path: any): any;
export declare function isEmpty(value: any): boolean;
export {};
