import { Dict } from 'cosmokit';
import { Driver, Eval, Selection } from 'minato';
import z from 'schemastery';
export declare class MemoryDriver extends Driver<MemoryDriver.Config> {
    static name: string;
    _store: Dict<any[]>;
    _indexes: Dict<Dict<any>>;
    prepare(name: string): Promise<void>;
    start(): Promise<void>;
    $save(name: string): Promise<void>;
    stop(): Promise<void>;
    table(sel: string | Selection.Immutable | Dict<string | Selection.Immutable>, env?: any): any[];
    drop(table: string): Promise<void>;
    dropAll(): Promise<void>;
    stats(): Promise<{
        tables: Dict<{
            name: string;
            count: number;
            size: number;
        }, string>;
        size: number;
    }>;
    get(sel: Selection.Immutable): Promise<any[]>;
    eval(sel: Selection.Immutable, expr: Eval.Expr): Promise<any>;
    set(sel: Selection.Mutable, data: {}): Promise<{
        matched: number;
    }>;
    remove(sel: Selection.Mutable): Promise<{
        removed: number;
        matched: number;
    }>;
    create(sel: Selection.Mutable, data: any): Promise<any>;
    upsert(sel: Selection.Mutable, data: any, keys: string[]): Promise<{
        inserted: number;
        matched: number;
    }>;
    executeSelection(sel: Selection.Immutable, env?: any): any;
    withTransaction(callback: () => Promise<void>): Promise<void>;
    getIndexes(table: string): Promise<any[]>;
    createIndex(table: string, index: Driver.Index): Promise<void>;
    dropIndex(table: string, name: string): Promise<void>;
}
export declare namespace MemoryDriver {
    interface Config {
    }
    const Config: z<Config>;
}
export default MemoryDriver;
