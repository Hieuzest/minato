export declare namespace RuntimeError {
    type Code = 'duplicate-entry' | 'unsupported-expression';
}
export declare class RuntimeError<T extends RuntimeError.Code> extends Error {
    code: T;
    name: string;
    constructor(code: T, message?: string);
    static check<T extends RuntimeError.Code>(error: any, code?: RuntimeError.Code): error is RuntimeError<T>;
}
