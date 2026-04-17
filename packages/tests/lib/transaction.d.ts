import { Database } from 'minato';
interface Bar {
    id: number;
    text?: string;
    num?: number;
    bool?: boolean;
    list?: string[];
    timestamp?: Date;
    date?: Date;
    time?: Date;
}
declare module 'minato' {
    interface Tables {
        temptx: Bar;
    }
}
declare function TransactionOperations(database: Database): void;
declare namespace TransactionOperations {
    function commit(database: Database): void;
    function abort(database: Database): void;
}
export default TransactionOperations;
