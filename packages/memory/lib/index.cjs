"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var import_cosmokit = require("cosmokit");
var import_minato = require("minato");
var MemoryDriver = class extends import_minato.Driver {
  static name = "memory";
  _store = {
    _fields: []
  };
  _indexes = {};
  async prepare(name) {
  }
  async start() {
  }
  async $save(name) {
  }
  async stop() {
  }
  table(sel, env = {}) {
    if (typeof sel === "string") {
      return this._store[sel] ||= [];
    }
    if (!import_minato.Selection.is(sel)) {
      throw new Error("Should not reach here");
    }
    const { ref, query, table, args, model } = sel;
    const { fields, group, having, optional = {} } = sel.args[0];
    let data;
    if (typeof table === "object" && !import_minato.Selection.is(table)) {
      const entries = Object.entries(table).map(([name, sel2]) => [name, this.table(sel2, env)]);
      const catesian = /* @__PURE__ */ __name((entries2) => {
        if (!entries2.length) return [];
        const [[name, rows], ...tail] = entries2;
        if (!tail.length) return rows.map((row) => ({ [name]: row }));
        return rows.flatMap((row) => {
          let res = catesian(tail).map((tail2) => ({ ...tail2, [name]: row }));
          if (Object.keys(table).length === tail.length + 1) {
            res = res.map((row2) => ({ ...env, [ref]: row2 })).filter((data2) => (0, import_minato.executeEval)(data2, having)).map((x) => x[ref]);
          }
          return !optional[tail[0]?.[0]] || res.length ? res : [{ [name]: row }];
        });
      }, "catesian");
      data = catesian(entries);
    } else {
      data = this.table(table, env).filter((row) => (0, import_minato.executeQuery)(row, query, ref, env));
    }
    env[ref] = data;
    const branches = [];
    const groupFields = group ? (0, import_cosmokit.pick)(fields, group) : fields;
    for (let row of (0, import_minato.executeSort)(data, args[0], ref)) {
      row = model.format(row, false);
      for (const key in model.fields) {
        if (!import_minato.Field.available(model.fields[key])) continue;
        row[key] ??= null;
      }
      let index = row;
      if (fields) {
        index = (0, import_cosmokit.mapValues)(groupFields, (expr) => (0, import_minato.executeEval)({ ...env, [ref]: row }, expr));
      }
      let branch = branches.find((branch2) => {
        if (!group || !groupFields) return false;
        for (const key in groupFields) {
          if (!(0, import_cosmokit.deepEqual)(branch2.index[key], index[key])) return false;
        }
        return true;
      });
      if (!branch) {
        branch = { index, table: [] };
        branches.push(branch);
      }
      branch.table.push(row);
    }
    return branches.map(({ index, table: table2 }) => {
      if (group) {
        if (having) {
          const value = (0, import_minato.executeEval)(table2.map((row) => ({ ...env, [ref]: row, _: row })), having);
          if (!value) return;
        }
        for (const key in (0, import_cosmokit.omit)(fields, group)) {
          index[key] = (0, import_minato.executeEval)(table2.map((row) => ({ ...env, [ref]: row, _: row })), fields[key]);
        }
      }
      return model.parse(index, false);
    }).filter(Boolean);
  }
  async drop(table) {
    delete this._store[table];
  }
  async dropAll() {
    this._store = { _fields: [] };
  }
  async stats() {
    return { tables: (0, import_cosmokit.mapValues)(this._store, (rows, name) => ({ name, count: rows.length, size: 0 })), size: 0 };
  }
  async get(sel) {
    return this.table(sel);
  }
  async eval(sel, expr) {
    const { query, table } = sel;
    const ref = typeof table === "string" ? sel.ref : table.ref;
    const data = this.table(table).filter((row) => (0, import_minato.executeQuery)(row, query, ref));
    return (0, import_minato.executeEval)(data.map((row) => ({ [ref]: row, _: row })), expr);
  }
  async set(sel, data) {
    const { table, ref, query } = sel;
    const matched = this.table(table).filter((row) => (0, import_minato.executeQuery)(row, query, ref)).map((row) => (0, import_minato.executeUpdate)(row, data, ref)).length;
    this.$save(table);
    return { matched };
  }
  async remove(sel) {
    const { ref, query, table } = sel;
    const data = this.table(table);
    this._store[table] = data.filter((row) => !(0, import_minato.executeQuery)(row, query, ref));
    this.$save(table);
    const count = data.length - this._store[table].length;
    return { removed: count, matched: count };
  }
  async create(sel, data) {
    const { table, model } = sel;
    const { primary, autoInc } = model;
    const store = this.table(table);
    if (!Array.isArray(primary) && autoInc && !(primary in data)) {
      let meta = this._store._fields.find((row) => row.table === table && row.field === primary);
      if (!meta) {
        meta = { table, field: primary, autoInc: 0 };
        this._store._fields.push(meta);
      }
      meta.autoInc += 1;
      data[primary] = meta.autoInc;
    } else {
      const duplicated = await this.database.get(table, (0, import_cosmokit.pick)(model.format(data), (0, import_cosmokit.makeArray)(primary)));
      if (duplicated.length) {
        throw new import_minato.RuntimeError("duplicate-entry");
      }
    }
    store.push((0, import_cosmokit.clone)(data));
    this.$save(table);
    return (0, import_cosmokit.clone)((0, import_cosmokit.clone)(data));
  }
  async upsert(sel, data, keys) {
    const { table, model, ref } = sel;
    const result = { inserted: 0, matched: 0 };
    for (const update of data) {
      const row = this.table(table).find((row2) => {
        return keys.every((key) => row2[key] === update[key]);
      });
      if (row) {
        (0, import_minato.executeUpdate)(row, update, ref);
        result.matched++;
      } else {
        const data2 = (0, import_minato.executeUpdate)(model.create(), update, ref);
        await this.create(sel, data2).catch(import_cosmokit.noop);
        result.inserted++;
      }
    }
    this.$save(table);
    return result;
  }
  executeSelection(sel, env = {}) {
    const expr = sel.args[0], table = sel.table;
    if (Array.isArray(env)) env = { [sel.ref]: env };
    const data = this.table(sel.table, env);
    const res = (0, import_minato.isAggrExpr)(expr) ? data.map((row) => (0, import_minato.executeEval)({ ...env, [table.ref]: row, _: row }, expr)) : (0, import_minato.executeEval)(Object.assign(data.map((row) => ({ [table.ref]: row, _: row })), env), expr);
    return res;
  }
  async withTransaction(callback) {
    const data = (0, import_cosmokit.clone)(this._store);
    await callback().catch((e) => {
      this._store = data;
      throw e;
    });
  }
  async getIndexes(table) {
    return Object.values(this._indexes[table] ?? {});
  }
  async createIndex(table, index) {
    const name = index.name ?? "index:" + Object.entries(index.keys).map(([key, direction]) => `${key}_${direction}`).join("+");
    this._indexes[table] ??= {};
    this._indexes[table][name] = { name, unique: false, ...index };
  }
  async dropIndex(table, name) {
    this._indexes[table] ??= {};
    delete this._indexes[table][name];
  }
};
((MemoryDriver2) => {
  MemoryDriver2.Config = import_minato.z.object({});
})(MemoryDriver || (MemoryDriver = {}));
var src_default = MemoryDriver;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MemoryDriver
});
//# sourceMappingURL=index.cjs.map
