import { Database } from 'minato';
interface Perf {
    id: number;
    text: string;
    number: number;
}
interface PerfNested {
    id: number;
    meta: {
        label: string;
        score: number;
    };
    items: {
        value: string;
        index: number;
    }[];
}
declare module 'minato' {
    interface Tables {
        perf: Perf;
        perfNested: PerfNested;
    }
}
declare function PerformanceTests(database: Database): void;
export default PerformanceTests;
