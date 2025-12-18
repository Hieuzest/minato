import { Database } from 'minato';
export declare function setup<S, K extends keyof S & string>(database: Database<S>, name: K, table: Partial<S[K]>[]): Promise<S[K][]>;
