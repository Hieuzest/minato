import { Database, Tables } from 'minato';
export declare function setup<K extends keyof Tables>(database: Database, name: K, table: Partial<Tables[K]>[]): Promise<Tables[K][]>;
