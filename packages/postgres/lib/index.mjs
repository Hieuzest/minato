var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
import postgres from "postgres";
import { Binary as Binary2, difference, isNullable as isNullable2, makeArray, pick } from "cosmokit";
import { Driver as Driver2, executeUpdate, Field as Field2, z } from "minato";
import { isBracketed as isBracketed2 } from "@minatojs/sql-utils";

// src/builder.ts
import { Builder, isBracketed } from "@minatojs/sql-utils";
import { Binary, isNullable, Time } from "cosmokit";
import { Field, isAggrExpr, isEvalExpr, randomId, Type, unravel } from "minato";
function escapeId(value) {
  return '"' + value.replace(/"/g, '""') + '"';
}
__name(escapeId, "escapeId");
function formatTime(time) {
  const year = time.getFullYear().toString();
  const month = Time.toDigits(time.getMonth() + 1);
  const date = Time.toDigits(time.getDate());
  const hour = Time.toDigits(time.getHours());
  const min = Time.toDigits(time.getMinutes());
  const sec = Time.toDigits(time.getSeconds());
  const ms = Time.toDigits(time.getMilliseconds(), 3);
  let timezone = Time.toDigits(time.getTimezoneOffset() / -60);
  if (!timezone.startsWith("-")) timezone = `+${timezone}`;
  return `${year}-${month}-${date} ${hour}:${min}:${sec}.${ms}${timezone}`;
}
__name(formatTime, "formatTime");
var PostgresBuilder = class extends Builder {
  constructor(driver, tables) {
    super(driver, tables);
    this.driver = driver;
    this.tables = tables;
    this.queryOperators = {
      ...this.queryOperators,
      $regex: /* @__PURE__ */ __name((key, value) => this.createRegExpQuery(key, value), "$regex"),
      $regexFor: /* @__PURE__ */ __name((key, value) => typeof value === "string" ? `${this.escape(value)} ~ ${key}` : `${this.escape(value.input)} ${value.flags?.includes("i") ? "~*" : "~"} ${key}`, "$regexFor"),
      $size: /* @__PURE__ */ __name((key, value) => {
        if (this.isJsonQuery(key)) {
          return `${this.jsonLength(key)} = ${this.escape(value)}`;
        } else {
          if (!value) return `COALESCE(ARRAY_LENGTH(${key}, 1), 0) = 0`;
          return `${key} IS NOT NULL AND ARRAY_LENGTH(${key}, 1) = ${value}`;
        }
      }, "$size")
    };
    this.evalOperators = {
      ...this.evalOperators,
      $select: /* @__PURE__ */ __name((args) => `${args.map((arg) => this.parseEval(arg, this.transformType(arg))).join(", ")}`, "$select"),
      $if: /* @__PURE__ */ __name((args) => {
        const type = this.transformType(args[1]) ?? this.transformType(args[2]) ?? "text";
        return `(SELECT CASE WHEN ${this.parseEval(args[0], "boolean")} THEN ${this.parseEval(args[1], type)} ELSE ${this.parseEval(args[2], type)} END)`;
      }, "$if"),
      $ifNull: /* @__PURE__ */ __name((args) => {
        const type = args.map(this.transformType).find((x) => x) ?? "text";
        return `coalesce(${args.map((arg) => this.parseEval(arg, type)).join(", ")})`;
      }, "$ifNull"),
      $regex: /* @__PURE__ */ __name(([key, value, flags]) => `(${this.parseEval(key)} ${flags?.includes("i") || value instanceof RegExp && value.flags.includes("i") ? "~*" : "~"} ${this.parseEval(value)})`, "$regex"),
      // number
      $add: /* @__PURE__ */ __name((args) => `(${args.map((arg) => this.parseEval(arg, "double precision")).join(" + ")})`, "$add"),
      $multiply: /* @__PURE__ */ __name((args) => `(${args.map((arg) => this.parseEval(arg, "double precision")).join(" * ")})`, "$multiply"),
      $modulo: /* @__PURE__ */ __name(([left, right]) => {
        const dividend = this.parseEval(left, "double precision"), divisor = this.parseEval(right, "double precision");
        return `(${dividend} - (${divisor} * floor(${dividend} / ${divisor})))`;
      }, "$modulo"),
      $log: /* @__PURE__ */ __name(([left, right]) => isNullable(right) ? `ln(${this.parseEval(left, "double precision")})` : `(ln(${this.parseEval(left, "double precision")}) / ln(${this.parseEval(right, "double precision")}))`, "$log"),
      $random: /* @__PURE__ */ __name(() => `random()`, "$random"),
      $or: /* @__PURE__ */ __name((args) => {
        const type = Type.fromTerm(this.state.expr, Type.Boolean);
        if (Field.boolean.includes(type.type)) return this.logicalOr(args.map((arg) => this.parseEval(arg, "boolean")));
        else return `(${args.map((arg) => this.parseEval(arg, "bigint")).join(" | ")})`;
      }, "$or"),
      $and: /* @__PURE__ */ __name((args) => {
        const type = Type.fromTerm(this.state.expr, Type.Boolean);
        if (Field.boolean.includes(type.type)) return this.logicalAnd(args.map((arg) => this.parseEval(arg, "boolean")));
        else return `(${args.map((arg) => this.parseEval(arg, "bigint")).join(" & ")})`;
      }, "$and"),
      $not: /* @__PURE__ */ __name((arg) => {
        const type = Type.fromTerm(this.state.expr, Type.Boolean);
        if (Field.boolean.includes(type.type)) return this.logicalNot(this.parseEval(arg, "boolean"));
        else return `(~(${this.parseEval(arg, "bigint")}))`;
      }, "$not"),
      $xor: /* @__PURE__ */ __name((args) => {
        const type = Type.fromTerm(this.state.expr, Type.Boolean);
        if (Field.boolean.includes(type.type)) return args.map((arg) => this.parseEval(arg, "boolean")).reduce((prev, curr) => `(${prev} != ${curr})`);
        else return `(${args.map((arg) => this.parseEval(arg, "bigint")).join(" # ")})`;
      }, "$xor"),
      $get: /* @__PURE__ */ __name(([x, key]) => {
        const type = Type.fromTerm(this.state.expr, Type.Any);
        const res = typeof key === "string" ? this.asEncoded(`jsonb_extract_path(${this.parseEval(x, false)}, ${key.split(".").map(this.escapeKey).join(",")})`, true) : this.asEncoded(`(${this.parseEval(x, false)})->(${this.parseEval(key, "integer")})`, true);
        return type.type === "expr" ? res : `(${res})::${this.transformType(type)}`;
      }, "$get"),
      $number: /* @__PURE__ */ __name((arg) => {
        const value = this.parseEval(arg);
        const type = Type.fromTerm(arg);
        const res = Field.date.includes(type.type) ? `extract(epoch from ${value})::bigint` : `${value}::double precision`;
        return this.asEncoded(`coalesce(${res}, 0)`, false);
      }, "$number"),
      $sum: /* @__PURE__ */ __name((expr) => this.createAggr(expr, (value) => `coalesce(sum(${value})::double precision, 0)`, void 0, "double precision"), "$sum"),
      $avg: /* @__PURE__ */ __name((expr) => this.createAggr(expr, (value) => `avg(${value})::double precision`, void 0, "double precision"), "$avg"),
      $min: /* @__PURE__ */ __name((expr) => this.createAggr(expr, (value) => `min(${value})`, void 0, "double precision"), "$min"),
      $max: /* @__PURE__ */ __name((expr) => this.createAggr(expr, (value) => `max(${value})`, void 0, "double precision"), "$max"),
      $count: /* @__PURE__ */ __name((expr) => this.createAggr(expr, (value) => `count(distinct ${value})::integer`), "$count"),
      $length: /* @__PURE__ */ __name((expr) => this.createAggr(
        expr,
        (value) => `count(${value})::integer`,
        (value) => this.isEncoded() ? this.jsonLength(value) : this.asEncoded(`COALESCE(ARRAY_LENGTH(${value}, 1), 0)`, false)
      ), "$length"),
      $concat: /* @__PURE__ */ __name((args) => `(${args.map((arg) => this.parseEval(arg, "text")).join("||")})`, "$concat")
    };
    this.transformers["boolean"] = {
      decode: /* @__PURE__ */ __name((value) => `(${value})::boolean`, "decode")
    };
    this.transformers["decimal"] = {
      decode: /* @__PURE__ */ __name((value) => `(${value})::double precision`, "decode"),
      load: /* @__PURE__ */ __name((value) => isNullable(value) ? value : +value, "load")
    };
    this.transformers["bigint"] = {
      encode: /* @__PURE__ */ __name((value) => `cast(${value} as text)`, "encode"),
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as bigint)`, "decode"),
      load: /* @__PURE__ */ __name((value) => isNullable(value) ? value : BigInt(value), "load"),
      dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : `${value}`, "dump")
    };
    this.transformers["binary"] = {
      encode: /* @__PURE__ */ __name((value) => `encode(${value}, 'base64')`, "encode"),
      decode: /* @__PURE__ */ __name((value) => `decode(${value}, 'base64')`, "decode"),
      load: /* @__PURE__ */ __name((value) => isNullable(value) || typeof value === "object" ? value : Binary.fromBase64(value), "load"),
      dump: /* @__PURE__ */ __name((value) => isNullable(value) || typeof value === "string" ? value : Binary.toBase64(value), "dump")
    };
    this.transformers["date"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as date)`, "decode"),
      load: /* @__PURE__ */ __name((value) => {
        if (isNullable(value) || typeof value === "object") return value;
        const parsed = new Date(value), date = /* @__PURE__ */ new Date();
        date.setFullYear(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        date.setHours(0, 0, 0, 0);
        return date;
      }, "load"),
      dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : formatTime(value), "dump")
    };
    this.transformers["time"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as time)`, "decode"),
      load: /* @__PURE__ */ __name((value) => this.driver.types["time"].load(value), "load"),
      dump: /* @__PURE__ */ __name((value) => this.driver.types["time"].dump(value), "dump")
    };
    this.transformers["timestamp"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as timestamp)`, "decode"),
      load: /* @__PURE__ */ __name((value) => {
        if (isNullable(value) || typeof value === "object") return value;
        return new Date(value);
      }, "load"),
      dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : formatTime(value), "dump")
    };
  }
  static {
    __name(this, "PostgresBuilder");
  }
  escapeMap = {
    "'": "''"
  };
  $true = "TRUE";
  $false = "FALSE";
  upsert(table) {
    this.modifiedTable = table;
  }
  binary(operator, eltype = "double precision") {
    return ([left, right]) => {
      const type = this.transformType(left) ?? this.transformType(right) ?? eltype;
      return `(${this.parseEval(left, type)} ${operator} ${this.parseEval(right, type)})`;
    };
  }
  transformType(source) {
    const type = Type.isType(source) ? source : Type.fromTerm(source);
    if (Field.string.includes(type.type) || typeof source === "string") return "text";
    else if (["integer", "unsigned", "bigint"].includes(type.type) || typeof source === "bigint") return "bigint";
    else if (Field.number.includes(type.type) || typeof source === "number") return "double precision";
    else if (Field.boolean.includes(type.type) || typeof source === "boolean") return "boolean";
    else if (type.type === "json") return "jsonb";
    else if (type.type !== "expr") return true;
  }
  parseEval(expr, outtype = true) {
    this.state.encoded = false;
    if (typeof expr === "string" || typeof expr === "number" || typeof expr === "boolean" || expr instanceof Date || expr instanceof RegExp) {
      return this.escape(expr);
    }
    return outtype ? this.encode(this.parseEvalExpr(expr), false, false, Type.fromTerm(expr), typeof outtype === "string" ? outtype : void 0) : this.parseEvalExpr(expr);
  }
  createRegExpQuery(key, value) {
    if (typeof value !== "string" && value.flags?.includes("i")) {
      return `${key} ~* ${this.escape(typeof value === "string" ? value : value.source)}`;
    } else {
      return `${key} ~ ${this.escape(typeof value === "string" ? value : value.source)}`;
    }
  }
  createElementQuery(key, value) {
    if (this.isJsonQuery(key)) {
      const type = Type.getInner(Type.fromTerm(this.state.expr));
      return this.jsonContains(key, this.encode(`${this.escapePrimitive(value, type)}::${this.transformType(type)}`, true, true));
    } else {
      return `${key} && ARRAY['${value}']::TEXT[]`;
    }
  }
  createMemberQuery(key, value, notStr = "") {
    if (Array.isArray(value)) {
      if (!value.length) return notStr ? this.$true : this.$false;
      if (Array.isArray(value[0])) {
        return `(${key})${notStr} in (${value.map((val) => `(${val.map((x) => this.escape(x)).join(", ")})`).join(", ")})`;
      }
      return `${key}${notStr} in (${value.map((val) => this.escape(val)).join(", ")})`;
    } else if (value.$exec) {
      return `(${key})${notStr} in ${this.parseSelection(value.$exec, true)}`;
    } else if (Type.fromTerm(value)?.type === "list") {
      const res = this.listContains(this.parseEval(value), key);
      return notStr ? this.logicalNot(res) : res;
    } else {
      const obj = this.parseEval(value, false);
      const type = Type.getInner(Type.fromTerm(this.state.expr));
      const res = this.jsonContains(obj, this.encode(`${key}::${this.transformType(type)}`, true, true));
      return notStr ? this.logicalNot(res) : res;
    }
  }
  createAggr(expr, aggr, nonaggr, eltype) {
    if (!this.state.group && !nonaggr) {
      const value = this.parseEval(expr, false);
      return `(select ${aggr(`(${this.encode(this.escapeId("value"), false, true, void 0)})${eltype ? `::${eltype}` : ""}`)}
        from jsonb_array_elements(${value}) ${randomId()})`;
    } else {
      return super.createAggr(expr, aggr, nonaggr);
    }
  }
  transformJsonField(obj, path) {
    return this.asEncoded(`jsonb_extract_path(${obj}, ${path.slice(1).replaceAll(".", ",")})`, true);
  }
  listContains(list, value) {
    return this.asEncoded(`(${list} @> ARRAY[${value}])`, false);
  }
  jsonLength(value) {
    return this.asEncoded(`jsonb_array_length(${value})`, false);
  }
  jsonContains(obj, value) {
    return this.asEncoded(`(${obj} @> ${value})`, false);
  }
  encode(value, encoded, pure = false, type, outtype) {
    outtype ??= this.transformType(type);
    return this.asEncoded(
      encoded === this.isEncoded() && !pure ? value : encoded ? `to_jsonb(${this.transform(value, type, "encode")})` : this.transform(`(jsonb_build_object('v', ${value})->>'v')`, type, "decode") + `${typeof outtype === "string" ? `::${outtype}` : ""}`,
      pure ? void 0 : encoded
    );
  }
  groupObject(_fields) {
    const _groupObject = /* @__PURE__ */ __name((fields, type, prefix = "") => {
      const parse = /* @__PURE__ */ __name((expr, key) => {
        const value = !_fields[`${prefix}${key}`] && type && Type.getInner(type, key)?.inner ? _groupObject(expr, Type.getInner(type, key), `${prefix}${key}.`) : this.parseEval(expr, false);
        return this.isEncoded() ? this.encode(`to_jsonb(${value})`, true) : this.transform(value, expr, "encode");
      }, "parse");
      return `jsonb_build_object(` + Object.entries(fields).map(([key, expr]) => `'${key}', ${parse(expr, key)}`).join(",") + `)`;
    }, "_groupObject");
    return this.asEncoded(_groupObject(unravel(_fields), Type.fromTerm(this.state.expr), ""), true);
  }
  groupArray(value) {
    return this.asEncoded(`coalesce(jsonb_agg(${value}), '[]'::jsonb)`, true);
  }
  parseSelection(sel, inline = false) {
    const { args: [expr], ref, table, tables } = sel;
    const restore = this.saveState({ tables });
    const inner = this.get(table, true, true);
    const output = this.parseEval(expr, false);
    const fields = expr["$select"]?.map((x) => this.getRecursive(x["$"]));
    const where = fields && this.logicalAnd(fields.map((x) => `(${x} is not null)`));
    restore();
    if (inline || !isAggrExpr(expr)) {
      return `(SELECT ${output} FROM ${inner} ${isBracketed(inner) ? ref : ""}${where ? ` WHERE ${where}` : ""})`;
    } else {
      return [
        `(coalesce((SELECT ${this.groupArray(this.transform(output, Type.getInner(Type.fromTerm(expr)), "encode"))}`,
        `FROM ${inner} ${isBracketed(inner) ? ref : ""}), '[]'::jsonb))`
      ].join(" ");
    }
  }
  escapeId = escapeId;
  escapeKey(value) {
    return `'${value}'`;
  }
  escapePrimitive(value, type) {
    if (value instanceof Date) {
      value = formatTime(value);
    } else if (value instanceof RegExp) {
      value = value.source;
    } else if (Binary.is(value)) {
      return `'\\x${Binary.toHex(value)}'::bytea`;
    } else if (Binary.isSource(value)) {
      return `'\\x${Binary.toHex(Binary.fromSource(value))}'::bytea`;
    } else if (type?.type === "list" && Array.isArray(value)) {
      return `ARRAY[${value.map((x) => this.escape(x)).join(", ")}]::TEXT[]`;
    } else if (!!value && typeof value === "object") {
      return `${this.quote(JSON.stringify(value))}::jsonb`;
    }
    return super.escapePrimitive(value, type);
  }
  toUpdateExpr(item, key, field, upsert) {
    const escaped = this.escapeId(key);
    if (key in item) {
      if (!isEvalExpr(item[key]) && upsert) {
        return `excluded.${escaped}`;
      } else if (isEvalExpr(item[key])) {
        return this.parseEval(item[key]);
      } else {
        return this.escape(item[key], field);
      }
    }
    const jsonInit = {};
    for (const prop in item) {
      if (!prop.startsWith(key + ".")) continue;
      const rest = prop.slice(key.length + 1).split(".");
      if (rest.length === 1) continue;
      rest.reduce((obj, k) => obj[k] ??= {}, jsonInit);
    }
    const valueInit = this.modifiedTable ? `coalesce(${this.escapeId(this.modifiedTable)}.${escaped}, '{}')::jsonb` : `coalesce(${escaped}, '{}')::jsonb`;
    let value = valueInit;
    if (Object.keys(jsonInit).length !== 0) {
      value = `(jsonb ${this.escape(jsonInit, "json")} || ${value})`;
    }
    for (const prop in item) {
      if (!prop.startsWith(key + ".")) continue;
      const rest = prop.slice(key.length + 1).split(".");
      const type = Type.getInner(field?.type, prop.slice(key.length + 1));
      let escaped2;
      const v = isEvalExpr(item[prop]) ? this.encode(this.parseEval(item[prop]), true, true, Type.fromTerm(item[prop])) : (escaped2 = this.transform(this.escape(item[prop], type), type, "encode"), escaped2.endsWith("::jsonb") ? escaped2 : escaped2.startsWith(`'`) ? this.encode(`(${escaped2})::text`, true, true) : this.encode(escaped2, true, true));
      value = `jsonb_set(${value}, '{${rest.map((key2) => `"${key2}"`).join(",")}}', ${v}, true)`;
    }
    if (value === valueInit) {
      return this.modifiedTable ? `${this.escapeId(this.modifiedTable)}.${escaped}` : escaped;
    } else {
      return value;
    }
  }
};

