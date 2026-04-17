import { Extract } from 'cosmokit';
import { Eval } from './eval.ts';
import { AtomicTypes, Comparable, Flatten, Indexable, RegExpLike, Values } from './utils.ts';
import { Selection } from './selection.ts';
export type Query<T = any> = Query.Expr<Flatten<T>> | Query.Shorthand<Indexable> | Selection.Callback<T, boolean>;
export declare namespace Query {
    export interface FieldExpr<T = any> {
        $or?: Field<T>[];
        $and?: Field<T>[];
        $not?: Field<T>;
        $exists?: boolean;
        $in?: Extract<T, Indexable, T[]>;
        $nin?: Extract<T, Indexable, T[]>;
        $eq?: Extract<T, Comparable>;
        $ne?: Extract<T, Comparable>;
        $gt?: Extract<T, Comparable>;
        $gte?: Extract<T, Comparable>;
        $lt?: Extract<T, Comparable>;
        $lte?: Extract<T, Comparable>;
        $el?: T extends (infer U)[] ? Field<U> : never;
        $size?: Extract<T, any[], number>;
        $regex?: Extract<T, string, string | RegExpLike>;
        $regexFor?: Extract<T, string, string | {
            input: string;
            flags?: string;
        }>;
        $bitsAllClear?: Extract<T, number>;
        $bitsAllSet?: Extract<T, number>;
        $bitsAnyClear?: Extract<T, number>;
        $bitsAnySet?: Extract<T, number>;
        $some?: T extends (infer U)[] ? Query<U> : never;
        $none?: T extends (infer U)[] ? Query<U> : never;
        $every?: T extends (infer U)[] ? Query<U> : never;
    }
    export interface LogicalExpr<T = any> {
        $or?: Expr<T>[];
        $and?: Expr<T>[];
        $not?: Expr<T>;
        /** @deprecated use query callback instead */
        $expr?: Eval.Term<boolean>;
    }
    export type Shorthand<T = any> = Extract<T, Comparable> | Extract<T, Indexable, T[]> | Extract<T, string, RegExp>;
    export type Field<T = any> = FieldExpr<T> | Shorthand<T>;
    type NonNullExpr<T> = T extends Values<AtomicTypes> | any[] ? Field<T> : T extends object ? Expr<Flatten<T>> | Selection.Callback<T, boolean> : Field<T>;
    export type Expr<T = any> = LogicalExpr<T> & {
        [K in keyof T]?: (undefined extends T[K] ? null : never) | NonNullExpr<Exclude<T[K], undefined>>;
    };
    export {};
}
export declare function executeQuery(data: any, query: Query.Expr, ref: string, env?: any): boolean;
