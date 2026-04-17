import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { Dict } from 'cosmokit';
import { Driver, Eval, Selection } from 'minato';
import z from 'schemastery';
export declare class MongoDriver extends Driver<MongoDriver.Config> {
    static name: string;
    client: MongoClient;
    db: Db;
    mongo: this;
    version: number;
    private builder;
    private session?;
    private _replSet;
    private _createTasks;
    private connectionStringFromConfig;
    start(): Promise<void>;
    stop(): Promise<void>;
    /**
     * https://www.mongodb.com/docs/manual/indexes/
     */
    private _createIndexes;
    private _createFields;
    private _migrateVirtual;
    private _migratePrimary;
    private _internalTableTask?;
    _createInternalTable(): Promise<any>;
    /** synchronize table schema */
    prepare(table: string): Promise<void>;
    drop(table: string): Promise<void>;
    dropAll(): Promise<void>;
    private _collStats;
    stats(): Promise<{
        size: any;
        tables: {
            [k: string]: {
                readonly count: any;
                readonly size: any;
            };
        };
    }>;
    getVirtualKey(table: string): string | undefined;
    private patchVirtual;
    private unpatchVirtual;
    mapVirtualUpdateKey(key: string, virtualKey?: string): string;
    mapVirtualUpdate(update: Dict, virtualKey?: string, transform?: (value: any, key: string) => any): {
        [k: string]: any;
    };
    private transformQuery;
    get(sel: Selection.Immutable): Promise<any[]>;
    eval(sel: Selection.Immutable, expr: Eval.Expr): Promise<any>;
    set(sel: Selection.Mutable, update: {}): Promise<{
        matched?: undefined;
        modified?: undefined;
    } | {
        matched: number;
        modified: number;
    }>;
    remove(sel: Selection.Mutable): Promise<{
        matched?: undefined;
        removed?: undefined;
    } | {
        matched: number;
        removed: number;
    }>;
    private shouldEnsurePrimary;
    private shouldFillPrimary;
    private ensurePrimary;
    create(sel: Selection.Mutable, data: any): Promise<any>;
    upsert(sel: Selection.Mutable, data: any[], keys: string[]): Promise<{
        inserted?: undefined;
        matched?: undefined;
        modified?: undefined;
    } | {
        inserted: number;
        matched: number;
        modified: number;
    }>;
    withTransaction(callback: (session: any) => Promise<void>): Promise<void>;
    getIndexes(table: string): Promise<Driver.Index<string>[]>;
    createIndex(table: string, index: Driver.Index): Promise<void>;
    dropIndex(table: string, name: string): Promise<void>;
    logPipeline(table: string, pipeline: any): void;
}
export declare namespace MongoDriver {
    interface Config extends MongoClientOptions {
        username?: string;
        password?: string;
        protocol?: string;
        host?: string;
        port?: number;
        /** database name */
        database?: string;
        /** default auth database */
        authDatabase?: string;
        connectOptions?: ConstructorParameters<typeof URLSearchParams>[0];
        /** connection string (will overwrite all configs except 'name') */
        uri?: string;
        /**
         * store single primary key in `_id` field to enhance index performance
         * @default false
         */
        optimizeIndex?: boolean;
    }
    const Config: z<Config>;
}
export default MongoDriver;
