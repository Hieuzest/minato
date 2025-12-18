import { Database } from 'minato';
import ModelOperations from './model';
import QueryOperators from './query';
import UpdateOperators from './update';
import ObjectOperations from './object';
import Migration from './migration';
import Selection from './selection';
import Json from './json';
import Transaction from './transaction';
import Relation from './relation';
import Performance from './performance';
import './setup';
export { expect } from 'chai';
declare const Keywords: string[];
type Keywords = 'name';
type UnitOptions<T> = (T extends (database: Database, options?: infer R) => any ? R : {}) & {
    [K in keyof T as Exclude<K, Keywords>]?: false | UnitOptions<T[K]>;
};
type OverrideUnitOptions<T> = (T extends (database: Database, options?: infer R) => any ? R : {}) & {
    [K in keyof T as Exclude<K, Keywords>]?: boolean | UnitOptions<T[K]>;
};
type Unit<T> = ((database: Database, options?: UnitOptions<T>, overrideOptions?: OverrideUnitOptions<T>) => void) & {
    [K in keyof T as Exclude<K, Keywords>]: Unit<T[K]>;
};
declare namespace Tests {
    const model: typeof ModelOperations;
    const query: typeof QueryOperators;
    const update: typeof UpdateOperators;
    const object: typeof ObjectOperations;
    const selection: typeof Selection;
    const migration: typeof Migration;
    const json: typeof Json;
    const transaction: typeof Transaction;
    const relation: typeof Relation;
    const performance: typeof Performance;
}
declare const _default: Unit<typeof Tests>;
export default _default;
