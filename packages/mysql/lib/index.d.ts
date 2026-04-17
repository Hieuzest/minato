import type { Pool, PoolConfig } from 'mysql';
import { Driver, Eval, Selection } from 'minato';
import { MySQLBuilder } from './builder';
import z from 'schemastery';
declare module 'mysql' {
    interface UntypedFieldInfo {
        packet: UntypedFieldInfo;
    }
}
export declare class MySQLDriver extends Driver<MySQLDriver.Config> {
    static name: string;
    pool: Pool;
    sql: MySQLBuilder;
    private session?;
    private _compat;
    private _queryTasks;
    start(): Promise<void>;
    stop(): Promise<void>;
    /** synchronize table schema */
    prepare(name: string): Promise<any>;
    _joinKeys: (keys: readonly string[]) => string;
    _formatValues: (table: string, data: object, keys: readonly string[]) => string;
    _setupCompatFunctions(): Promise<void>;
    query<T = any>(sql: string, debug?: boolean): Promise<T>;
    queue<T = any>(sql: string, values?: any): Promise<T>;
    private _flushTasks;
    _select<T extends {}>(table: string, fields: readonly (string & keyof T)[], conditional?: string, values?: readonly any[]): Promise<T[]>;
    drop(table: string): Promise<void>;
    dropAll(): Promise<void>;
    stats(): Promise<Partial<Driver.Stats>>;
    get(sel: Selection.Immutable): Promise<any>;
    eval(sel: Selection.Immutable, expr: Eval.Expr): Promise<any>;
    set(sel: Selection.Mutable, data: {}): Promise<{
        matched?: undefined;
        modified?: undefined;
    } | {
        matched: any;
        modified: any;
    }>;
    remove(sel: Selection.Mutable): Promise<{
        matched?: undefined;
        removed?: undefined;
    } | {
        matched: any;
        removed: any;
    }>;
    create(sel: Selection.Mutable, data: {}): Promise<any>;
    upsert(sel: Selection.Mutable, data: any[], keys: string[]): Promise<{
        inserted?: undefined;
        matched?: undefined;
        modified?: undefined;
    } | {
        inserted: number;
        matched: any;
        modified: number;
    }>;
    withTransaction(callback: (session: any) => Promise<void>): Promise<void>;
    getIndexes(table: string): Promise<Driver.Index<string>[]>;
    createIndex(table: string, index: Driver.Index): Promise<void>;
    dropIndex(table: string, name: string): Promise<void>;
    private getTypeDef;
    private isDefUpdated;
}
export declare namespace MySQLDriver {
    interface Config extends PoolConfig {
    }
    const Config: z<Config>;
}
export default MySQLDriver;
