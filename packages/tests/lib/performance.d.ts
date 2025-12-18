import { Database } from 'minato';
interface Perf {
    id: number;
    text: string;
    number: number;
}
interface Tables {
    perf: Perf;
}
declare function PerformanceTests(database: Database<Tables>): void;
export default PerformanceTests;
