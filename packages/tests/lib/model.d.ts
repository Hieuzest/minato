import { Database } from 'minato';
interface DType {
    id: number;
    text?: string;
    num?: number;
    double?: number;
    decimal?: number;
    int64?: bigint;
    bool?: boolean;
    list?: string[];
    array?: number[];
    object?: {
        text?: string;
        num?: number;
        json?: {
            text?: string;
            num?: number;
        };
        embed?: {
            bool?: boolean;
            bigint?: bigint;
            int64?: bigint;
            custom?: Custom;
            bstr?: string;
        };
    };
    object2?: {
        text?: string;
        num?: number;
        embed?: {
            bool?: boolean;
            bigint?: bigint;
        };
    };
    timestamp?: Date;
    date?: Date;
    time?: Date;
    binary?: ArrayBufferView<ArrayBuffer> | ArrayBuffer;
    bigint?: bigint;
    bnum?: number;
    bnum2?: number;
    text2?: string;
}
interface DObject {
    id: number;
    foo?: {
        nested: DType;
    };
    bar?: {
        nested: DType;
    };
    baz?: {
        nested?: DType;
    }[];
}
interface Custom {
    a: string;
    b: number;
}
interface RecursiveX {
    id: number;
    y?: RecursiveY;
}
interface RecursiveY {
    id: number;
    x?: RecursiveX;
}
interface Tables {
    dtypes: DType;
    dobjects: DObject;
    recurxs: RecursiveX;
}
interface Types {
    bigint2: bigint;
    custom: Custom;
    recurx: RecursiveX;
    recury: RecursiveY;
    string2: string;
}
declare function ModelOperations(database: Database<Tables, Types>): void;
declare namespace ModelOperations {
    interface ModelOptions {
        cast?: boolean;
        typeModel?: boolean;
        aggregateNull?: boolean;
        nullableComparator?: boolean;
    }
    export const fields: (database: Database<Tables, Types>, options?: ModelOptions) => void;
    export const object: (database: Database<Tables, Types>, options?: ModelOptions) => void;
    export {};
}
export default ModelOperations;
