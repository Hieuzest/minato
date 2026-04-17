import { Dict, MaybeArray } from 'cosmokit';
import { Context, Service } from 'cordis';
import { AtomicTypes, DeepPartial, FlatKeys, FlatPick, Flatten, Indexable, Keys, Row, Values } from './utils.ts';
import { Selection } from './selection.ts';
import { Field, Model, Relation } from './model.ts';
import { Driver } from './driver.ts';
import { Eval, Update } from './eval.ts';
import { Query } from './query.ts';
import { Tables, Types } from './index.ts';
type TableLike<S> = Keys<S> | Selection;
type TableType<S, T extends TableLike<S>> = T extends Keys<S> ? S[T] : T extends Selection<infer U> ? U : never;
export declare namespace Join1 {
    export type Input<S> = readonly Keys<S>[];
    export type Output<S, U extends Input<S>> = {
        [P in U[number]]: TableType<S, P>;
    };
    type Parameters<S, U extends Input<S>> = U extends readonly [infer K extends Keys<S>, ...infer R] ? [Row<S[K]>, ...Parameters<S, Extract<R, Input<S>>>] : [];
    export type Predicate<S, U extends Input<S>> = (...args: Parameters<S, U>) => Eval.Expr<boolean>;
    export {};
}
export declare namespace Join2 {
    export type Input<S> = Dict<TableLike<S>>;
    export type Output<S, U extends Input<S>> = {
        [K in keyof U]: TableType<S, U[K]>;
    };
    type Parameters<S, U extends Input<S>> = {
        [K in keyof U]: Row<TableType<S, U[K]>>;
    };
    export type Predicate<S, U extends Input<S>> = (args: Parameters<S, U>) => Eval.Expr<boolean>;
    export {};
}
type CreateUnit<T, S> = T extends Values<AtomicTypes> ? T : T extends (infer I extends Values<S>)[] ? Create<I, S>[] | {
    $literal?: DeepPartial<I>;
    $create?: MaybeArray<Create<I, S>>;
    $upsert?: MaybeArray<Create<I, S>>;
    $connect?: Query.Expr<Flatten<I>>;
} : T extends Values<S> ? Create<T, S> | {
    $literal?: DeepPartial<T>;
    $create?: Create<T, S>;
    $upsert?: Create<T, S>;
    $connect?: Query.Expr<Flatten<T>>;
} : T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? Create<T, S> : T;
export type Create<T, S> = {
    [K in keyof T]?: CreateUnit<T[K], S>;
};
export declare namespace Database {
    interface Intercept {
        tables: (keyof Tables)[] | {
            [K in keyof Tables]?: Model.Intercept<Tables[K]>;
        };
    }
}
export declare class Database extends Service {
    static readonly transact: unique symbol;
    static readonly migrate: unique symbol;
    tables: Dict<Model>;
    drivers: Driver[];
    types: Dict<Field.Transform>;
    private _driver;
    private stashed;
    private prepareTasks;
    migrateTasks: Dict<Promise<void>>;
    constructor(ctx: Context);
    refresh(): void;
    prepared(): Promise<void>;
    private getDriver;
    private prepare;
    extend<K extends Keys<Tables>>(name: K, fields: Field.Extension<Tables[K]>, config?: Partial<Model.Config<FlatKeys<Tables[K]>>>): void;
    private _parseField;
    private parseField;
    define<K extends Exclude<Keys<Types>, Field.Type | 'object' | 'array'>>(name: K, field: Field.Definition<Types[K]> | Field.Transform<Types[K], any>): K;
    define<T>(field: Field.Definition<T> | Field.Transform<T, any>): Field.NewType<T>;
    migrate<K extends Keys<Tables>>(name: K, fields: Field.Extension<Tables[K]>, callback: Model.Migration<this>): void;
    select<T>(table: Selection<T>, query?: Query<T>): Selection<T>;
    select<K extends Keys<Tables>>(table: K, query?: Query<Tables[K]>, include?: Relation.Include<Tables[K], Values<Tables>> | null): Selection<Tables[K]>;
    join<const X extends Join1.Input<Tables>>(tables: X, callback?: Join1.Predicate<Tables, X>, optional?: boolean[]): Selection<Join1.Output<Tables, X>>;
    join<X extends Join2.Input<Tables>>(tables: X, callback?: Join2.Predicate<Tables, X>, optional?: Dict<boolean, Keys<X>>): Selection<Join2.Output<Tables, X>>;
    get<K extends Keys<Tables>>(table: K, query: Query<Tables[K]>): Promise<Tables[K][]>;
    get<K extends Keys<Tables>, P extends FlatKeys<Tables[K]> = any>(table: K, query: Query<Tables[K]>, cursor?: Driver.Cursor<P, Tables, K>): Promise<FlatPick<Tables[K], P>[]>;
    eval<K extends Keys<Tables>, T>(table: K, expr: Selection.Callback<Tables[K], T, true>, query?: Query<Tables[K]>): Promise<T>;
    set<K extends Keys<Tables>>(table: K, query: Query<Tables[K]>, update: Row.Computed<Tables[K], Update<Tables[K]>>): Promise<Driver.WriteResult>;
    remove<K extends Keys<Tables>>(table: K, query: Query<Tables[K]>): Promise<Driver.WriteResult>;
    create<K extends Keys<Tables>>(table: K, data: Create<Tables[K], Tables>): Promise<Tables[K]>;
    upsert<K extends Keys<Tables>>(table: K, upsert: Row.Computed<Tables[K], Update<Tables[K]>[]>, keys?: MaybeArray<FlatKeys<Tables[K], Indexable>>): Promise<Driver.WriteResult>;
    makeProxy(marker: any, getDriver?: (driver: Driver, database: this) => Driver): this;
    withTransaction(callback: (database: this) => Promise<void>): Promise<any>;
    transact<T>(callback: (database: this) => Promise<T>): Promise<any>;
    stopAll(): Promise<void>;
    drop<K extends Keys<Tables>>(table: K): Promise<void>;
    dropAll(): Promise<void>;
    stats(): Promise<Driver.Stats>;
    private ensureTransaction;
    private transformRelationQuery;
    private createOrUpdate;
    private processRelationUpdate;
    private hasRelation;
}
export {};
