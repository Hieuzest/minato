// src/index.ts
import { SQLiteDriver } from "@minatojs/driver-node-sqlite";
import { z } from "minato";
var MemoryDriver = class MemoryDriver2 extends SQLiteDriver {
  static name = "memory";
  static Config = z.object({});
  constructor(ctx) {
    super(ctx, { path: ":memory:" });
  }
};
var src_default = MemoryDriver;
export {
  MemoryDriver,
  src_default as default
};
//# sourceMappingURL=index.mjs.map
