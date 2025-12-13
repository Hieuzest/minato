import { Context } from 'cordis';
import { Driver } from 'minato';
export type MemoryDriver = Driver & {
    new (ctx: Context): MemoryDriver;
    name: string;
    Config: {};
};
declare const MemoryDriver: MemoryDriver;
export default MemoryDriver;
