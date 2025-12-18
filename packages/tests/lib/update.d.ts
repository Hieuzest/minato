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
interface Tables {
    temp2: Bar;
    temp3: Baz;
}
declare function OrmOperations(database: Database<Tables>): void;
declare namespace OrmOperations {
    const create: (database: Database<Tables>) => void;
    const set: (database: Database<Tables>) => void;
    const upsert: (database: Database<Tables>) => void;
    const remove: (database: Database<Tables>) => void;
    const stats: (database: Database<Tables>) => void;
    const misc: (database: Database<Tables>) => void;
    const index: (database: Database<Tables>) => void;
    const drop: (database: Database<Tables>) => void;
    function subquery(database: Database<Tables>): void;
}
export default OrmOperations;
