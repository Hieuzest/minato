import { Database } from 'minato';
interface Foo {
    id?: number;
    text?: string;
    value?: number;
    bool?: boolean;
    list?: number[];
    timestamp?: Date;
    date?: Date;
    time?: Date;
    regex?: string;
}
declare module 'minato' {
    interface Tables {
        temp1: Foo;
    }
}
declare function QueryOperators(database: Database): void;
declare namespace QueryOperators {
    interface QueryOptions {
        nullableComparator?: boolean;
    }
    export const comparison: (database: Database, options?: QueryOptions) => void;
    export const existence: (database: Database) => void;
    export const membership: (database: Database) => void;
    interface RegExpOptions {
        regexBy?: boolean;
        regexFor?: boolean;
    }
    export const regexp: (database: Database, options?: RegExpOptions) => void;
    export const bitwise: (database: Database) => void;
    interface ListOptions {
        size?: boolean;
        element?: boolean;
        elementQuery?: boolean;
    }
    export const list: (database: Database, options?: ListOptions) => void;
    export const evaluation: (database: Database) => void;
    namespace Logical {
        const queryLevel: (database: Database) => void;
        const fieldLevel: (database: Database) => void;
    }
    export const logical: typeof Logical;
    export {};
}
export default QueryOperators;
