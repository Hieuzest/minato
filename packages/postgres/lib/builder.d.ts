import { Builder } from '@minatojs/sql-utils';
import { Dict } from 'cosmokit';
import { Driver, Field, Model, RegExpLike, Selection, Type } from 'minato';
export declare function escapeId(value: string): string;
export declare function formatTime(time: Date): string;
export declare class PostgresBuilder extends Builder {
    protected driver: Driver;
    tables?: Dict<Model> | undefined;
    protected escapeMap: {
        "'": string;
    };
    protected $true: string;
    protected $false: string;
    constructor(driver: Driver, tables?: Dict<Model> | undefined);
    upsert(table: string): void;
    protected binary(operator: string, eltype?: true | string): ([left, right]: [any, any]) => string;
    private transformType;
    parseEval(expr: any, outtype?: boolean | string): string;
    protected createRegExpQuery(key: string, value: string | RegExpLike): string;
    protected createElementQuery(key: string, value: any): string;
    protected createMemberQuery(key: string, value: any, notStr?: string): string;
    protected createAggr(expr: any, aggr: (value: string) => string, nonaggr?: (value: string) => string, eltype?: string): string;
    protected transformJsonField(obj: string, path: string): string;
    protected listContains(list: any, value: string): string;
    protected jsonLength(value: string): string;
    protected jsonContains(obj: string, value: string): string;
    protected encode(value: string, encoded: boolean, pure?: boolean, type?: Type, outtype?: true | string): string;
    protected groupObject(_fields: any): string;
    protected groupArray(value: string): string;
    protected parseSelection(sel: Selection, inline?: boolean): string;
    escapeId: typeof escapeId;
    escapeKey(value: string): string;
    escapePrimitive(value: any, type?: Type): string;
    toUpdateExpr(item: any, key: string, field?: Field, upsert?: boolean): string;
}
