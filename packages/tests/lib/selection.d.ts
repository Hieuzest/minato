import { Database } from 'minato';
interface Foo {
    id: number;
    value: number;
    deprecated: number;
}
interface Bar {
    id: number;
    uid: number;
    pid: number;
    value: number;
}
declare module 'minato' {
    interface Tables {
        foo: Foo;
        bar: Bar;
    }
}
declare function SelectionTests(database: Database): void;
declare namespace SelectionTests {
    function sort(database: Database): void;
    function project(database: Database): void;
    function aggregate(database: Database): void;
    function group(database: Database): void;
    function join(database: Database): void;
    function subquery(database: Database): void;
}
export default SelectionTests;
