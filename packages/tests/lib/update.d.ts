import { Database } from 'minato';
interface Bar {
    id: number;
    text?: string;
    num?: number;
    double?: number;
    bool?: boolean;
    list?: string[];
    timestamp?: Date;
    date?: Date;
    time?: Date;
    bigtext?: string;
    binary?: ArrayBuffer;
    bigint?: bigint;
}
interface Baz {
    ida: number;
    idb: string;
    value?: string;
}
declare module 'minato' {
    interface Tables {
        temp2: Bar;
        temp3: Baz;
    }
}
declare function OrmOperations(database: Database): void;
declare namespace OrmOperations {
    const create: (database: Database) => void;
    const set: (database: Database) => void;
    const upsert: (database: Database) => void;
    const remove: (database: Database) => void;
    const stats: (database: Database) => void;
    const misc: (database: Database) => void;
    const index: (database: Database) => void;
    const drop: (database: Database) => void;
    function subquery(database: Database): void;
}
export default OrmOperations;
