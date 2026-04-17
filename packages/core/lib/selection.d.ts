import { Dict } from 'cosmokit';
import { Driver } from './driver.ts';
import { Eval } from './eval.ts';
import { Model } from './model.ts';
import { Query } from './query.ts';
import { FlatKeys, FlatPick, Flatten, Keys, Row } from './utils.ts';
declare module './eval.ts' {
    namespace Eval {
        interface Static {
            exec<S, T>(value: Executable<S, T>): Expr<T>;
        }
    }
}
export type Direction = 'asc' | 'desc';
export interface Modifier {
    limit: number;
    offset: number;
    sort: [Eval.Expr, Direction][];
    group?: string[];
    having: Eval.Expr<boolean>;
    fields?: Dict<Eval.Expr>;
    optional: Dict<boolean>;
}
declare namespace Executable {
    type Action = 'get' | 'set' | 'remove' | 'create' | 'upsert' | 'eval';
    interface Payload {
        type: Action;
        table: string | Selection | Dict<Selection.Immutable>;
        ref: string;
        query: Query.Expr;
        args: any[];
    }
}
interface Executable extends Executable.Payload {
}
declare class Executable<S = any, T = any> {
    readonly row: Row<S>;
    readonly model: Model;
    readonly driver: Driver;
    constructor(driver: Driver, payload: Executable.Payload);
    protected isCallaback(query: any): query is Selection.Callback<S>;
    protected resolveQuery(query?: Query<S>): Query.Expr<S>;
    protected resolveField(field: FieldLike<S> | Eval.Expr): Eval.Expr;
    protected resolveFields(fields: string | string[] | Dict<FieldLike<S>> | FieldCallback): any;
    execute(): Promise<T>;
}
type FieldLike<S = any> = FlatKeys<S> | Selection.Callback<S>;
type FieldType<S, T extends FieldLike<S>> = T extends FlatKeys<S> ? Flatten<S>[T] : T extends Selection.Callback<S> ? Eval<ReturnType<T>> : never;
type FieldMap<S, M extends Dict<FieldLike<S>>> = {
    [K in keyof M]: FieldType<S, M[K]>;
};
type FieldCallback<S = any, M extends Dict<Eval.Term<any>> = any> = (row: Row<S>) => M;
type EvalMap<M extends Dict<Eval.Term<any>>> = {
    [K in keyof M]: Eval<M[K]>;
};
export declare namespace Selection {
    type Callback<S = any, T = any, A extends boolean = boolean> = (row: Row<S>) => Eval.Expr<T, A>;
    interface Immutable extends Executable, Executable.Payload {
        tables: Dict<Model>;
    }
    interface Mutable extends Executable, Executable.Payload {
        tables: Dict<Model>;
        table: string;
    }
}
export interface Selection extends Executable.Payload {
    args: [Modifier];
}
export declare class Selection<S = any> extends Executable<S, S[]> {
    tables: Dict<Model>;
    constructor(driver: Driver<any>, table: string | Selection | Dict<Selection.Immutable>, query?: Query);
    where(query: Query<S>): this;
    limit(limit: number): this;
    limit(offset: number, limit: number): this;
    offset(offset: number): this;
    orderBy(field: FieldLike<S>, direction?: Direction): this;
    groupBy<K extends FlatKeys<S>>(fields: K | readonly K[], query?: Selection.Callback<S, boolean>): Selection<FlatPick<S, K>>;
    groupBy<K extends FlatKeys<S>, U extends Dict<FieldLike<S>>>(fields: K | K[], extra?: U, query?: Selection.Callback<S, boolean>): Selection<FlatPick<S, K> & FieldMap<S, U>>;
    groupBy<K extends FlatKeys<S>, U extends object>(fields: K | K[], extra?: FieldCallback<S, U>, query?: Selection.Callback<S, boolean>): Selection<FlatPick<S, K> & EvalMap<U>>;
    groupBy<K extends Dict<FieldLike<S>>>(fields: K, query?: Selection.Callback<S, boolean>): Selection<FieldMap<S, K>>;
    groupBy<K extends Dict<FieldLike<S>>, U extends Dict<FieldLike<S>>>(fields: K, extra?: U, query?: Selection.Callback<S, boolean>): Selection<FieldMap<S, K & U>>;
    groupBy<K extends Dict<FieldLike<S>>, U extends object>(fields: K, extra?: FieldCallback<S, U>, query?: Selection.Callback<S, boolean>): Selection<FieldMap<S, K> & EvalMap<U>>;
    having(query: Selection.Callback<S, boolean>): this;
    project<K extends FlatKeys<S>>(fields: K | readonly K[]): Selection<FlatPick<S, K>>;
    project<U extends Dict<FieldLike<S>>>(fields: U): Selection<FieldMap<S, U>>;
    project<U extends object>(fields: FieldCallback<S, U>): Selection<EvalMap<U>>;
    join<K extends string, U>(name: K, selection: Selection<U>, callback?: (self: Row<S>, other: Row<U>) => Eval.Expr<boolean>, optional?: boolean): Selection<S & {
        [P in K]: U;
    }>;
    _action(type: Executable.Action, ...args: any[]): Executable<any, any>;
    evaluate<T>(callback: Selection.Callback<S, T, true>): Eval.Expr<T, true>;
    evaluate<K extends Keys<S>>(field: K): Eval.Expr<S[K][], false>;
    evaluate<K extends Keys<S>>(field: K[]): Eval.Expr<any[][], false>;
    evaluate(): Eval.Expr<S[], boolean>;
    execute(): Promise<S[]>;
    execute<K extends FlatKeys<S> = any>(cursor?: Driver.Cursor<K>): Promise<FlatPick<S, K>[]>;
    execute<T>(callback: Selection.Callback<S, T, true>): Promise<T>;
}
export declare namespace Selection {
    function is(sel: any): sel is Selection;
}
export declare function executeSort(data: any[], modifier: Modifier, name: string): any[];
export {};
