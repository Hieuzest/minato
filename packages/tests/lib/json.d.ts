import { Database } from 'minato';
interface Foo {
    id: number;
    value: number;
}
interface Bar {
    id: number;
    uid: number;
    pid: number;
    value: number;
    s: string;
    obj: {
        x: number;
        y: string;
        z: string;
        o: {
            a: number;
            b: string;
        };
    };
    l: string[];
    la: string[];
}
interface Baz {
    id: number;
    nums: number[];
}
interface Bax {
    id: number;
    array: {
        text: string;
    }[];
    object: {
        num: number;
    };
}
interface Tables {
    foo: Foo;
    bar: Bar;
    baz: Baz;
    bax: Bax;
}
declare function JsonTests(database: Database<Tables>): void;
declare namespace JsonTests {
    interface RelationOptions {
        nullableComparator?: boolean;
    }
    function query(database: Database<Tables>, options?: RelationOptions): void;
    function modify(database: Database<Tables>): void;
    function selection(database: Database<Tables>): void;
}
export default JsonTests;