// src/locales/zh-CN.yml
var zh_CN_default = { host: "要连接到的主机名。", port: "要连接到的端口号。", username: "要使用的用户名。", password: "要使用的密码。", database: "要访问的数据库名。" };

// src/locales/en-US.yml
var en_US_default = { host: "The hostname of the database you are connecting to.", port: "The port number to connect to.", user: "The MySQL user to authenticate as.", password: "The password of that MySQL user.", database: "Name of the database to use for this connection." };

// src/index.ts
var timeRegex = /(\d+):(\d+):(\d+)(\.(\d+))?/;
function createIndex(keys) {
  return makeArray(keys).map(escapeId).join(", ");
}
__name(createIndex, "createIndex");
var PostgresDriver = class extends Driver2 {
  static name = "postgres";
  postgres;
  sql = new PostgresBuilder(this);
  session;
  _counter = 0;
  _queryTasks = [];
  async start() {
    this.postgres = postgres({
      onnotice: /* @__PURE__ */ __name(() => {
      }, "onnotice"),
      debug: /* @__PURE__ */ __name((_, query, parameters) => {
        this.logger.debug(`> %s` + (parameters.length ? `
parameters: %o` : ``), query, parameters.length ? parameters : "");
      }, "debug"),
      ...this.config
    });
    this.define({
      types: ["json"],
      dump: /* @__PURE__ */ __name((value) => value, "dump"),
      load: /* @__PURE__ */ __name((value) => value, "load")
    });
    this.define({
      types: ["time"],
      dump: /* @__PURE__ */ __name((date) => date ? typeof date === "string" ? date : formatTime(date) : null, "dump"),
      load: /* @__PURE__ */ __name((str) => {
        if (isNullable2(str)) return str;
        const date = /* @__PURE__ */ new Date(0);
        const parsed = timeRegex.exec(str);
        if (!parsed) throw Error(`unexpected time value: ${str}`);
        date.setHours(+parsed[1], +parsed[2], +parsed[3], +(parsed[5] ?? 0));
        return date;
      }, "load")
    });
    this.define({
      types: ["binary"],
      dump: /* @__PURE__ */ __name((value) => value, "dump"),
      load: /* @__PURE__ */ __name((value) => isNullable2(value) ? value : Binary2.fromSource(value), "load")
    });
    this.define({
      types: Field2.number,
      dump: /* @__PURE__ */ __name((value) => value, "dump"),
      load: /* @__PURE__ */ __name((value) => isNullable2(value) ? value : +value, "load")
    });
    this.define({
      types: ["bigint"],
      dump: /* @__PURE__ */ __name((value) => isNullable2(value) ? value : value.toString(), "dump"),
      load: /* @__PURE__ */ __name((value) => isNullable2(value) ? value : BigInt(value), "load")
    });
  }
  async stop() {
    await this.postgres.end();
  }
  async query(sql) {
    return await (this.session ?? this.postgres).unsafe(sql).catch((e) => {
      this.logger.warn("> %s", sql);
      throw e;
    });
  }
  queue(sql, values) {
    if (this.session) {
      return this.query(sql);
    }
    return new Promise((resolve, reject) => {
      this._queryTasks.push({ sql, resolve, reject });
      process.nextTick(() => this._flushTasks());
    });
  }
  async _flushTasks() {
    const tasks = this._queryTasks;
    if (!tasks.length) return;
    this._queryTasks = [];
    try {
      let results = await this.query(tasks.map((task) => task.sql).join(";\n"));
      if (tasks.length === 1) results = [results];
      tasks.forEach((task, index) => {
        task.resolve(results[index]);
      });
    } catch (error) {
      tasks.forEach((task) => task.reject(error));
    }
  }
  async prepare(name) {
    const [columns, constraints] = await Promise.all([
      this.queue(`SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${this.sql.escape(name)}`),
      this.queue(
        `SELECT * FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = ${this.sql.escape(name)}`
      )
    ]);
    const table = this.model(name);
    const { primary, foreign } = table;
    const fields = { ...table.availableFields() };
    const unique = [...table.unique];
    const create = [];
    const update = [];
    const rename = [];
    for (const key in fields) {
      const { initial, nullable = true } = fields[key];
      const legacy = [key, ...fields[key].legacy || []];
      const column = columns.find((info) => legacy.includes(info.column_name));
      let shouldUpdate = column?.column_name !== key;
      const field = Object.assign({ autoInc: primary.includes(key) && table.autoInc }, fields[key]);
      const typedef = this.getTypeDef(field);
      if (column && !shouldUpdate) {
        shouldUpdate = this.isDefUpdated(field, column, typedef);
      }
      if (!column) {
        create.push(`${escapeId(key)} ${typedef} ${makeArray(primary).includes(key) || !nullable ? "not null" : "null"}` + (!primary.includes(key) && !isNullable2(initial) ? " DEFAULT " + this.sql.escape(initial, fields[key]) : ""));
      } else if (shouldUpdate) {
        if (column.column_name !== key) rename.push(`RENAME ${escapeId(column.column_name)} TO ${escapeId(key)}`);
        update.push(`ALTER ${escapeId(key)} TYPE ${typedef}`);
        update.push(`ALTER ${escapeId(key)} ${makeArray(primary).includes(key) || !nullable ? "SET" : "DROP"} NOT NULL`);
        if (!isNullable2(initial)) update.push(`ALTER ${escapeId(key)} SET DEFAULT ${this.sql.escape(initial, fields[key])}`);
      }
    }
    if (!columns.length) {
      create.push(`PRIMARY KEY (${createIndex(primary)})`);
      for (const key in foreign) {
        const [table2, key2] = foreign[key];
        create.push(`FOREIGN KEY (${escapeId(key)}) REFERENCES ${escapeId(table2)} (${escapeId(key2)})`);
      }
    }
    for (const key of unique) {
      let oldIndex;
      let shouldUpdate = false;
      const oldKeys = makeArray(key).map((key2) => {
        const legacy = [key2, ...fields[key2].legacy || []];
        const column = columns.find((info) => legacy.includes(info.column_name));
        if (column?.column_name !== key2) shouldUpdate = true;
        return column?.column_name;
      });
      if (oldKeys.every(Boolean)) {
        const name3 = `unique:${table.name}:` + oldKeys.join("+");
        oldIndex = constraints.find((info) => info.constraint_name === name3);
      }
      const name2 = `unique:${table.name}:` + makeArray(key).join("+");
      if (!oldIndex) {
        create.push(`CONSTRAINT ${escapeId(name2)} UNIQUE (${createIndex(key)})`);
      } else if (shouldUpdate) {
        create.push(`CONSTRAINT ${escapeId(name2)} UNIQUE (${createIndex(key)})`);
        update.push(`DROP CONSTRAINT ${escapeId(oldIndex.constraint_name)}`);
      }
    }
    if (!columns.length) {
      this.logger.info("auto creating table %c", name);
      return this.query(`CREATE TABLE ${escapeId(name)} (${create.join(", ")}, _pg_mtime BIGINT)`);
    }
    const operations = [
      ...create.map((def) => "ADD " + def),
      ...update
    ];
    if (operations.length) {
      this.logger.info("auto updating table %c", name);
      if (rename.length) {
        await Promise.all(rename.map((op) => this.query(`ALTER TABLE ${escapeId(name)} ${op}`)));
      }
      await this.query(`ALTER TABLE ${escapeId(name)} ${operations.join(", ")}`);
    }
    const dropKeys = [];
    await this.migrate(name, {
      error: this.logger.warn,
      before: /* @__PURE__ */ __name((keys) => keys.every((key) => columns.some((info) => info.column_name === key)), "before"),
      after: /* @__PURE__ */ __name((keys) => dropKeys.push(...keys), "after"),
      finalize: /* @__PURE__ */ __name(async () => {
        if (!dropKeys.length) return;
        this.logger.info("auto migrating table %c", name);
        await this.query(`ALTER TABLE ${escapeId(name)} ${dropKeys.map((key) => `DROP ${escapeId(key)}`).join(", ")}`);
      }, "finalize")
    });
  }
  async drop(table) {
    await this.query(`DROP TABLE IF EXISTS ${escapeId(table)} CASCADE`);
  }
  async dropAll() {
    const tables = await this.queue(`SELECT * FROM information_schema.tables WHERE table_schema = 'public'`);
    if (!tables.length) return;
    await this.query(`DROP TABLE IF EXISTS ${tables.map((t) => escapeId(t.table_name)).join(",")} CASCADE`);
  }
  async stats() {
    const names = Object.keys(this.database.tables);
    const tables = (await this.queue(`SELECT * FROM information_schema.tables WHERE table_schema = 'public'`)).map((t) => t.table_name).filter((name) => names.includes(name));
    const tableStats = await this.queue(
      tables.map(
        (name) => `SELECT '${name}' AS name, pg_total_relation_size('${escapeId(name)}') AS size, COUNT(*) AS count FROM ${escapeId(name)}`
      ).join(" UNION ")
    ).then((s) => s.map((t) => [t.name, { size: +t.size, count: +t.count }]));
    return {
      size: tableStats.reduce((p, c) => p += c[1].size, 0),
      tables: Object.fromEntries(tableStats)
    };
  }
  async get(sel) {
    const builder = new PostgresBuilder(this, sel.tables);
    const query = builder.get(sel);
    if (!query) return [];
    return this.queue(query).then((data) => {
      return data.map((row) => builder.load(row, sel.model));
    });
  }
  async eval(sel, expr) {
    const builder = new PostgresBuilder(this, sel.tables);
    const inner = builder.get(sel.table, true, true);
    const output = builder.parseEval(expr, false);
    const ref = isBracketed2(inner) ? sel.ref : "";
    const [data] = await this.queue(`SELECT ${output} AS value FROM ${inner} ${ref}`);
    return builder.load(data?.value, expr);
  }
  async set(sel, data) {
    const { model, query, table, tables, ref } = sel;
    const builder = new PostgresBuilder(this, tables);
    const filter = builder.parseQuery(query);
    const fields = model.availableFields();
    if (filter === "0") return {};
    const updateFields = [...new Set(Object.keys(data).map((key) => {
      return Object.keys(fields).find((field) => field === key || key.startsWith(field + "."));
    }))];
    const update = updateFields.map((field) => {
      const escaped = builder.escapeId(field);
      return `${escaped} = ${builder.toUpdateExpr(data, field, fields[field], false)}`;
    }).join(", ");
    const result = await this.query(`UPDATE ${builder.escapeId(table)} ${ref} SET ${update} WHERE ${filter} RETURNING *`);
    return { matched: result.length };
  }
  async remove(sel) {
    const builder = new PostgresBuilder(this, sel.tables);
    const query = builder.parseQuery(sel.query);
    if (query === "FALSE") return {};
    const { count } = await this.query(`DELETE FROM ${builder.escapeId(sel.table)} WHERE ${query}`);
    return { matched: count, removed: count };
  }
  async create(sel, data) {
    const { table, model } = sel;
    const builder = new PostgresBuilder(this, sel.tables);
    const formatted = builder.dump(data, model);
    const keys = Object.keys(formatted);
    const [row] = await this.query([
      `INSERT INTO ${builder.escapeId(table)} (${keys.map(builder.escapeId).join(", ")})`,
      `VALUES (${keys.map((key) => builder.escapePrimitive(formatted[key], model.getType(key))).join(", ")})`,
      `RETURNING *`
    ].join(" "));
    return builder.load(row, model);
  }
  async upsert(sel, data, keys) {
    if (!data.length) return {};
    const { model, table, tables, ref } = sel;
    const builder = new PostgresBuilder(this, tables);
    builder.upsert(table);
    this._counter = (this._counter + 1) % 256;
    const mtime = Date.now() * 256 + this._counter;
    const merged = {};
    const insertion = data.map((item) => {
      Object.assign(merged, item);
      return model.format(executeUpdate(model.create(), item, ref));
    });
    const initFields = Object.keys(model.availableFields());
    const dataFields = [...new Set(Object.keys(merged).map((key) => {
      return initFields.find((field) => field === key || key.startsWith(field + "."));
    }))];
    let updateFields = difference(dataFields, keys);
    if (!updateFields.length) updateFields = dataFields.length ? [dataFields[0]] : [];
    const createFilter = /* @__PURE__ */ __name((item) => builder.parseQuery(pick(item, keys)), "createFilter");
    const createMultiFilter = /* @__PURE__ */ __name((items) => {
      if (items.length === 1) {
        return createFilter(items[0]);
      } else if (keys.length === 1) {
        const key = keys[0];
        return builder.parseQuery({ [key]: items.map((item) => item[key]) });
      } else {
        return items.map(createFilter).join(" OR ");
      }
    }, "createMultiFilter");
    const formatValues = /* @__PURE__ */ __name((table2, data2, keys2) => {
      return keys2.map((key) => {
        const field = this.database.tables[table2]?.fields[key];
        if (model.autoInc && model.primary === key && !data2[key]) return "default";
        return builder.escape(data2[key], field);
      }).join(", ");
    }, "formatValues");
    const update = updateFields.map((field) => {
      const escaped = builder.escapeId(field);
      const branches = {};
      data.forEach((item) => {
        (branches[builder.toUpdateExpr(item, field, model.fields[field], true)] ??= []).push(item);
      });
      const entries = Object.entries(branches).map(([expr, items]) => [createMultiFilter(items), expr]).sort(([a], [b]) => a.length - b.length).reverse();
      let value = "CASE ";
      for (let index = 0; index < entries.length; index++) {
        value += `WHEN (${entries[index][0]}) THEN (${entries[index][1]}) `;
      }
      value += "END";
      return `${escaped} = ${value}`;
    }).join(", ");
    const result = await this.query([
      `INSERT INTO ${builder.escapeId(table)} (${initFields.map(builder.escapeId).join(", ")})`,
      `VALUES (${insertion.map((item) => formatValues(table, item, initFields)).join("), (")})`,
      update ? `ON CONFLICT (${keys.map(builder.escapeId).join(", ")})` : "",
      update ? `DO UPDATE SET ${update}, _pg_mtime = ${mtime}` : "",
      `RETURNING _pg_mtime as rtime`
    ].join(" "));
    return { inserted: result.filter(({ rtime }) => +rtime !== mtime).length, matched: result.filter(({ rtime }) => +rtime === mtime).length };
  }
  async withTransaction(callback) {
    return this.postgres.begin((conn) => callback(conn));
  }
  async getIndexes(table) {
    const indexes = await this.queue(`SELECT * FROM pg_indexes WHERE schemaname = 'public' AND tablename = ${this.sql.escape(table)}`);
    const result = [];
    for (const { indexname: name, indexdef: sql } of indexes) {
      result.push({
        name,
        unique: sql.toUpperCase().startsWith("CREATE UNIQUE"),
        keys: this._parseIndexDef(sql)
      });
    }
    return Object.values(result);
  }
  async createIndex(table, index) {
    const keyFields = Object.entries(index.keys).map(([key, direction]) => `${escapeId(key)} ${direction ?? "asc"}`).join(", ");
    await this.query(
      `CREATE ${index.unique ? "UNIQUE" : ""} INDEX ${index.name ? `IF NOT EXISTS ${escapeId(index.name)}` : ""} ON ${escapeId(table)} (${keyFields})`
    );
  }
  async dropIndex(table, name) {
    await this.query(`DROP INDEX ${escapeId(name)}`);
  }
  _parseIndexDef(def) {
    try {
      const keys = {}, matches = def.match(/\((.*)\)/);
      matches[1].split(",").forEach((key) => {
        const [name, direction] = key.trim().split(" ");
        keys[name.startsWith('"') ? name.slice(1, -1).replace(/""/g, '"') : name] = direction?.toLowerCase() === "desc" ? "desc" : "asc";
      });
      return keys;
    } catch {
      return {};
    }
  }
  getTypeDef(field) {
    let { deftype: type, length, precision, scale, autoInc } = field;
    switch (type) {
      case "primary":
      case "unsigned":
      case "integer":
        length ||= 4;
        if (precision) return `numeric(${precision}, ${scale ?? 0})`;
        else if (length <= 2) return autoInc ? "smallserial" : "smallint";
        else if (length <= 4) return autoInc ? "serial" : "integer";
        else {
          if (length > 8) this.logger.warn(`type ${type}(${length}) exceeds the max supported length`);
          return autoInc ? "bigserial" : "bigint";
        }
      case "bigint":
        return "bigint";
      case "decimal":
        return `numeric(${precision ?? 10}, ${scale ?? 0})`;
      case "float":
        return "real";
      case "double":
        return "double precision";
      case "char":
        return `varchar(${length || 64}) `;
      case "string":
        return `varchar(${length || 255})`;
      case "text":
        return `text`;
      case "boolean":
        return "boolean";
      case "list":
        return "text[]";
      case "json":
        return "jsonb";
      case "date":
        return "timestamp with time zone";
      case "time":
        return "time with time zone";
      case "timestamp":
        return "timestamp with time zone";
      case "binary":
        return "bytea";
      default:
        throw new Error(`unsupported type: ${type}`);
    }
  }
  isDefUpdated(field, column, def) {
    const typename = def.split(/[ (]/)[0];
    if (field.autoInc) return false;
    if (["unsigned", "integer"].includes(field.deftype)) {
      if (column.data_type !== typename) return true;
    } else if (typename === "text[]") {
      if (column.data_type !== "ARRAY") return true;
    } else if (Field2.date.includes(field.deftype)) {
      if (column.data_type !== def) return true;
    } else if (typename === "varchar") {
      if (column.data_type !== "character varying") return true;
    } else if (typename !== column.data_type) return true;
    switch (field.deftype) {
      case "integer":
      case "unsigned":
      case "char":
      case "string":
        return !!field.length && !!column.character_maximum_length && column.character_maximum_length !== field.length;
      case "decimal":
        return column.numeric_precision !== field.precision || column.numeric_scale !== field.scale;
      case "text":
      case "list":
      case "json":
        return false;
      default:
        return false;
    }
  }
};
((PostgresDriver2) => {
  PostgresDriver2.Config = z.object({
    host: z.string().default("localhost"),
    port: z.natural().max(65535).default(5432),
    user: z.string().default("root"),
    password: z.string().role("secret"),
    database: z.string().required()
  }).i18n({
    "en-US": en_US_default,
    "zh-CN": zh_CN_default
  });
})(PostgresDriver || (PostgresDriver = {}));
var src_default = PostgresDriver;
export {
  PostgresDriver,
  src_default as default
};
//# sourceMappingURL=index.mjs.map
