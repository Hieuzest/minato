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
interface Tables {
    object: ObjectModel;
}
declare function ObjectOperations(database: Database<Tables>): void;
declare namespace ObjectOperations {
    const create: (database: Database<Tables>) => void;
    const get: (database: Database<Tables>) => void;
    const upsert: (database: Database<Tables>) => void;
    const modify: (database: Database<Tables>) => void;
    const misc: (database: Database<Tables>) => void;
}
export default ObjectOperations;
