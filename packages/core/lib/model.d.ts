import { MaybeArray } from 'cosmokit';
import { Context } from 'cordis';
import { Eval, Update } from './eval.ts';
import { DeepPartial, FlatKeys, Flatten, Keys, Row } from './utils.ts';
import { Type } from './type.ts';
import { Driver } from './driver.ts';
import { Query } from './query.ts';
import { Selection } from './selection.ts';
import { Create } from './database.ts';
import { Types } from './index.ts';
declare const Primary: unique symbol;
export type Primary = (string | number) & {
    [Primary]: true;
};
export declare namespace Relation {
    const Marker: unique symbol;
    export type Marker = {
        [Marker]: true;
    };
    export const Type: readonly ["oneToOne", "oneToMany", "manyToOne", "manyToMany"];
    export type Type = typeof Type[number];
    export interface Config<S extends any = any, T extends Keys<S> = Keys<S>, K extends string = string> {
        type: Type;
        table: T;
        references: Keys<S[T]>[];
        fields: K[];
        shared: Record<K, Keys<S[T]>>;
        required: boolean;
    }
    export interface Definition<K extends string = string> {
        type: 'oneToOne' | 'manyToOne' | 'manyToMany';
        table?: string;
        target?: string;
        references?: MaybeArray<string>;
        fields?: MaybeArray<K>;
        shared?: MaybeArray<K> | Partial<Record<K, string>>;
    }
    export type Include<T, S> = boolean | {
        [P in keyof T]?: T[P] extends MaybeArray<infer U> | undefined ? U extends S ? Include<U, S> : (U extends (infer I)[] ? Query.Expr<I> : never) : never;
    };
    export type SetExpr<S extends object = any> = ((row: Row<S>) => Update<S>) | {
        where: Query.Expr<Flatten<S>> | Selection.Callback<S, boolean>;
        update: Row.Computed<S, Update<S>>;
    };
    export interface Modifier<T extends object = any, S extends any = any> {
        $create?: MaybeArray<Create<T, S>>;
        $upsert?: MaybeArray<DeepPartial<T>>;
        $set?: MaybeArray<SetExpr<T>>;
        $remove?: Query.Expr<Flatten<T>> | Selection.Callback<T, boolean>;
        $connect?: Query.Expr<Flatten<T>> | Selection.Callback<T, boolean>;
        $disconnect?: Query.Expr<Flatten<T>> | Selection.Callback<T, boolean>;
    }
    export function buildAssociationTable(...tables: [string, string]): string;
    export function buildAssociationKey(key: string, table: string): string;
    export function buildSharedKey(field: string, reference: string): string;
    export function parse(def: Definition, key: string, model: Model, relModel: Model, subprimary?: boolean): [Config, Config];
    export {};
}
export interface Field<T = any> {
    type: Type<T>;
    deftype?: Field.Type<T>;
    length?: number;
    nullable?: boolean;
    initial?: T;
    precision?: number;
    scale?: number;
    expr?: Eval.Expr;
    legacy?: string[];
    deprecated?: boolean;
    relation?: Relation.Config;
    transformers?: Driver.Transformer[];
}
export declare namespace Field {
    export const number: Type[];
    export const string: Type[];
    export const boolean: Type[];
    export const date: Type[];
    export const object: Type[];
    export type Type<T = any> = T extends Primary ? 'primary' : T extends number ? 'integer' | 'unsigned' | 'float' | 'double' | 'decimal' : T extends string ? 'char' | 'string' | 'text' : T extends boolean ? 'boolean' : T extends Date ? 'timestamp' | 'date' | 'time' : T extends ArrayBuffer ? 'binary' : T extends bigint ? 'bigint' : T extends unknown[] ? 'list' | 'json' | 'oneToMany' | 'manyToMany' : T extends object ? 'json' | 'oneToOne' | 'manyToOne' : 'expr';
    type Shorthand<S extends string> = S | `${S}(${any})`;
    export type Object<T = any> = {
        type: 'object';
        inner?: Extension<T>;
    } & Omit<Field<T>, 'type'>;
    export type Array<T = any> = {
        type: 'array';
        inner?: Literal<T> | Definition<T> | Transform<T, any>;
    } & Omit<Field<T[]>, 'type'>;
    export type Transform<S = any, T = S> = {
        type: Type<T> | Keys<Types, T> | NewType<T> | 'object' | 'array';
        dump: (value: S | null) => T | null | void;
        load: (value: T | null) => S | null | void;
        initial?: S;
    } & Omit<Definition<T>, 'type' | 'initial'>;
    export type Definition<T> = (Omit<Field<T>, 'type'> & {
        type: Type<T> | Keys<Types, T> | NewType<T>;
    }) | (T extends object ? Object<T> : never) | (T extends (infer I)[] ? Array<I> : never);
    export type Literal<T> = Shorthand<Type<T>> | Keys<Types, T> | NewType<T> | (T extends object ? 'object' : never) | (T extends unknown[] ? 'array' : never);
    export type Parsable<T = any> = {
        type: Type<T> | Field<T>['type'];
    } & Omit<Field<T>, 'type'>;
    type MapField<O = any> = {
        [K in keyof O]?: Literal<O[K]> | Definition<O[K]> | Transform<O[K], any> | (O[K] extends object | undefined ? Relation.Definition<FlatKeys<O>> : never);
    };
    export type Extension<O = any> = MapField<Flatten<O>>;
    const NewType: unique symbol;
    export type NewType<T> = string & {
        [NewType]: T;
    };
    export type Config<O = any> = {
        [K in keyof O]?: Field<O[K]>;
    };
    export function parse(source: string | Parsable): Field;
    export function getInitial(type: Field.Type, initial?: any): any;
    export function available(field?: Field): boolean;
    export {};
}
export declare namespace Model {
    type Migration<D = any> = (database: D) => Promise<void>;
    interface Config<K extends string = string> {
        callback?: Migration;
        autoInc: boolean;
        primary: MaybeArray<K>;
        unique: MaybeArray<K>[];
        indexes: (MaybeArray<K> | Driver.IndexDef<K>)[];
        foreign: {
            [P in K]?: [string, string];
        };
    }
    interface Intercept<S> extends Partial<Config<FlatKeys<S>>> {
        create?: boolean;
        fields: Field.Extension<S>;
    }
}
export interface Model extends Model.Config {
}
export declare class Model<S = any> {
    name: string;
    ctx?: Context;
    indexes: Driver.Index<FlatKeys<S>>[];
    fields: Field.Config<S>;
    migrations: Map<Model.Migration<any>, string[]>;
    private type;
    constructor(name: string);
    extend(fields: Field.Extension<S>, config?: Partial<Model.Config>): void;
    private parseIndex;
    private checkIndex;
    resolveValue(field: string | Field | Type, value: any): any;
    resolveModel(obj: any, model?: Type): any;
    format(source: object, strict?: boolean, prefix?: string, result?: S): any;
    parse(source: object, strict?: boolean, prefix?: string, result?: S): any;
    create(data?: {}): any;
    availableFields(): import("cosmokit").Dict<Field<S[K]> | undefined, string>;
    getType(): Type<S>;
    getType(key: string): Type | undefined;
}
export {};
