import { Database } from 'minato';
interface ObjectModel {
    id: string;
    meta?: {
        a?: string;
        embed?: {
            b?: number;
            c?: string;
            d?: {
                foo?: number;
                bar?: object;
            };
        };
    };
}
declare module 'minato' {
    interface Tables {
        object: ObjectModel;
    }
}
declare function ObjectOperations(database: Database): void;
declare namespace ObjectOperations {
    const create: (database: Database) => void;
    const get: (database: Database) => void;
    const upsert: (database: Database) => void;
    const modify: (database: Database) => void;
    const misc: (database: Database) => void;
}
export default ObjectOperations;
