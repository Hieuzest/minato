import { Builder } from '@minatojs/sql-utils';
import { Dict } from 'cosmokit';
import { Driver, Field, Model, Selection, Type } from 'minato';
export interface Compat {
    maria?: boolean;
    maria105?: boolean;
    mysql57?: boolean;
    timezone?: string;
}
export declare class MySQLBuilder extends Builder {
    protected driver: Driver;
    private compat;
    protected escapeRegExp: RegExp;
    protected escapeMap: {
        '\0': string;
        '\b': string;
        '\t': string;
        '\n': string;
        '\r': string;
        '\u001A': string;
        '"': string;
        '\'': string;
        '\\': string;
    };
    readonly _localTimezone: string;
    readonly _dbTimezone: string;
    prequeries: string[];
    constructor(driver: Driver, tables?: Dict<Model>, compat?: Compat);
    protected createMemberQuery(key: string, value: any, notStr?: string): string;
    escapePrimitive(value: any, type?: Type): string;
    protected encode(value: string, encoded: boolean, pure?: boolean, type?: Type): string;
    protected createAggr(expr: any, aggr: (value: string) => string, nonaggr?: (value: string) => string, compat?: (value: string) => string): string;
    protected groupArray(value: string): string;
    protected parseSelection(sel: Selection, inline?: boolean): string;
    toUpdateExpr(item: any, key: string, field?: Field, upsert?: boolean): string;
}
