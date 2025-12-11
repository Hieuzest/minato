import { Dict } from 'cosmokit';
import { Eval, Model, Query, Selection, Type } from 'minato';
import { Filter } from 'mongodb';
import MongoDriver from '.';
export type ExtractUnary<T> = T extends [infer U] ? U : T;
export type EvalOperators = {
    [K in keyof Eval.Static as `$${K}`]?: (expr: ExtractUnary<Parameters<Eval.Static[K]>>, group?: object) => any;
} & {
    $: (expr: any, group?: object) => any;
};
export declare class Builder {
    private driver;
    private tables;
    virtualKey?: string | undefined;
    recursivePrefix: string;
    private counter;
    table: string;
    walkedKeys: string[];
    pipeline: any[];
    protected lookups: any[];
    evalKey?: string;
    private evalExpr?;
    private refTables;
    private refVirtualKeys;
    private joinTables;
    aggrDefault: any;
    private evalOperators;
    constructor(driver: MongoDriver, tables: string[], virtualKey?: string | undefined, recursivePrefix?: string);
    createKey(): string;
    protected getActualKey(key: string, ref?: string): string;
    private transformEvalExpr;
    private transformAggr;
    flushLookups(): any[];
    eval(expr: any, group?: Dict): any;
    query(sel: Selection.Immutable, query: Query.Expr): Filter<any> | undefined;
    modifier(stages: any[], sel: Selection.Immutable): void;
    protected createSubquery(sel: Selection.Immutable): Builder | undefined;
    select(sel: Selection.Immutable, update?: any): this | undefined;
    dump(value: any, type: Model | Type | Eval.Expr | undefined): any;
    load(value: any, type: Model | Type | Eval.Expr | undefined): any;
    toUpdateExpr(value: any, type: Type | undefined, root?: boolean): any;
}
