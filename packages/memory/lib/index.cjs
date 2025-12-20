"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  MemoryDriver: () => MemoryDriver,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_driver_node_sqlite = require("@minatojs/driver-node-sqlite");
var import_minato = require("minato");
var MemoryDriver = class MemoryDriver2 extends import_driver_node_sqlite.SQLiteDriver {
  static name = "memory";
  static Config = import_minato.z.object({});
  constructor(ctx) {
    super(ctx, { path: ":memory:" });
  }
};
var src_default = MemoryDriver;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MemoryDriver
});
//# sourceMappingURL=index.cjs.map
