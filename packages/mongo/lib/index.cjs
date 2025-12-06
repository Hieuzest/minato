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
  MongoDriver: () => MongoDriver,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_mongodb2 = require("mongodb");
var import_cosmokit2 = require("cosmokit");
var import_minato2 = require("minato");
var import_url = require("url");

// src/builder.ts
var import_cosmokit = require("cosmokit");
var import_minato = require("minato");
var import_mongodb = require("mongodb");
var import_cordis = require("cordis");
function createFieldFilter(query, key, type) {
  const filters = [];
  const result = {};
  const child = transformFieldQuery(query, key, filters, type);
  if (child === false) return false;
  if (child !== true) result[key] = child;
  if (filters.length) result.$and = filters;
  if (Object.keys(result).length) return result;
  return true;
}
__name(createFieldFilter, "createFieldFilter");
function transformFieldQuery(query, key, filters, type) {
  if ((0, import_minato.isComparable)(query) || query instanceof import_mongodb.ObjectId) {
    if (type?.type === "primary" && typeof query === "string") query = new import_mongodb.ObjectId(query);
    return { $eq: query };
  } else if (Array.isArray(query)) {
    if (!query.length) return false;
    return { $in: query };
  } else if (query instanceof RegExp) {
    return { $regex: query };
  } else if ((0, import_cosmokit.isNullable)(query)) {
    return null;
  }
  const result = {};
  for (const prop in query) {
    if (prop === "$and") {
      for (const item of query[prop]) {
        const child = createFieldFilter(item, key, type);
        if (child === false) return false;
        if (child !== true) filters.push(child);
      }
    } else if (prop === "$or") {
      const $or = [];
      if (!query[prop].length) return false;
      const always = query[prop].some((item) => {
        const child = createFieldFilter(item, key, type);
        if (typeof child === "boolean") return child;
        $or.push(child);
      });
      if (!always) filters.push({ $or });
    } else if (prop === "$not") {
      const child = createFieldFilter(query[prop], key, type);
      if (child === true) return false;
      if (child !== false) filters.push({ $nor: [child] });
    } else if (prop === "$el") {
      const child = transformFieldQuery(query[prop], key, filters);
      if (child === false) return false;
      if (child !== true) result.$elemMatch = child;
    } else if (prop === "$regex") {
      return { $regex: typeof query[prop] === "string" ? query[prop] : (0, import_minato.makeRegExp)(query[prop]) };
    } else if (prop === "$regexFor") {
      filters.push({
        $expr: {
          $regexMatch: {
            input: query[prop].input ?? query[prop],
            regex: "$" + key,
            ...query[prop].flags ? { options: query[prop].flags } : {}
          }
        }
      });
    } else if (prop === "$exists") {
      if (query[prop]) return { $ne: null };
      else return null;
    } else {
      result[prop] = query[prop];
    }
  }
  if (!Object.keys(result).length) return true;
  return result;
}
__name(transformFieldQuery, "transformFieldQuery");
var aggrKeys = ["$sum", "$avg", "$min", "$max", "$count", "$length", "$array"];
var Builder = class _Builder {
  constructor(driver, tables, virtualKey, recursivePrefix = "$") {
    this.driver = driver;
    this.tables = tables;
    this.virtualKey = virtualKey;
    this.recursivePrefix = recursivePrefix;
    this.walkedKeys = [];
    this.evalOperators = {
      $: /* @__PURE__ */ __name((arg, group) => {
        if (typeof arg === "string") {
          this.walkedKeys.push(this.getActualKey(arg));
          return this.recursivePrefix + this.getActualKey(arg);
        }
        const [joinRoot, ...rest] = arg[1].split(".");
        if (this.tables.includes(`${arg[0]}.${joinRoot}`)) {
          return this.recursivePrefix + rest.join(".");
        } else if (`${arg[0]}.${joinRoot}` in this.joinTables) {
          return `$$${this.joinTables[`${arg[0]}.${joinRoot}`]}.` + rest.join(".");
        } else if (this.tables.includes(arg[0])) {
          this.walkedKeys.push(this.getActualKey(arg[1]));
          return this.recursivePrefix + this.getActualKey(arg[1]);
        } else if (this.refTables.includes(arg[0])) {
          return `$$${arg[0]}.` + this.getActualKey(arg[1], arg[0]);
        } else {
          throw new Error(`$ not transformed: ${JSON.stringify(arg)}`);
        }
      }, "$"),
      $select: /* @__PURE__ */ __name((args, group) => args.map((val) => this.eval(val, group)), "$select"),
      $if: /* @__PURE__ */ __name((arg, group) => ({ $cond: arg.map((val) => this.eval(val, group)) }), "$if"),
      $and: /* @__PURE__ */ __name((args, group) => {
        const type = import_minato.Type.fromTerm(this.evalExpr, import_minato.Type.Boolean);
        if (import_minato.Field.boolean.includes(type.type)) return { $and: args.map((arg) => this.eval(arg, group)) };
        else if (this.driver.version >= 7) return { $bitAnd: args.map((arg) => this.eval(arg, group)) };
        else if (import_minato.Field.number.includes(type.type)) {
          return {
            $function: {
              body: function(...args2) {
                return args2.reduce((prev, curr) => prev & curr);
              }.toString(),
              args: args.map((arg) => this.eval(arg, group)),
              lang: "js"
            }
          };
        } else {
          return {
            $toLong: {
              $function: {
                body: function(...args2) {
                  return args2.reduce((prev, curr) => String(BigInt(prev ?? 0) & BigInt(curr ?? 0)));
                }.toString(),
                args: args.map((arg) => ({ $toString: this.eval(arg, group) })),
                lang: "js"
              }
            }
          };
        }
      }, "$and"),
      $or: /* @__PURE__ */ __name((args, group) => {
        const type = import_minato.Type.fromTerm(this.evalExpr, import_minato.Type.Boolean);
        if (import_minato.Field.boolean.includes(type.type)) return { $or: args.map((arg) => this.eval(arg, group)) };
        else if (this.driver.version >= 7) return { $bitOr: args.map((arg) => this.eval(arg, group)) };
        else if (import_minato.Field.number.includes(type.type)) {
          return {
            $function: {
              body: function(...args2) {
                return args2.reduce((prev, curr) => prev | curr);
              }.toString(),
              args: args.map((arg) => this.eval(arg, group)),
              lang: "js"
            }
          };
        } else {
          return {
            $toLong: {
              $function: {
                body: function(...args2) {
                  return args2.reduce((prev, curr) => String(BigInt(prev ?? 0) | BigInt(curr ?? 0)));
                }.toString(),
                args: args.map((arg) => ({ $toString: this.eval(arg, group) })),
                lang: "js"
              }
            }
          };
        }
      }, "$or"),
      $not: /* @__PURE__ */ __name((arg, group) => {
        const type = import_minato.Type.fromTerm(this.evalExpr, import_minato.Type.Boolean);
        if (import_minato.Field.boolean.includes(type.type)) return { $not: this.eval(arg, group) };
        else if (this.driver.version >= 7) return { $bitNot: this.eval(arg, group) };
        else if (import_minato.Field.number.includes(type.type)) {
          return {
            $function: {
              body: function(arg2) {
                return ~arg2;
              }.toString(),
              args: [this.eval(arg, group)],
              lang: "js"
            }
          };
        } else {
          return {
            $toLong: {
              $function: {
                body: function(arg2) {
                  return String(~BigInt(arg2 ?? 0));
                }.toString(),
                args: [{ $toString: this.eval(arg, group) }],
                lang: "js"
              }
            }
          };
        }
      }, "$not"),
      $xor: /* @__PURE__ */ __name((args, group) => {
        const type = import_minato.Type.fromTerm(this.evalExpr, import_minato.Type.Boolean);
        if (import_minato.Field.boolean.includes(type.type)) return args.map((arg) => this.eval(arg, group)).reduce((prev, curr) => ({ $ne: [prev, curr] }));
        else if (this.driver.version >= 7) return { $bitXor: args.map((arg) => this.eval(arg, group)) };
        else if (import_minato.Field.number.includes(type.type)) {
          return {
            $function: {
              body: function(...args2) {
                return args2.reduce((prev, curr) => prev ^ curr);
              }.toString(),
              args: args.map((arg) => this.eval(arg, group)),
              lang: "js"
            }
          };
        } else {
          return {
            $toLong: {
              $function: {
                body: function(...args2) {
                  return args2.reduce((prev, curr) => String(BigInt(prev ?? 0) ^ BigInt(curr ?? 0)));
                }.toString(),
                args: args.map((arg) => ({ $toString: this.eval(arg, group) })),
                lang: "js"
              }
            }
          };
        }
      }, "$xor"),
      $object: /* @__PURE__ */ __name((arg, group) => (0, import_cosmokit.mapValues)(arg, (x) => this.transformEvalExpr(x)), "$object"),
      $regex: /* @__PURE__ */ __name(([value, regex, flags], group) => ({
        $regexMatch: {
          input: this.eval(value, group),
          regex: this.eval(regex, group),
          ...flags ? { options: flags } : {}
        }
      }), "$regex"),
      $length: /* @__PURE__ */ __name((arg, group) => ({ $size: this.eval(arg, group) }), "$length"),
      $nin: /* @__PURE__ */ __name((arg, group) => ({ $not: { $in: arg.map((val) => this.eval(val, group)) } }), "$nin"),
      $modulo: /* @__PURE__ */ __name((arg, group) => ({ $mod: arg.map((val) => this.eval(val, group)) }), "$modulo"),
      $log: /* @__PURE__ */ __name(([left, right], group) => (0, import_cosmokit.isNullable)(right) ? { $ln: this.eval(left, group) } : { $log: [this.eval(left, group), this.eval(right, group)] }, "$log"),
      $power: /* @__PURE__ */ __name((arg, group) => ({ $pow: arg.map((val) => this.eval(val, group)) }), "$power"),
      $random: /* @__PURE__ */ __name((arg, group) => ({ $rand: {} }), "$random"),
      $literal: /* @__PURE__ */ __name(([value, type], group) => {
        return { $literal: this.dump(value, type ? import_minato.Type.fromField(type) : void 0) };
      }, "$literal"),
      $number: /* @__PURE__ */ __name((arg, group) => {
        const value = this.eval(arg, group);
        return {
          $ifNull: [{
            $switch: {
              branches: [
                {
                  case: { $eq: [{ $type: value }, "date"] },
                  then: { $floor: { $divide: [{ $toLong: value }, 1e3] } }
                }
              ],
              default: { $toDouble: value }
            }
          }, 0]
        };
      }, "$number"),
      $get: /* @__PURE__ */ __name(([x, key], group) => typeof key === "string" ? key.split(".").reduce((res, k) => ({ $getField: { input: res, field: k } }), this.eval(x, group)) : { $arrayElemAt: [this.eval(x, group), this.eval(key, group)] }, "$get"),
      $exec: /* @__PURE__ */ __name((arg, group) => {
        const sel = arg;
        const transformer = this.createSubquery(sel);
        if (!transformer) throw new Error(`Selection cannot be executed: ${JSON.stringify(arg)}`);
        const name = this.createKey();
        this.lookups.push({
          $lookup: {
            from: transformer.table,
            as: name,
            let: {
              [this.tables[0]]: "$$ROOT"
            },
            pipeline: transformer.pipeline
          }
        }, {
          $set: {
            [name]: !(0, import_minato.isAggrExpr)(sel.args[0]) ? {
              $getField: {
                input: {
                  $ifNull: [
                    { $arrayElemAt: ["$" + name, 0] },
                    { [transformer.evalKey]: transformer.aggrDefault }
                  ]
                },
                field: transformer.evalKey
              }
            } : {
              $map: {
                input: "$" + name,
                as: "el",
                in: "$$el." + transformer.evalKey
              }
            }
          }
        });
        return `$${name}`;
      }, "$exec")
    };
    this.evalOperators = Object.assign(/* @__PURE__ */ Object.create(null), this.evalOperators);
  }
  static {
    __name(this, "Builder");
  }
  counter = 0;
  table;
  walkedKeys = [];
  pipeline = [];
  lookups = [];
  evalKey;
  evalExpr;
  refTables = [];
  refVirtualKeys = {};
  joinTables = {};
  aggrDefault;
  evalOperators;
  createKey() {
    return "_temp_" + ++this.counter;
  }
  getActualKey(key, ref) {
    return key === (ref ? this.refVirtualKeys[ref] : this.virtualKey) ? "_id" : key;
  }
  transformEvalExpr(expr, group) {
    if (Object.keys(expr).length === 0) {
      return { $literal: expr };
    }
    for (const key in expr) {
      if (this.evalOperators[key]) {
        this.evalExpr = expr;
        return this.evalOperators[key](expr[key], group);
      } else if (key?.startsWith("$") && import_minato.Eval[key.slice(1)]) {
        return (0, import_cosmokit.mapValues)(expr, (value) => {
          if (Array.isArray(value)) {
            return value.map((val) => this.eval(val, group));
          } else {
            return this.eval(value, group);
          }
        });
      }
    }
    if (Array.isArray(expr)) {
      return expr.map((val) => this.eval(val, group));
    }
    return expr;
  }
  transformAggr(expr) {
    if (typeof expr === "number" || typeof expr === "boolean" || expr instanceof Date) {
      return expr;
    }
    if (typeof expr === "string") {
      this.walkedKeys.push(expr);
      return this.recursivePrefix + expr;
    }
    expr = this.transformEvalExpr(expr);
    return typeof expr === "object" ? (0, import_minato.unravel)(expr) : expr;
  }
  flushLookups() {
    const ret = this.lookups;
    this.lookups = [];
    return ret;
  }
  eval(expr, group) {
    if ((0, import_minato.isComparable)(expr) || (0, import_cosmokit.isNullable)(expr) || expr instanceof import_mongodb.ObjectId) {
      return expr;
    }
    if (group) {
      for (const type of aggrKeys) {
        if (!expr[type]) continue;
        const key = this.createKey();
        const value = this.transformAggr(expr[type]);
        this.aggrDefault = 0;
        if (type === "$count") {
          group[key] = { $addToSet: value };
          return { $size: "$" + key };
        } else if (type === "$length") {
          group[key] = { $push: value };
          return { $size: "$" + key };
        } else if (type === "$array") {
          this.aggrDefault = [];
          group[key] = { $push: value };
          return "$" + key;
        } else {
          group[key] = { [type]: value };
          return "$" + key;
        }
      }
    }
    return this.transformEvalExpr(expr, group);
  }
  query(sel, query) {
    const filter = {};
    const additional = [];
    for (const key in query) {
      const value = query[key];
      if (key === "$and" || key === "$or") {
        if (value.length) {
          filter[key] = value.map((query2) => this.query(sel, query2));
        } else if (key === "$or") {
          return;
        }
      } else if (key === "$not") {
        const query2 = this.query(sel, value);
        if (query2) filter.$nor = [query2];
      } else if (key === "$expr") {
        additional.push({ $expr: this.eval(value) });
      } else {
        const ignore = /* @__PURE__ */ __name((value2) => (0, import_minato.isFlat)(value2) || value2 instanceof import_mongodb.ObjectId, "ignore");
        const flattenQuery = ignore(value) ? { [key]: value } : (0, import_minato.flatten)(value, `${key}.`, ignore);
        for (const key2 in flattenQuery) {
          const value2 = flattenQuery[key2], actualKey = this.getActualKey(key2);
          const query2 = transformFieldQuery(value2, actualKey, additional, sel.model.fields[key2]?.type);
          if (query2 === false) return;
          if (query2 !== true) filter[actualKey] = query2;
        }
      }
    }
    if (additional.length) {
      (filter.$and ||= []).push(...additional);
    }
    return filter;
  }
  modifier(stages, sel) {
    const { args, model } = sel;
    const { fields, offset, limit, sort, group, having } = args[0];
    const $set = {};
    const $sort = {};
    const $unset = [];
    for (const [expr, dir] of sort) {
      const value = this.eval(expr);
      if (typeof value === "string") {
        $sort[value.slice(1)] = dir === "desc" ? -1 : 1;
      } else {
        const key = this.createKey();
        $set[key] = value;
        $sort[key] = dir === "desc" ? -1 : 1;
        $unset.push(key);
      }
    }
    if ($unset.length) stages.push({ $set });
    if (Object.keys($sort).length) stages.push({ $sort });
    if ($unset.length) stages.push({ $unset });
    if (limit < Infinity) {
      stages.push({ $limit: offset + limit });
    }
    if (offset) {
      stages.push({ $skip: offset });
    }
    if (group) {
      const $group = { _id: {} };
      const $project = { _id: 0 };
      const groupStages = [{ $group }];
      for (const key in fields) {
        if (group.includes(key)) {
          $group._id[key] = this.eval(fields[key]);
          $project[key] = "$_id." + key;
        } else {
          $project[key] = this.eval(fields[key], $group);
        }
      }
      if (having["$and"].length) {
        const $expr = this.eval(having, $group);
        groupStages.push(...this.flushLookups(), { $match: { $expr } });
      }
      stages.push(...this.flushLookups(), ...groupStages, { $project });
      $group["_id"] = (0, import_minato.unravel)($group["_id"]);
    } else if (fields) {
      const $project = (0, import_cosmokit.mapValues)(fields, (expr) => this.eval(expr));
      $project._id = 0;
      stages.push(...this.flushLookups(), { $project });
    } else {
      const $project = { _id: 0 };
      for (const key in model.fields) {
        if (!import_minato.Field.available(model.fields[key])) continue;
        $project[key] = key === this.virtualKey ? "$_id" : 1;
      }
      stages.push({ $project });
    }
  }
  createSubquery(sel) {
    const predecessor = new _Builder(this.driver, Object.keys(sel.tables));
    predecessor.refTables = [...this.refTables, ...this.tables];
    predecessor.joinTables = { ...this.joinTables };
    predecessor.refVirtualKeys = this.refVirtualKeys;
    return predecessor.select(sel);
  }
  select(sel, update) {
    const { model, table, query } = sel;
    if (typeof table === "string") {
      this.table = table;
      this.refVirtualKeys[sel.ref] = this.virtualKey = sel.driver.getVirtualKey(table);
    } else if (import_minato.Selection.is(table)) {
      const predecessor = this.createSubquery(table);
      if (!predecessor) return;
      this.table = predecessor.table;
      this.pipeline.push(...predecessor.flushLookups(), ...predecessor.pipeline);
    } else {
      const refs = {};
      Object.entries(table).forEach(([name, subtable], i) => {
        const predecessor = this.createSubquery(subtable);
        if (!predecessor) return;
        if (!this.table) {
          this.table = predecessor.table;
          this.pipeline.push(...predecessor.flushLookups(), ...predecessor.pipeline, {
            $replaceRoot: { newRoot: { [name]: "$$ROOT" } }
          });
          refs[name] = subtable.ref;
          return;
        }
        if (sel.args[0].having["$and"].length && i === Object.keys(table).length - 1) {
          const thisTables = this.tables, thisJoinedTables = this.joinTables;
          this.tables = [...this.tables, `${sel.ref}.${name}`];
          this.joinTables = {
            ...this.joinTables,
            [`${sel.ref}.${name}`]: sel.ref,
            ...Object.fromEntries(Object.entries(refs).map(([name2, ref]) => [`${sel.ref}.${name2}`, ref]))
          };
          const $expr = this.eval(sel.args[0].having["$and"][0]);
          predecessor.pipeline.push(...this.flushLookups(), { $match: { $expr } });
          this.tables = thisTables;
          this.joinTables = thisJoinedTables;
        }
        const $lookup = {
          from: predecessor.table,
          as: name,
          let: Object.fromEntries(Object.entries(refs).map(([name2, ref]) => [ref, `$$ROOT.${name2}`])),
          pipeline: predecessor.pipeline
        };
        const $unwind = {
          path: `$${name}`,
          preserveNullAndEmptyArrays: !!sel.args[0].optional?.[name]
        };
        this.pipeline.push({ $lookup }, { $unwind });
        refs[name] = subtable.ref;
      });
    }
    const filter = this.query(sel, query);
    if (!filter) return;
    if (Object.keys(filter).length) {
      this.pipeline.push(...this.flushLookups(), { $match: filter });
    }
    if (sel.type === "get") {
      this.modifier(this.pipeline, sel);
    } else if (sel.type === "eval") {
      const $ = this.createKey();
      const $group = { _id: null };
      const $project = { _id: 0 };
      $project[$] = this.eval(sel.args[0], $group);
      if (Object.keys($group).length === 1) {
        this.pipeline.push(...this.flushLookups(), { $project });
      } else {
        this.pipeline.push({ $group }, ...this.flushLookups(), { $project });
      }
      this.evalKey = $;
    } else if (sel.type === "set") {
      const $set = (0, import_cosmokit.mapValues)(update, (expr, key) => this.eval((0, import_minato.isEvalExpr)(expr) ? expr : import_minato.Eval.literal(expr, model.getType(key))));
      this.pipeline.push(...this.flushLookups(), { $set }, {
        $merge: {
          into: table,
          on: "_id",
          whenMatched: "replace",
          whenNotMatched: "discard"
        }
      });
    }
    return this;
  }
  dump(value, type) {
    if (!type) return value;
    if ((0, import_minato.isEvalExpr)(type)) type = import_minato.Type.fromTerm(type);
    if (!import_minato.Type.isType(type)) type = type.getType();
    const converter = this.driver.types[type?.type];
    let res = value;
    res = import_minato.Type.transform(res, type, (value2, type2) => this.dump(value2, type2));
    res = converter?.dump ? converter.dump(res) : res;
    const types = this.driver.database[import_cordis.symbols.original]?.types ?? this.driver.database.types;
    const ancestor = types[type.type]?.type;
    res = this.dump(res, ancestor ? import_minato.Type.fromField(ancestor) : void 0);
    return res;
  }
  load(value, type) {
    if (!type) return value;
    if (import_minato.Type.isType(type) || (0, import_minato.isEvalExpr)(type)) {
      type = import_minato.Type.isType(type) ? type : import_minato.Type.fromTerm(type);
      const converter = this.driver.types[type.type];
      const types = this.driver.database[import_cordis.symbols.original]?.types ?? this.driver.database.types;
      const ancestor = types[type.type]?.type;
      let res = this.load(value, ancestor ? import_minato.Type.fromField(ancestor) : void 0);
      res = converter?.load ? converter.load(res) : res;
      res = import_minato.Type.transform(res, type, (value2, type2) => this.load(value2, type2));
      return res;
    }
    value = type.format(value, false);
    const result = {};
    for (const key in value) {
      if (!(key in type.fields)) continue;
      result[key] = this.load(value[key], type.fields[key].type);
    }
    return type.parse(result);
  }
  toUpdateExpr(value, type, root = true) {
    if ((0, import_cosmokit.isNullable)(value)) {
      return value;
    } else if ((0, import_minato.isEvalExpr)(value)) {
      return root ? this.eval(value) : this.dump(value, type);
    } else if ((type?.type === "string" || !type) && typeof value === "string" && value.startsWith("$")) {
      return { $literal: value };
    } else if ((type?.type === "json" || !type) && typeof value === "object" && Object.keys(value).length === 0) {
      return { $literal: value };
    } else if (!type) {
      return this.dump(value, type);
    } else if (import_minato.Type.isArray(type) && Array.isArray(value)) {
      return value.map((val) => this.toUpdateExpr(val, type.inner, false));
    } else if (type.inner) {
      return (0, import_cosmokit.mapValues)(value, (val, key) => this.toUpdateExpr(val, import_minato.Type.getInner(type, key), false));
    } else {
      return this.dump(value, type);
    }
  }
};

