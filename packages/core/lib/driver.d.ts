import { Awaitable, Dict } from 'cosmokit';
import { Context, Service } from 'cordis';
import { Eval, Update } from './eval.ts';
import { Direction, Modifier, Selection } from './selection.ts';
import { Field, Model, Relation } from './model.ts';
import { Database } from './database.ts';
import { FlatKeys, Keys, Values } from './utils.ts';
export declare namespace Driver {
    interface Stats {
        size: number;
        tables: Dict<TableStats>;
    }
    interface TableStats {
        count: number;
        size: number;
    }
    type Cursor<K extends string = string, S = any, T extends Keys<S> = any> = K[] | CursorOptions<K, S, T>;
    interface CursorOptions<K extends string = string, S = any, T extends Keys<S> = any> {
        limit?: number;
        offset?: number;
        fields?: K[];
        sort?: Partial<Dict<Direction, FlatKeys<S[T]>>>;
        include?: Relation.Include<S[T], Values<S>>;
    }
    interface WriteResult {
        inserted?: number;
        matched?: number;
        modified?: number;
        removed?: number;
    }
    interface IndexDef<K extends string = string> {
        name?: string;
        keys: {
            [P in K]?: 'asc' | 'desc';
        };
    }
    interface Index<K extends string = string> extends IndexDef<K> {
        unique?: boolean;
    }
    interface Transformer<S = any, T = any> {
        types: Field.Type<S>[];
        dump: (value: S | null) => T | null | void;
        load: (value: T | null) => S | null | void;
    }
}
export declare namespace Driver {
    type Constructor<T> = new (ctx: Context, config: T) => Driver<T>;
}
export declare abstract class Driver<T = any> {
    ctx: Context;
    config: T;
    abstract start(): Promise<void>;
    abstract stop(): Promise<void>;
    abstract drop(table: string): Promise<void>;
    abstract dropAll(): Promise<void>;
    abstract stats(): Promise<Partial<Driver.Stats>>;
    abstract prepare(name: string): Promise<void>;
    abstract get(sel: Selection.Immutable, modifier: Modifier): Promise<any>;
    abstract eval(sel: Selection.Immutable, expr: Eval.Expr): Promise<any>;
    abstract set(sel: Selection.Mutable, data: Update): Promise<Driver.WriteResult>;
    abstract remove(sel: Selection.Mutable): Promise<Driver.WriteResult>;
    abstract create(sel: Selection.Mutable, data: any): Promise<any>;
    abstract upsert(sel: Selection.Mutable, data: any[], keys: string[]): Promise<Driver.WriteResult>;
    abstract withTransaction(callback: (session?: any) => Promise<void>): Promise<void>;
    abstract getIndexes(table: string): Promise<Driver.Index[]>;
    abstract createIndex(table: string, index: Driver.Index): Promise<void>;
    abstract dropIndex(table: string, name: string): Promise<void>;
    database: Database;
    types: Dict<Driver.Transformer>;
    tables: Set<string>;
    constructor(ctx: Context, config: T);
    [Service.init](): AsyncGenerator<() => void, void, unknown>;
    model<S = any>(table: string | Selection.Immutable | Dict<string | Selection.Immutable>): Model<S>;
    protected migrate(name: string, hooks: MigrationHooks): Promise<void>;
    define<S, T>(converter: Driver.Transformer<S, T>): void;
    _ensureSession(): Promise<void>;
    prepareIndexes(table: string): Promise<void>;
}
export interface MigrationHooks {
    before: (keys: string[]) => boolean;
    after: (keys: string[]) => void;
    finalize: () => Awaitable<void>;
    error: (reason: any) => void;
}
