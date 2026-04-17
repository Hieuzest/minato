import { Field } from './model.ts';
import { Eval } from './eval.ts';
export interface Type<T = any, N = any> {
    [Type.kType]?: true;
    type: Field.Type<T>;
    inner?: T extends (infer I)[] ? Type<I, N> : Field.Type<T> extends 'json' ? {
        [key in keyof T]: Type<T[key], N>;
    } : never;
    array?: boolean;
    ignoreNull?: boolean;
}
export declare namespace Type {
    export const kType: unique symbol;
    export const Any: Type;
    export const Boolean: Type<boolean>;
    export const Number: Type<number>;
    export const String: Type<string>;
    type Extract<T> = T extends Type<infer I> ? I : T extends Field<infer I> ? I : T extends Field.Type<infer I> ? I : T extends Eval.Term<infer I> ? I : never;
    export type Object<T = any> = Type<T>;
    export const Object: <T extends any>(obj?: T) => Object<{ [K in keyof T]: Extract<T>; }>;
    export type Array<T = any> = Type<T[]>;
    export const Array: <T>(type?: Type<T>) => Type.Array<T>;
    export function fromPrimitive<T>(value: T): Type<T>;
    export function fromField<T, N>(field: any): Type<T, N>;
    export function fromTerm<T>(value: Eval.Term<T>, initial?: Type): Type<T>;
    export function fromTerms(values: Eval.Term<any>[], initial?: Type): Type;
    export function isType(value: any): value is Type;
    export function isArray(type?: Type): boolean | undefined;
    export function getInner(type?: Type, key?: string): Type | undefined;
    export function transform<T = any>(value: any, type: Type, callback: (value: any, type?: Type) => T): any;
    export {};
}
