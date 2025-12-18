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
interface Tables {
    temptx: Bar;
}
declare function TransactionOperations(database: Database<Tables>): void;
declare namespace TransactionOperations {
    function commit(database: Database<Tables>): void;
    function abort(database: Database<Tables>): void;
}
export default TransactionOperations;
