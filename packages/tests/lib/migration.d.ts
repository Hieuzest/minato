import { Database } from 'minato';
interface Qux {
    id: number;
    text: string;
    number: number;
    value: number;
    flag: boolean;
    obj: object;
}
interface Qux2 {
    id: number;
    flag: boolean;
}
interface Tables {
    qux: Qux;
    qux2: Qux2;
}
declare function MigrationTests(database: Database<Tables>): void;
export default MigrationTests;
