import { AtomicTypes, Comparable, Flatten, Row, Values } from './utils.ts';
import { Type } from './type.ts';
import { Field, Relation } from './model.ts';
import { Query } from './query.ts';
export declare function isEvalExpr(value: any): value is Eval.Expr;
export declare const isUpdateExpr: (value: any) => boolean;
export declare function isAggrExpr(expr: Eval.Expr): boolean;
export declare function hasSubquery(value: any): boolean;
type UnevalObject<S> = {
    [K in keyof S]?: (undefined extends S[K] ? null : never) | Uneval<Exclude<S[K], undefined>, boolean>;
};
export type Uneval<U, A extends boolean> = U extends Values<AtomicTypes> ? Eval.Term<U, A> : U extends (infer T extends object)[] ? Relation.Modifier<T> | Eval.Array<T, A> : U extends object ? Eval.Expr<U, A> | UnevalObject<Flatten<U>> | Relation.Modifier<U> : any;
export type Eval<U> = U extends Values<AtomicTypes> ? U : U extends Eval.Expr<infer T> ? T : never;
declare const kExpr: unique symbol;
declare const kType: unique symbol;
declare const kAggr: unique symbol;
export declare namespace Eval {
    interface Expr<T = any, A extends boolean = boolean> {
        [kExpr]: true;
        [kType]?: T;
        [kAggr]?: A;
        [Type.kType]?: Type<T>;
    }
    type Any<A extends boolean = boolean> = Comparable | Expr<any, A>;
    type Term<T, A extends boolean = boolean> = T | Expr<T, A>;
    type Array<T, A extends boolean = boolean> = Term<T, A>[] | Expr<T[], A>;
    type Unary<S, R> = <T extends S, A extends boolean>(x: Term<T, A>) => Expr<R, A>;
    type Binary<S, R> = <T extends S, A extends boolean>(x: Term<T, A>, y: Term<T, A>) => Expr<R, A>;
    type Multi<S, R> = <T extends S, A extends boolean>(...args: Term<T, A>[]) => Expr<R, A>;
    interface Aggr<S> {
        <T extends S>(value: Term<T, false>): Expr<T, true>;
        <T extends S, A extends boolean>(value: Array<T, A>): Expr<T, A>;
    }
    interface Branch<T, A extends boolean> {
        case: Term<boolean, A>;
        then: Term<T, A>;
    }
    interface Static {
        <A extends boolean>(key: string, value: any, type: Type): Eval.Expr<any, A>;
        ignoreNull<T, A extends boolean>(value: Eval.Expr<T, A>): Eval.Expr<T, A>;
        select(...args: Any[]): Expr<any[], false>;
        query<T extends object>(row: Row<T>, query: Query.Expr<T>, expr?: Term<boolean>): Expr<boolean, false>;
        if<T extends Comparable, A extends boolean>(cond: Any<A>, vThen: Term<T, A>, vElse: Term<T, A>): Expr<T, A>;
        ifNull<T extends Comparable, A extends boolean>(...args: Term<T, A>[]): Expr<T, A>;
        switch<T, A extends boolean>(branches: Branch<T, A>[], vDefault: Term<T, A>): Expr<T, A>;
        add: Multi<number, number>;
        mul: Multi<number, number>;
        multiply: Multi<number, number>;
        sub: Binary<number, number>;
        subtract: Binary<number, number>;
        div: Binary<number, number>;
        divide: Binary<number, number>;
        mod: Binary<number, number>;
        modulo: Binary<number, number>;
        abs: Unary<number, number>;
        floor: Unary<number, number>;
        ceil: Unary<number, number>;
        round: Unary<number, number>;
        exp: Unary<number, number>;
        log<A extends boolean>(x: Term<number, A>, base?: Term<number, A>): Expr<number, A>;
        pow: Binary<number, number>;
        power: Binary<number, number>;
        random(): Expr<number, false>;
        eq: Multi<Comparable, boolean>;
        ne: Binary<Comparable, boolean>;
        gt: Binary<Comparable, boolean>;
        ge: Binary<Comparable, boolean>;
        gte: Binary<Comparable, boolean>;
        lt: Binary<Comparable, boolean>;
        le: Binary<Comparable, boolean>;
        lte: Binary<Comparable, boolean>;
        in<T extends Comparable, A extends boolean>(x: Term<T, A>, array: Array<T, A>): Expr<boolean, A>;
        in<T extends Comparable, A extends boolean>(x: Term<T, A>[], array: Array<T[], A>): Expr<boolean, A>;
        nin<T extends Comparable, A extends boolean>(x: Term<T, A>, array: Array<T, A>): Expr<boolean, A>;
        nin<T extends Comparable, A extends boolean>(x: Term<T, A>[], array: Array<T[], A>): Expr<boolean, A>;
        concat: Multi<string, string>;
        regex<A extends boolean>(x: Term<string, A>, y: RegExp): Expr<boolean, A>;
        regex<A extends boolean>(x: Term<string, A>, y: Term<string, A>, flags?: string): Expr<boolean, A>;
        and: Multi<boolean, boolean> & Multi<number, number> & Multi<bigint, bigint>;
        or: Multi<boolean, boolean> & Multi<number, number> & Multi<bigint, bigint>;
        not: Unary<boolean, boolean> & Unary<number, number> & Unary<bigint, bigint>;
        xor: Multi<boolean, boolean> & Multi<number, number> & Multi<bigint, bigint>;
        literal<T>(value: T, type?: Type<T> | Field.Type<T> | Field.NewType<T> | string): Expr<T, false>;
        number: Unary<any, number>;
        sum: Aggr<number>;
        avg: Aggr<number>;
        max: Aggr<Comparable>;
        min: Aggr<Comparable>;
        count(value: Any<false>): Expr<number, true>;
        length(value: Any<false>): Expr<number, true>;
        length<A extends boolean>(value: any[] | Expr<any[], A>): Expr<number, A>;
        object<T extends any>(row: Row.Cell<T>): Expr<T, false>;
        object<T extends any>(row: Row<T>): Expr<T, false>;
        array<T>(value: Expr<T, false>): Expr<T[], true>;
        get<T extends object, K extends keyof T, A extends boolean>(x: Term<T, A>, key: K): Expr<T[K], A>;
        get<T extends any, A extends boolean>(x: Array<T, A>, index: Term<number, A>): Expr<T, A>;
    }
}
export declare const Eval: Eval.Static;
export { Eval as $ };
export type Update<T = any> = UnevalObject<Flatten<T>>;
export declare function executeEval(data: any, expr: any): any;
export declare function executeUpdate(data: any, update: any, ref: string): any;
