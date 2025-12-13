// src/index.ts
import SQLiteDriver from "@minatojs/driver-node-sqlite";
import { z } from "minato";
var MemoryDriver = class extends SQLiteDriver {
  static name = "memory";
  static Config = z.object({});
  constructor(ctx) {
    super(ctx, { path: ":memory:" });
  }
};
var src_default = MemoryDriver;
export {
  src_default as default
};
//# sourceMappingURL=index.mjs.map
