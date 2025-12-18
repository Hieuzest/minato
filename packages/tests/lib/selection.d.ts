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
interface Tables {
    foo: Foo;
    bar: Bar;
}
declare function SelectionTests(database: Database<Tables>): void;
declare namespace SelectionTests {
    function sort(database: Database<Tables>): void;
    function project(database: Database<Tables>): void;
    function aggregate(database: Database<Tables>): void;
    function group(database: Database<Tables>): void;
    function join(database: Database<Tables>): void;
    function subquery(database: Database<Tables>): void;
}
export default SelectionTests;