// src/locales/zh-CN.yml
var zh_CN_default = { protocol: "要使用的协议名。", host: "要连接到的主机名。", port: "要连接到的端口号。", username: "要使用的用户名。", password: "要使用的密码。", database: "要访问的数据库名。", authDatabase: "用于验证身份的数据库名。", writeConcern: { $description: "Write Concern", w: { $description: "The write concern.", $value: ["Default", "Custom", "Majority"] }, wtimeoutMS: "The write concern timeout.", journal: "The journal write concern." } };

// src/locales/en-US.yml
var en_US_default = { protocol: "The protocol to use.", host: "The host to connect to.", port: "The port number to be connected.", username: "The username used for authentication.", password: "The password used for authentication.", database: "The name of the database we want to use.", authDatabase: "The name of the database for authentication.", writeConcern: { $description: "Write Concern", w: { $description: "The write concern.", $value: ["Default", "Custom", "Majority"] }, wtimeoutMS: "The write concern timeout.", journal: "The journal write concern." } };

// src/index.ts
var tempKey = "__temp_minato_mongo__";
var MongoDriver = class extends import_minato2.Driver {
  static name = "mongo";
  client;
  db;
  mongo = this;
  version = 0;
  builder = new Builder(this, []);
  session;
  _replSet = true;
  _createTasks = {};
  connectionStringFromConfig() {
    const {
      authDatabase,
      connectOptions,
      host = "localhost",
      database,
      password,
      protocol = "mongodb",
      port = protocol.includes("srv") ? null : 27017,
      username
    } = this.config;
    let mongourl = `${protocol}://`;
    if (username) mongourl += `${encodeURIComponent(username)}${password ? `:${encodeURIComponent(password)}` : ""}@`;
    mongourl += `${host}${port ? `:${port}` : ""}/${authDatabase || database}`;
    if (connectOptions) {
      const params = new import_url.URLSearchParams(connectOptions);
      mongourl += `?${params}`;
    }
    return mongourl;
  }
  async start() {
    const url = this.config.uri || this.connectionStringFromConfig();
    this.client = await import_mongodb2.MongoClient.connect(url, (0, import_cosmokit2.pick)(this.config, [
      "writeConcern"
    ]));
    this.db = this.client.db(this.config.database);
    this.db.admin().serverInfo().then((doc) => this.version = +doc.version.split(".")[0]).catch(import_cosmokit2.noop);
    await this.client.withSession((session) => session.withTransaction(
      () => this.db.collection("_fields").findOne({}, { session }),
      { readPreference: "primary" }
    )).catch(() => {
      this._replSet = false;
      this.logger.warn(`MongoDB is currently running as standalone server, transaction is disabled.
      Convert to replicaSet to enable the feature.
      See https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/`);
    });
    this.define({
      types: ["binary"],
      dump: /* @__PURE__ */ __name((value) => (0, import_cosmokit2.isNullable)(value) ? value : Buffer.from(value), "dump"),
      load: /* @__PURE__ */ __name((value) => (0, import_cosmokit2.isNullable)(value) ? value : import_cosmokit2.Binary.fromSource(value.buffer), "load")
    });
    this.define({
      types: ["bigint"],
      dump: /* @__PURE__ */ __name((value) => (0, import_cosmokit2.isNullable)(value) ? value : value, "dump"),
      load: /* @__PURE__ */ __name((value) => (0, import_cosmokit2.isNullable)(value) ? value : BigInt(value), "load")
    });
    this.define({
      types: ["primary"],
      dump: /* @__PURE__ */ __name((value) => typeof value === "string" ? new import_mongodb2.ObjectId(value) : value, "dump"),
      load: /* @__PURE__ */ __name((value) => value, "load")
    });
  }
  stop() {
    return this.client?.close();
  }
  /**
   * https://www.mongodb.com/docs/manual/indexes/
   */
  async _createIndexes(table) {
    const { fields, primary, unique } = this.model(table);
    const coll = this.db.collection(table);
    const newSpecs = [];
    const oldSpecs = await coll.indexes();
    [primary, ...unique].forEach((keys, index) => {
      if (primary === keys && !index && this.getVirtualKey(table)) return;
      keys = (0, import_cosmokit2.makeArray)(keys);
      if (index && (0, import_cosmokit2.deepEqual)(keys, (0, import_cosmokit2.makeArray)(primary))) return;
      const name = (index ? "unique:" : "primary:") + keys.join("+");
      if (oldSpecs.find((spec) => spec.name === name)) return;
      const nullable = Object.entries(fields).filter(([key]) => keys.includes(key)).every(([, field]) => field?.nullable);
      newSpecs.push({
        name,
        key: Object.fromEntries(keys.map((key) => [key, 1])),
        unique: true,
        // https://www.mongodb.com/docs/manual/core/index-partial/#partial-indexes
        // mongodb seems to not support $ne in partialFilterExpression
        // so we cannot simply use `{ $ne: null }` to filter out null values
        // below is a workaround for https://github.com/koishijs/koishi/issues/893
        ...nullable || index > unique.length ? {} : {
          partialFilterExpression: Object.fromEntries(keys.map((key) => [key, {
            $type: [import_mongodb2.BSONType.date, import_mongodb2.BSONType.int, import_mongodb2.BSONType.long, import_mongodb2.BSONType.string, import_mongodb2.BSONType.objectId]
          }]))
        }
      });
    });
    if (!newSpecs.length) return;
    await coll.createIndexes(newSpecs);
  }
  async _createFields(table) {
    const { fields } = this.model(table);
    const coll = this.db.collection(table);
    const bulk = coll.initializeOrderedBulkOp();
    const virtualKey = this.getVirtualKey(table);
    const metaTable = this.db.collection("_fields");
    const meta = { _id: table }, found = await metaTable.findOne(meta);
    if (!found?.fields) {
      this.logger.info("initializing fields for table %s", table);
      await metaTable.updateOne(meta, { $set: { fields: Object.keys(fields) } }, { upsert: true });
      return;
    }
    for (const key in fields) {
      if (virtualKey === key) continue;
      const { initial, legacy = [] } = fields[key];
      if (!import_minato2.Field.available(fields[key])) continue;
      if (found.fields.includes(key)) continue;
      this.logger.info("auto migrating field %s for table %s", key, table);
      const oldKey = found.fields.find((field) => legacy.includes(field));
      if (oldKey) {
        (0, import_cosmokit2.remove)(found.fields, oldKey);
        found.fields.push(key);
        bulk.find({ [oldKey]: { $exists: true } }).update({ $rename: { [oldKey]: key } });
      } else {
        found.fields.push(key);
        if ((0, import_cosmokit2.isNullable)(initial)) continue;
        bulk.find({}).update({ $set: { [key]: initial ?? null } });
      }
    }
    if (bulk.batches.length) {
      await bulk.execute();
      await metaTable.updateOne(meta, { $set: { fields: found.fields } });
    }
  }
  async _migrateVirtual(table) {
    const { primary, fields } = this.model(table);
    if (Array.isArray(primary)) return;
    const metaTable = this.db.collection("_fields");
    const meta = { _id: table }, found = await metaTable.findOne(meta);
    let virtual = !!found?.virtual;
    const useVirtualKey = !!this.getVirtualKey(table);
    if (!found) {
      const doc = await this.db.collection(table).findOne();
      if (doc) {
        virtual = typeof doc._id !== "object" || typeof primary === "string" && fields[primary]?.deftype === "primary";
      }
      if (!doc || virtual === useVirtualKey) {
        await metaTable.updateOne(meta, { $set: { virtual: useVirtualKey } }, { upsert: true });
        this.logger.info("successfully reconfigured table %s", table);
        return;
      }
    }
    if (virtual === useVirtualKey) return;
    this.logger.info("start migrating table %s", table);
    if (found?.migrate && await this.db.listCollections({ name: "_migrate_" + table }).hasNext()) {
      this.logger.info("last time crashed, recover");
    } else {
      await this.db.dropCollection("_migrate_" + table).catch(import_cosmokit2.noop);
      await this.db.collection(table).aggregate([
        { $addFields: { _temp_id: "$_id" } },
        { $unset: ["_id"] },
        { $addFields: useVirtualKey ? { _id: "$" + primary } : { [primary]: "$_temp_id" } },
        { $unset: ["_temp_id", ...useVirtualKey ? [primary] : []] },
        { $out: "_migrate_" + table }
      ]).toArray();
      await metaTable.updateOne(meta, { $set: { migrate: true } }, { upsert: true });
    }
    await this.db.dropCollection(table).catch(import_cosmokit2.noop);
    await this.db.renameCollection("_migrate_" + table, table);
    await metaTable.updateOne(
      meta,
      { $set: { virtual: useVirtualKey, migrate: false } },
      { upsert: true }
    );
    this.logger.info("successfully migrated table %s", table);
  }
  async _migratePrimary(table) {
    const { primary, autoInc } = this.model(table);
    if (Array.isArray(primary) || !autoInc) return;
    const metaTable = this.db.collection("_fields");
    const meta = { _id: table }, found = await metaTable.findOne(meta);
    if (!(0, import_cosmokit2.isNullable)(found?.autoInc)) return;
    const coll = this.db.collection(table);
    if (!this.getVirtualKey(table)) {
      const bulk = coll.initializeOrderedBulkOp();
      await coll.find().forEach((data) => {
        bulk.find({ [primary]: data[primary] }).update({ $set: { [primary]: +data[primary] } });
      });
      if (bulk.batches.length) await bulk.execute();
    }
    const [latest] = await coll.find().sort(this.getVirtualKey(table) ? "_id" : primary, -1).limit(1).toArray();
    await metaTable.updateOne(meta, {
      $set: { autoInc: latest ? +latest[this.getVirtualKey(table) ? "_id" : primary] : 0, virtual: !!this.getVirtualKey(table) }
    }, { upsert: true });
  }
  _internalTableTask;
  async _createInternalTable() {
    return this._internalTableTask ||= this.db.createCollection("_fields").catch(import_cosmokit2.noop);
  }
  /** synchronize table schema */
  async prepare(table) {
    await Promise.all([
      this._createInternalTable(),
      this.db.createCollection(table).catch(import_cosmokit2.noop)
    ]);
    await this._migrateVirtual(table);
    await Promise.all([
      this._createIndexes(table),
      this._createFields(table),
      this._migratePrimary(table)
    ]);
    const $unset = {};
    await this.migrate(table, {
      error: this.logger.warn,
      before: /* @__PURE__ */ __name(() => true, "before"),
      after: /* @__PURE__ */ __name((keys) => keys.forEach((key) => $unset[key] = ""), "after"),
      finalize: /* @__PURE__ */ __name(async () => {
        if (!Object.keys($unset).length) return;
        const coll = this.db.collection(table);
        await coll.updateMany({}, { $unset });
      }, "finalize")
    });
  }
  async drop(table) {
    await this.db.collection("_fields").deleteOne({ _id: table }, { session: this.session });
    await this.db.dropCollection(table, { session: this.session });
  }
  async dropAll() {
    await Promise.all([
      "_fields",
      ...Object.keys(this.database.tables)
    ].map((name) => this.db.dropCollection(name, { session: this.session })));
  }
  async _collStats() {
    const tables = Object.keys(this.database.tables);
    const entries = await Promise.all(tables.map(async (name) => {
      const coll = this.db.collection(name);
      const [{ storageStats: { count, size } }] = await coll.aggregate([{
        $collStats: { storageStats: {} }
      }], { session: this.session }).toArray();
      return [coll.collectionName, { count, size }];
    }));
    return Object.fromEntries(entries);
  }
  async stats() {
    const [stats, tables] = await Promise.all([
      this.db.stats(),
      this._collStats()
    ]);
    const totalSize = stats.indexSize + stats.storageSize;
    return { size: totalSize, tables };
  }
  getVirtualKey(table) {
    const { primary, fields } = this.model(table);
    if (typeof primary === "string" && (this.config.optimizeIndex || fields[primary]?.deftype === "primary")) {
      return primary;
    }
  }
  patchVirtual(table, row) {
    const { primary, fields } = this.model(table);
    if (typeof primary === "string" && (this.config.optimizeIndex || fields[primary]?.deftype === "primary")) {
      row[primary] = row["_id"];
      delete row["_id"];
    }
    return row;
  }
  unpatchVirtual(table, row) {
    const { primary, fields } = this.model(table);
    if (typeof primary === "string" && (this.config.optimizeIndex || fields[primary]?.deftype === "primary")) {
      row["_id"] = row[primary];
      delete row[primary];
    }
    return row;
  }
  transformQuery(sel, query, table) {
    return new Builder(this, Object.keys(sel.tables), this.getVirtualKey(table)).query(sel, query);
  }
  async get(sel) {
    const transformer = new Builder(this, Object.keys(sel.tables)).select(sel);
    if (!transformer) return [];
    this.logPipeline(transformer.table, transformer.pipeline);
    return this.db.collection(transformer.table).aggregate(transformer.pipeline, { allowDiskUse: true, session: this.session }).toArray().then((rows) => rows.map((row) => this.builder.load(row, sel.model)));
  }
  async eval(sel, expr) {
    const transformer = new Builder(this, Object.keys(sel.tables)).select(sel);
    if (!transformer) return;
    this.logPipeline(transformer.table, transformer.pipeline);
    const res = await this.db.collection(transformer.table).aggregate(transformer.pipeline, { allowDiskUse: true, session: this.session }).toArray();
    return this.builder.load(res.length ? res[0][transformer.evalKey] : transformer.aggrDefault, expr);
  }
  async set(sel, update) {
    const { query, table, model } = sel;
    if ((0, import_minato2.hasSubquery)(sel.query) || Object.values(update).some((x) => (0, import_minato2.hasSubquery)(x))) {
      const transformer = new Builder(this, Object.keys(sel.tables)).select(sel, update);
      await this.db.collection(transformer.table).aggregate(transformer.pipeline, { allowDiskUse: true, session: this.session }).toArray();
      return {};
    } else {
      const filter = this.transformQuery(sel, query, table);
      if (!filter) return {};
      const coll = this.db.collection(table);
      const transformer = new Builder(this, Object.keys(sel.tables), this.getVirtualKey(table), "$" + tempKey + ".");
      const $set = (0, import_cosmokit2.mapValues)(update, (item, key) => transformer.toUpdateExpr(item, model.getType(key)));
      const $unset = Object.entries($set).filter(([_, value]) => typeof value === "object").map(([key, _]) => key);
      const preset = Object.fromEntries(transformer.walkedKeys.map((key) => [tempKey + "." + key, "$" + key]));
      const result = await coll.updateMany(filter, [
        ...transformer.walkedKeys.length ? [{ $set: preset }] : [],
        ...$unset.length ? [{ $unset }] : [],
        { $set },
        ...transformer.walkedKeys.length ? [{ $unset: [tempKey] }] : []
      ], { session: this.session });
      return { matched: result.matchedCount, modified: result.modifiedCount };
    }
  }
  async remove(sel) {
    const { query, table } = sel;
    const filter = this.transformQuery(sel, query, table);
    if (!filter) return {};
    const result = await this.db.collection(table).deleteMany(filter, { session: this.session });
    return { matched: result.deletedCount, removed: result.deletedCount };
  }
  shouldEnsurePrimary(table) {
    const model = this.model(table);
    const { primary, autoInc } = model;
    return typeof primary === "string" && autoInc && model.fields[primary]?.deftype !== "primary";
  }
  shouldFillPrimary(table) {
    const model = this.model(table);
    const { primary, autoInc } = model;
    return typeof primary === "string" && autoInc && model.fields[primary]?.deftype === "primary";
  }
  async ensurePrimary(table, data) {
    const model = this.model(table);
    const { primary, autoInc } = model;
    if (typeof primary === "string" && autoInc && model.fields[primary]?.deftype !== "primary") {
      const missing = data.filter((item) => !(primary in item));
      if (!missing.length) return;
      const doc = await this.db.collection("_fields").findOneAndUpdate(
        { _id: table },
        { $inc: { autoInc: missing.length } },
        { session: this.session, upsert: true }
      );
      for (let i = 1; i <= missing.length; i++) {
        missing[i - 1][primary] = (doc.autoInc ?? 0) + i;
      }
    }
  }
  async create(sel, data) {
    const { table, model } = sel;
    const lastTask = Promise.resolve(this._createTasks[table]).catch(import_cosmokit2.noop);
    return this._createTasks[table] = lastTask.then(async () => {
      const coll = this.db.collection(table);
      await this.ensurePrimary(table, [data]);
      try {
        const copy = this.unpatchVirtual(table, { ...this.builder.dump(data, model) });
        const insertedId = (await coll.insertOne(copy, { session: this.session })).insertedId;
        if (this.shouldFillPrimary(table)) {
          return { ...data, [model.primary]: insertedId };
        } else return data;
      } catch (err) {
        if (err instanceof import_mongodb2.MongoError && err.code === 11e3) {
          throw new import_minato2.RuntimeError("duplicate-entry", err.message);
        }
        throw err;
      }
    });
  }
  async upsert(sel, data, keys) {
    if (!data.length) return {};
    const { table, ref, model } = sel;
    const coll = this.db.collection(table);
    if (this.shouldEnsurePrimary(table)) {
      const original = (await coll.find({
        $or: data.map((item) => {
          return this.transformQuery(sel, (0, import_cosmokit2.pick)(item, keys), table);
        })
      }, { session: this.session }).toArray()).map((row) => this.patchVirtual(table, row));
      const bulk = coll.initializeUnorderedBulkOp();
      const insertion = [];
      for (const update of data) {
        const item = original.find((item2) => keys.every((key) => item2[key]?.valueOf() === update[key]?.valueOf()));
        if (item) {
          const updateFields = new Set(Object.keys(update).map((key) => key.split(".", 1)[0]));
          const override = this.builder.dump((0, import_cosmokit2.omit)((0, import_cosmokit2.pick)((0, import_minato2.executeUpdate)(item, update, ref), updateFields), keys), model);
          const query = this.transformQuery(sel, (0, import_cosmokit2.pick)(item, keys), table);
          if (!query) continue;
          bulk.find(query).updateOne({ $set: override });
        } else {
          insertion.push(update);
        }
      }
      await this.ensurePrimary(table, insertion);
      for (const update of insertion) {
        const copy = this.builder.dump((0, import_minato2.executeUpdate)(model.create(), update, ref), model);
        bulk.insert(this.unpatchVirtual(table, copy));
      }
      const result = await bulk.execute({ session: this.session });
      return { inserted: result.insertedCount + result.upsertedCount, matched: result.matchedCount, modified: result.modifiedCount };
    } else {
      const bulk = coll.initializeUnorderedBulkOp();
      const initial = model.create();
      const hasInitial = !!Object.keys(initial).length;
      for (const update of data) {
        const query = this.transformQuery(sel, (0, import_cosmokit2.pick)(update, keys), table);
        const transformer = new Builder(this, Object.keys(sel.tables), this.getVirtualKey(table), "$" + tempKey + ".");
        const $set = (0, import_cosmokit2.mapValues)(update, (item, key) => transformer.toUpdateExpr(item, model.getType(key)));
        const $unset = Object.entries($set).filter(([_, value]) => typeof value === "object").map(([key, _]) => key);
        const preset = Object.fromEntries(transformer.walkedKeys.map((key) => [tempKey + "." + key, {
          $ifNull: ["$" + key, initial[key]]
        }]));
        bulk.find(query).upsert().updateOne([
          ...transformer.walkedKeys.length ? [{ $set: preset }] : [],
          ...hasInitial ? [{ $replaceRoot: { newRoot: { $mergeObjects: [initial, "$$ROOT"] } } }] : [],
          ...$unset.length ? [{ $unset }] : [],
          { $set },
          ...transformer.walkedKeys.length ? [{ $unset: [tempKey] }] : []
        ]);
      }
      const result = await bulk.execute({ session: this.session });
      return { inserted: result.insertedCount + result.upsertedCount, matched: result.matchedCount, modified: result.modifiedCount };
    }
  }
  async withTransaction(callback) {
    if (this._replSet) {
      await this.client.withSession((session) => session.withTransaction(() => callback(session), { readPreference: "primary" }));
    } else {
      await callback(void 0);
    }
  }
  async getIndexes(table) {
    const indexes = await this.db.collection(table).listIndexes().toArray();
    return indexes.map(({ name, key, unique }) => ({
      name,
      unique: !!unique,
      keys: (0, import_cosmokit2.mapValues)(key, (value) => value === 1 ? "asc" : value === -1 ? "desc" : value)
    }));
  }
  async createIndex(table, index) {
    const keys = (0, import_cosmokit2.mapValues)(index.keys, (value) => value === "asc" ? 1 : value === "desc" ? -1 : (0, import_cosmokit2.isNullable)(value) ? 1 : value);
    const { fields } = this.model(table);
    const nullable = Object.keys(index.keys).every((key) => fields[key]?.nullable);
    await this.db.collection(table).createIndex(keys, {
      name: index.name,
      unique: !!index.unique,
      ...nullable ? {} : {
        partialFilterExpression: Object.fromEntries(Object.keys(index.keys).map((key) => [key, {
          $type: [import_mongodb2.BSONType.date, import_mongodb2.BSONType.int, import_mongodb2.BSONType.long, import_mongodb2.BSONType.string, import_mongodb2.BSONType.objectId]
        }]))
      }
    });
  }
  async dropIndex(table, name) {
    await this.db.collection(table).dropIndex(name);
  }
  logPipeline(table, pipeline) {
    this.logger.debug("%s %s", table, JSON.stringify(pipeline, (_, value) => typeof value === "bigint" ? `${value}n` : value));
  }
};
((MongoDriver2) => {
  MongoDriver2.Config = import_minato2.z.object({
    protocol: import_minato2.z.string().default("mongodb"),
    host: import_minato2.z.string().default("localhost"),
    port: import_minato2.z.natural().max(65535),
    username: import_minato2.z.string(),
    password: import_minato2.z.string().role("secret"),
    database: import_minato2.z.string().required(),
    authDatabase: import_minato2.z.string(),
    writeConcern: import_minato2.z.object({
      w: import_minato2.z.union([
        import_minato2.z.const(void 0),
        import_minato2.z.number().required(),
        import_minato2.z.const("majority").required()
      ]),
      wtimeoutMS: import_minato2.z.number(),
      journal: import_minato2.z.boolean()
    })
  }).i18n({
    "en-US": en_US_default,
    "zh-CN": zh_CN_default
  });
})(MongoDriver || (MongoDriver = {}));
var src_default = MongoDriver;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MongoDriver
});
//# sourceMappingURL=index.cjs.map
