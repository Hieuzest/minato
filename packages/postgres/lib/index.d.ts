import postgres from 'postgres';
import { Driver, Eval, Selection } from 'minato';
import { PostgresBuilder } from './builder';
import z from 'schemastery';
export declare class PostgresDriver extends Driver<PostgresDriver.Config> {
    static name: string;
    postgres: postgres.Sql;
    sql: PostgresBuilder;
    private session?;
    private _counter;
    private _queryTasks;
    start(): Promise<void>;
    stop(): Promise<void>;
    query<T extends any[] = any[]>(sql: string): Promise<postgres.RowList<T>>;
    queue<T extends any[] = any[]>(sql: string, values?: any): Promise<T>;
    private _flushTasks;
    prepare(name: string): Promise<any>;
    drop(table: string): Promise<void>;
    dropAll(): Promise<void>;
    stats(): Promise<Partial<Driver.Stats>>;
    get(sel: Selection.Immutable): Promise<any[]>;
    eval(sel: Selection.Immutable, expr: Eval.Expr<any, boolean>): Promise<any>;
    set(sel: Selection.Mutable, data: {}): Promise<{
        matched?: undefined;
    } | {
        matched: number;
    }>;
    remove(sel: Selection.Mutable): Promise<{
        matched?: undefined;
        removed?: undefined;
    } | {
        matched: number;
        removed: number;
    }>;
    create(sel: Selection.Mutable, data: any): Promise<any>;
    upsert(sel: Selection.Mutable, data: any[], keys: string[]): Promise<{
        inserted?: undefined;
        matched?: undefined;
    } | {
        inserted: number;
        matched: number;
    }>;
    withTransaction(callback: (session: any) => Promise<void>): Promise<void>;
    getIndexes(table: string): Promise<Driver.Index<string>[]>;
    createIndex(table: string, index: Driver.Index): Promise<void>;
    dropIndex(table: string, name: string): Promise<void>;
    _parseIndexDef(def: string): {};
    private getTypeDef;
    private isDefUpdated;
}
export declare namespace PostgresDriver {
    interface Config<T extends Record<string, postgres.PostgresType> = {}> extends postgres.Options<T> {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    }
    const Config: z<Config>;
}
export default PostgresDriver;
