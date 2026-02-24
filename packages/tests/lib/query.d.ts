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
interface Tables {
    temp1: Foo;
}
declare function QueryOperators(database: Database<Tables>): void;
declare namespace QueryOperators {
    interface QueryOptions {
        nullableComparator?: boolean;
    }
    export const comparison: (database: Database<Tables>, options?: QueryOptions) => void;
    export const existence: (database: Database<Tables>) => void;
    export const membership: (database: Database<Tables>) => void;
    interface RegExpOptions {
        regexBy?: boolean;
        regexFor?: boolean;
    }
    export const regexp: (database: Database<Tables>, options?: RegExpOptions) => void;
    export const bitwise: (database: Database<Tables>) => void;
    interface ListOptions {
        size?: boolean;
        element?: boolean;
        elementQuery?: boolean;
    }
    export const list: (database: Database<Tables>, options?: ListOptions) => void;
    export const evaluation: (database: Database<Tables>) => void;
    namespace Logical {
        const queryLevel: (database: Database<Tables>) => void;
        const fieldLevel: (database: Database<Tables>) => void;
    }
    export const logical: typeof Logical;
    export {};
}
export default QueryOperators;
