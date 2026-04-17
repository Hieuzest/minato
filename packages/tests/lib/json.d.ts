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
declare module 'minato' {
    interface Tables {
        'json.foo': Foo;
        'json.bar': Bar;
        'json.baz': Baz;
        'json.bax': Bax;
    }
}
declare function JsonTests(database: Database): void;
declare namespace JsonTests {
    interface RelationOptions {
        nullableComparator?: boolean;
    }
    function query(database: Database, options?: RelationOptions): void;
    function modify(database: Database): void;
    function selection(database: Database): void;
}
export default JsonTests;
