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
  MySQLDriver: () => MySQLDriver,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_cosmokit2 = require("cosmokit");
var import_mysql = require("@vlasky/mysql");
var import_minato2 = require("minato");
var import_sql_utils2 = require("@minatojs/sql-utils");

// src/builder.ts
var import_sql_utils = require("@minatojs/sql-utils");
var import_cosmokit = require("cosmokit");
var import_minato = require("minato");
var MySQLBuilder = class extends import_sql_utils.Builder {
  constructor(driver, tables, compat = {}) {
    super(driver, tables);
    this.driver = driver;
    this.compat = compat;
    this._dbTimezone = compat.timezone ?? "SYSTEM";
    this.evalOperators.$select = (args) => {
      if (compat.maria || compat.mysql57) {
        return this.asEncoded(`json_object(${args.map((arg) => this.parseEval(arg, false)).flatMap((x, i) => [`${i}`, x]).join(", ")})`, true);
      } else {
        return `${args.map((arg) => this.parseEval(arg)).join(", ")}`;
      }
    };
    this.evalOperators.$sum = (expr) => this.createAggr(expr, (value) => `ifnull(sum(${value}), 0)`, void 0, (value) => `ifnull(minato_cfunc_sum(${value}), 0)`);
    this.evalOperators.$avg = (expr) => this.createAggr(expr, (value) => `avg(${value})`, void 0, (value) => `minato_cfunc_avg(${value})`);
    this.evalOperators.$min = (expr) => this.createAggr(expr, (value) => `min(${value})`, void 0, (value) => `minato_cfunc_min(${value})`);
    this.evalOperators.$max = (expr) => this.createAggr(expr, (value) => `max(${value})`, void 0, (value) => `minato_cfunc_max(${value})`);
    this.evalOperators.$number = (arg) => {
      const value = this.parseEval(arg);
      const type = import_minato.Type.fromTerm(arg);
      const res = type.type === "time" ? `unix_timestamp(convert_tz(addtime('1970-01-01 00:00:00', ${value}), '${this._localTimezone}', '${this._dbTimezone}'))` : ["timestamp", "date"].includes(type.type) ? `unix_timestamp(convert_tz(${value}, '${this._localTimezone}', '${this._dbTimezone}'))` : `(0+${value})`;
      return this.asEncoded(`ifnull(${res}, 0)`, false);
    };
    this.evalOperators.$or = (args) => {
      const type = import_minato.Type.fromTerm(this.state.expr, import_minato.Type.Boolean);
      if (import_minato.Field.boolean.includes(type.type)) return this.logicalOr(args.map((arg) => this.parseEval(arg)));
      else return `cast(${args.map((arg) => this.parseEval(arg)).join(" | ")} as signed)`;
    };
    this.evalOperators.$and = (args) => {
      const type = import_minato.Type.fromTerm(this.state.expr, import_minato.Type.Boolean);
      if (import_minato.Field.boolean.includes(type.type)) return this.logicalAnd(args.map((arg) => this.parseEval(arg)));
      else return `cast(${args.map((arg) => this.parseEval(arg)).join(" & ")} as signed)`;
    };
    this.evalOperators.$not = (arg) => {
      const type = import_minato.Type.fromTerm(this.state.expr, import_minato.Type.Boolean);
      if (import_minato.Field.boolean.includes(type.type)) return this.logicalNot(this.parseEval(arg));
      else return `cast(~(${this.parseEval(arg)}) as signed)`;
    };
    this.evalOperators.$xor = (args) => {
      const type = import_minato.Type.fromTerm(this.state.expr, import_minato.Type.Boolean);
      if (import_minato.Field.boolean.includes(type.type)) return args.map((arg) => this.parseEval(arg)).reduce((prev, curr) => `(${prev} != ${curr})`);
      else return `cast(${args.map((arg) => this.parseEval(arg)).join(" ^ ")} as signed)`;
    };
    this.transformers["boolean"] = {
      encode: /* @__PURE__ */ __name((value) => `if(${value}=true, 1, 0)`, "encode"),
      decode: /* @__PURE__ */ __name((value) => `if(${value}=1, true, false)`, "decode"),
      load: /* @__PURE__ */ __name((value) => (0, import_cosmokit.isNullable)(value) ? value : !!value, "load"),
      dump: /* @__PURE__ */ __name((value) => (0, import_cosmokit.isNullable)(value) ? value : value ? 1 : 0, "dump")
    };
    this.transformers["bigint"] = {
      encode: /* @__PURE__ */ __name((value) => `cast(${value} as char)`, "encode"),
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as signed)`, "decode"),
      load: /* @__PURE__ */ __name((value) => (0, import_cosmokit.isNullable)(value) ? value : BigInt(value), "load"),
      dump: /* @__PURE__ */ __name((value) => (0, import_cosmokit.isNullable)(value) ? value : `${value}`, "dump")
    };
    this.transformers["binary"] = {
      encode: /* @__PURE__ */ __name((value) => `to_base64(${value})`, "encode"),
      decode: /* @__PURE__ */ __name((value) => `from_base64(${value})`, "decode"),
      load: /* @__PURE__ */ __name((value) => (0, import_cosmokit.isNullable)(value) || typeof value === "object" ? value : import_cosmokit.Binary.fromBase64(value), "load"),
      dump: /* @__PURE__ */ __name((value) => (0, import_cosmokit.isNullable)(value) || typeof value === "string" ? value : import_cosmokit.Binary.toBase64(value), "dump")
    };
    this.transformers["date"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as date)`, "decode"),
      load: /* @__PURE__ */ __name((value) => {
        if ((0, import_cosmokit.isNullable)(value) || typeof value === "object") return value;
        const parsed = new Date(value), date = /* @__PURE__ */ new Date();
        date.setFullYear(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        date.setHours(0, 0, 0, 0);
        return date;
      }, "load"),
      dump: /* @__PURE__ */ __name((value) => {
        if ((0, import_cosmokit.isNullable)(value)) return value;
        const date = /* @__PURE__ */ new Date(0);
        date.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
        date.setHours(0, 0, 0, 0);
        return import_cosmokit.Time.template("yyyy-MM-dd hh:mm:ss.SSS", date);
      }, "dump")
    };
    this.transformers["time"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as time)`, "decode"),
      load: /* @__PURE__ */ __name((value) => this.driver.types["time"].load(value), "load"),
      dump: /* @__PURE__ */ __name((value) => (0, import_cosmokit.isNullable)(value) ? value : import_cosmokit.Time.template("yyyy-MM-dd hh:mm:ss.SSS", value), "dump")
    };
    this.transformers["timestamp"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as datetime)`, "decode"),
      load: /* @__PURE__ */ __name((value) => {
        if ((0, import_cosmokit.isNullable)(value) || typeof value === "object") return value;
        return new Date(value);
      }, "load"),
      dump: /* @__PURE__ */ __name((value) => (0, import_cosmokit.isNullable)(value) ? value : import_cosmokit.Time.template("yyyy-MM-dd hh:mm:ss.SSS", value), "dump")
    };
  }
  static {
    __name(this, "MySQLBuilder");
  }
  // eslint-disable-next-line no-control-regex
  escapeRegExp = /[\0\b\t\n\r\x1a'"\\]/g;
  escapeMap = {
    "\0": "\\0",
    "\b": "\\b",
    "	": "\\t",
    "\n": "\\n",
    "\r": "\\r",
    "": "\\Z",
    '"': '\\"',
    "'": "\\'",
    "\\": "\\\\"
  };
  _localTimezone = `+${(/* @__PURE__ */ new Date()).getTimezoneOffset() / -60}:00`.replace("+-", "-");
  _dbTimezone;
  prequeries = [];
  createMemberQuery(key, value, notStr = "") {
    if (Array.isArray(value) && Array.isArray(value[0]) && (this.compat.maria || this.compat.mysql57)) {
      const vals = `json_array(${value.map((val) => `(${this.evalOperators.$select(val)})`).join(", ")})`;
      return this.jsonContains(vals, key);
    }
    if (value.$exec && (this.compat.maria || this.compat.mysql57)) {
      const res = this.jsonContains(this.parseEval(value, false), this.encode(key, true, true));
      return notStr ? this.logicalNot(res) : res;
    }
    return super.createMemberQuery(key, value, notStr);
  }
  escapePrimitive(value, type) {
    if (value instanceof Date) {
      value = import_cosmokit.Time.template("yyyy-MM-dd hh:mm:ss.SSS", value);
    } else if (value instanceof RegExp) {
      value = value.source;
    } else if (import_cosmokit.Binary.is(value)) {
      return `X'${import_cosmokit.Binary.toHex(value)}'`;
    } else if (import_cosmokit.Binary.isSource(value)) {
      return `X'${import_cosmokit.Binary.toHex(import_cosmokit.Binary.fromSource(value))}'`;
    } else if (!!value && typeof value === "object") {
      return `json_extract(${this.quote(JSON.stringify(value))}, '$')`;
    }
    return super.escapePrimitive(value, type);
  }
  encode(value, encoded, pure = false, type) {
    return this.asEncoded(encoded === this.isEncoded() && !pure ? value : encoded ? `json_extract(json_object('v', ${this.transform(value, type, "encode")}), '$.v')` : this.transform(`json_unquote(${value})`, type, "decode"), pure ? void 0 : encoded);
  }
  createAggr(expr, aggr, nonaggr, compat) {
    if (!this.state.group && compat && (this.compat.mysql57 || this.compat.maria)) {
      return compat(this.parseEval(expr, false));
    } else {
      return super.createAggr(expr, aggr, nonaggr);
    }
  }
  groupArray(value) {
    if (!this.compat.maria) return super.groupArray(value);
    const res = this.isEncoded() ? `concat('[', group_concat(${value}), ']')` : `concat('[', group_concat(json_extract(json_object('v', ${value}), '$.v')), ']')`;
    return this.asEncoded(`ifnull(${res}, json_array())`, true);
  }
  parseSelection(sel, inline = false) {
    if (!this.compat.maria && !this.compat.mysql57) return super.parseSelection(sel, inline);
    const { args: [expr], ref, table, tables } = sel;
    const restore = this.saveState({ wrappedSubquery: true, tables });
    const inner = this.get(table, true, true);
    const output = this.parseEval(expr, false);
    const fields = expr["$select"]?.map((x) => this.getRecursive(x["$"]));
    const where = fields && this.logicalAnd(fields.map((x) => `(${x} is not null)`));
    const refFields = this.state.refFields;
    restore();
    let query;
    if (inline || !(0, import_minato.isAggrExpr)(expr)) {
      query = `(SELECT ${output} FROM ${inner} ${(0, import_sql_utils.isBracketed)(inner) ? ref : ""}${where ? ` WHERE ${where}` : ""})`;
    } else {
      query = [
        `(ifnull((SELECT ${this.groupArray(this.transform(output, import_minato.Type.getInner(import_minato.Type.fromTerm(expr)), "encode"))}`,
        `FROM ${inner} ${(0, import_sql_utils.isBracketed)(inner) ? ref : ""}), json_array()))`
      ].join(" ");
    }
    if (Object.keys(refFields ?? {}).length) {
      const funcname = `minato_tfunc_${(0, import_minato.randomId)()}`;
      const decls = Object.values(refFields ?? {}).map((x) => `${x} JSON`).join(",");
      const args = Object.keys(refFields ?? {}).map((x) => this.state.refFields?.[x] ?? x).map((x) => this.encode(x, true, true)).join(",");
      query = this.isEncoded() ? `ifnull(${query}, json_array())` : this.encode(query, true);
      this.prequeries.push(`DROP FUNCTION IF EXISTS ${funcname}`);
      this.prequeries.push(`CREATE FUNCTION ${funcname} (${decls}) RETURNS JSON DETERMINISTIC RETURN ${query}`);
      return this.asEncoded(`${funcname}(${args})`, true);
    } else return query;
  }
  toUpdateExpr(item, key, field, upsert) {
    const escaped = (0, import_sql_utils.escapeId)(key);
    if (key in item) {
      if (!(0, import_minato.isEvalExpr)(item[key]) && upsert) {
        return `VALUES(${escaped})`;
      } else if ((0, import_minato.isEvalExpr)(item[key])) {
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
      rest.slice(0, -1).reduce((obj, k) => obj[k] ??= {}, jsonInit);
    }
    const valueInit = `ifnull(${escaped}, '{}')`;
    let value = valueInit;
    if (Object.keys(jsonInit).length !== 0) {
      value = `json_merge_patch(${this.escape(jsonInit, "json")}, ${value})`;
    }
    for (const prop in item) {
      if (!prop.startsWith(key + ".")) continue;
      const rest = prop.slice(key.length + 1).split(".");
      const type = import_minato.Type.getInner(field?.type, prop.slice(key.length + 1));
      const v = (0, import_minato.isEvalExpr)(item[prop]) ? this.transform(this.parseEval(item[prop]), item[prop], "encode") : this.transform(this.escape(item[prop], type), type, "encode");
      value = `json_set(${value}, '$${rest.map((key2) => `."${key2}"`).join("")}', ${v})`;
    }
    if (value === valueInit) {
      return escaped;
    } else {
      return value;
    }
  }
};

// src/locales/zh-CN.yml
var zh_CN_default = { host: "要连接到的主机名。", port: "要连接到的端口号。", user: "要使用的用户名。", password: "要使用的密码。", database: "要访问的数据库名。", ssl: { $description: "SSL 高级选项。", $value: ["默认值", { $description: "自定义", rejectUnauthorized: "拒绝使用无效证书的客户端。" }] } };

// src/locales/en-US.yml
var en_US_default = { host: "The hostname of the database you are connecting to.", port: "The port number to connect to.", user: "The MySQL user to authenticate as.", password: "The password of that MySQL user.", database: "Name of the database to use for this connection.", ssl: { $description: "SSL options.", $value: ["Default", { $description: "Custom", rejectUnauthorized: "Reject clients with invalid certificates." }] } };

// src/index.ts
var timeRegex = /(\d+):(\d+):(\d+)(\.(\d+))?/;
function createIndex(keys) {
  return (0, import_cosmokit2.makeArray)(keys).map(import_sql_utils2.escapeId).join(", ");
}
__name(createIndex, "createIndex");
var MySQLDriver = class extends import_minato2.Driver {
  static name = "mysql";
  pool;
  sql = new MySQLBuilder(this);
  session;
  _compat = {};
  _queryTasks = [];
  async start() {
    this.pool = (0, import_mysql.createPool)({
      host: "localhost",
      port: 3306,
      charset: "utf8mb4_general_ci",
      multipleStatements: true,
      typeCast: /* @__PURE__ */ __name((field, next) => {
        if (field.type === "BIT") {
          return Boolean(field.buffer()?.readUint8(0));
        } else if (field.type === "LONGLONG") {
          return field.string();
        } else {
          return next();
        }
      }, "typeCast"),
      ...this.config
    });
    const [version, timezone] = Object.values((await this.query(`SELECT version(), @@GLOBAL.time_zone`))[0]);
    this._compat.maria = version.includes("MariaDB");
    this._compat.maria105 = !!version.match(/10.5.\d+-MariaDB/);
    this._compat.mysql57 = !!version.match(/5.7.\d+/);
    this._compat.timezone = timezone;
    if (this._compat.mysql57 || this._compat.maria) {
      await this._setupCompatFunctions();
    }
    this.define({
      types: ["json"],
      dump: /* @__PURE__ */ __name((value) => value, "dump"),
      load: /* @__PURE__ */ __name((value) => typeof value === "string" ? JSON.parse(value) : value, "load")
    });
    this.define({
      types: ["list"],
      dump: /* @__PURE__ */ __name((value) => Array.isArray(value) ? value.join(",") : value, "dump"),
      load: /* @__PURE__ */ __name((value) => value ? value.split(",") : [], "load")
    });
    this.define({
      types: ["time"],
      dump: /* @__PURE__ */ __name((value) => value, "dump"),
      load: /* @__PURE__ */ __name((value) => {
        if (!value || typeof value === "object") return value;
        const date = /* @__PURE__ */ new Date(0);
        const parsed = timeRegex.exec(value);
        if (!parsed) throw Error(`unexpected time value: ${value}`);
        date.setHours(+parsed[1], +parsed[2], +parsed[3], +(parsed[5] ?? 0));
        return date;
      }, "load")
    });
    this.define({
      types: ["binary"],
      dump: /* @__PURE__ */ __name((value) => value, "dump"),
      load: /* @__PURE__ */ __name((value) => (0, import_cosmokit2.isNullable)(value) ? value : import_cosmokit2.Binary.fromSource(value), "load")
    });
    this.define({
      types: import_minato2.Field.number,
      dump: /* @__PURE__ */ __name((value) => value, "dump"),
      load: /* @__PURE__ */ __name((value) => (0, import_cosmokit2.isNullable)(value) ? value : +value, "load")
    });
    this.define({
      types: ["bigint"],
      dump: /* @__PURE__ */ __name((value) => (0, import_cosmokit2.isNullable)(value) ? value : value.toString(), "dump"),
      load: /* @__PURE__ */ __name((value) => (0, import_cosmokit2.isNullable)(value) ? value : BigInt(value), "load")
    });
  }
  async stop() {
    this.pool.end();
  }
  /** synchronize table schema */
  async prepare(name) {
    const [columns, indexes] = await Promise.all([
      this.queue([
        `SELECT *`,
        `FROM information_schema.columns`,
        `WHERE TABLE_SCHEMA = ? && TABLE_NAME = ?`
      ].join(" "), [this.config.database, name]),
      this.queue([
        `SELECT *`,
        `FROM information_schema.statistics`,
        `WHERE TABLE_SCHEMA = ? && TABLE_NAME = ?`
      ].join(" "), [this.config.database, name])
    ]);
    const table = this.model(name);
    const { primary, foreign, autoInc } = table;
    const fields = table.avaiableFields();
    const unique = [...table.unique];
    const create = [];
    const update = [];
    const alterInit = /* @__PURE__ */ Object.create(null);
    for (const key in fields) {
      const { initial, nullable = true } = fields[key];
      const legacy = [key, ...fields[key].legacy || []];
      const column = columns.find((info) => legacy.includes(info.COLUMN_NAME));
      let shouldUpdate = column?.COLUMN_NAME !== key;
      let def = (0, import_sql_utils2.escapeId)(key);
      if (key === primary && autoInc) {
        def += " int unsigned not null auto_increment";
      } else {
        const typedef = this.getTypeDef(fields[key]);
        if (column && !shouldUpdate) {
          shouldUpdate = this.isDefUpdated(fields[key], column, typedef);
        }
        def += " " + typedef;
        if ((0, import_cosmokit2.makeArray)(primary).includes(key)) {
          def += " not null";
        } else {
          def += (nullable ? " " : " not ") + "null";
        }
        if (!(0, import_cosmokit2.isNullable)(initial) && !typedef.startsWith("text") && !typedef.endsWith("blob")) {
          def += " default " + this.sql.escape(initial, fields[key]);
        }
        if (!column && !(0, import_cosmokit2.isNullable)(initial) && (typedef.startsWith("text") || typedef.endsWith("blob"))) {
          alterInit[key] = this.sql.escape(initial, fields[key]);
        }
      }
      if (!column) {
        create.push(def);
      } else if (shouldUpdate) {
        update.push(`CHANGE ${(0, import_sql_utils2.escapeId)(column.COLUMN_NAME)} ${def}`);
      }
    }
    if (!columns.length) {
      create.push(`PRIMARY KEY (${createIndex(primary)})`);
      for (const key in foreign) {
        const [table2, key2] = foreign[key];
        create.push(`FOREIGN KEY (${(0, import_sql_utils2.escapeId)(key)}) REFERENCES ${(0, import_sql_utils2.escapeId)(table2)} (${(0, import_sql_utils2.escapeId)(key2)})`);
      }
    }
    for (const key of unique) {
      let oldIndex;
      let shouldUpdate = false;
      const oldKeys = (0, import_cosmokit2.makeArray)(key).map((key2) => {
        const legacy = [key2, ...fields[key2].legacy || []];
        const column = columns.find((info) => legacy.includes(info.COLUMN_NAME));
        if (column?.COLUMN_NAME !== key2) shouldUpdate = true;
        return column?.COLUMN_NAME;
      });
      if (oldKeys.every(Boolean)) {
        const name3 = "unique:" + oldKeys.join("+");
        oldIndex = indexes.find((info) => info.INDEX_NAME === name3);
      }
      const name2 = "unique:" + (0, import_cosmokit2.makeArray)(key).join("+");
      if (!oldIndex) {
        create.push(`UNIQUE INDEX ${(0, import_sql_utils2.escapeId)(name2)} (${createIndex(key)})`);
      } else if (shouldUpdate) {
        create.push(`UNIQUE INDEX ${(0, import_sql_utils2.escapeId)(name2)} (${createIndex(key)})`);
        update.push(`DROP INDEX ${(0, import_sql_utils2.escapeId)(oldIndex.INDEX_NAME)}`);
      }
    }
    if (!columns.length) {
      this.logger.info("auto creating table %c", name);
      return this.query(`CREATE TABLE ${(0, import_sql_utils2.escapeId)(name)} (${create.join(", ")}) COLLATE = ${this.sql.escape(this.config.charset ?? "utf8mb4_general_ci")}`);
    }
    const operations = [
      ...create.map((def) => "ADD " + def),
      ...update
    ];
    if (operations.length) {
      this.logger.info("auto updating table %c", name);
      await this.query(`ALTER TABLE ${(0, import_sql_utils2.escapeId)(name)} ${operations.join(", ")}`);
    }
    if (Object.keys(alterInit).length) {
      await this.query(`UPDATE ${(0, import_sql_utils2.escapeId)(name)} SET ${Object.entries(alterInit).map(([key, val]) => `${(0, import_sql_utils2.escapeId)(key)} = ${val}`).join(", ")}`);
    }
    const dropKeys = [];
    await this.migrate(name, {
      error: this.logger.warn,
      before: /* @__PURE__ */ __name((keys) => keys.every((key) => columns.some((info) => info.COLUMN_NAME === key)), "before"),
      after: /* @__PURE__ */ __name((keys) => dropKeys.push(...keys), "after"),
      finalize: /* @__PURE__ */ __name(async () => {
        if (!dropKeys.length) return;
        this.logger.info("auto migrating table %c", name);
        await this.query(`ALTER TABLE ${(0, import_sql_utils2.escapeId)(name)} ${dropKeys.map((key) => `DROP ${(0, import_sql_utils2.escapeId)(key)}`).join(", ")}`);
      }, "finalize")
    });
  }
  _joinKeys = /* @__PURE__ */ __name((keys) => {
    return keys ? keys.map((key) => key.includes("`") ? key : `\`${key}\``).join(",") : "*";
  }, "_joinKeys");
  _formatValues = /* @__PURE__ */ __name((table, data, keys) => {
    return keys.map((key) => {
      const field = this.database.tables[table]?.fields[key];
      return this.sql.escape(data[key], field);
    }).join(", ");
  }, "_formatValues");
  async _setupCompatFunctions() {
    try {
      await this.query(`DROP FUNCTION IF EXISTS minato_cfunc_sum`);
      await this.query(`CREATE FUNCTION minato_cfunc_sum (j JSON) RETURNS DOUBLE DETERMINISTIC BEGIN DECLARE n int; DECLARE i int; DECLARE r DOUBLE;
DROP TEMPORARY TABLE IF EXISTS mtt; CREATE TEMPORARY TABLE mtt (value JSON); SELECT json_length(j) into n; set i = 0; WHILE i<n DO
INSERT INTO mtt VALUES(json_extract(j, concat('$[', i, ']'))); SET i=i+1; END WHILE; SELECT sum(value) INTO r FROM mtt; RETURN r; END`);
      await this.query(`DROP FUNCTION IF EXISTS minato_cfunc_avg`);
      await this.query(`CREATE FUNCTION minato_cfunc_avg (j JSON) RETURNS DOUBLE DETERMINISTIC BEGIN DECLARE n int; DECLARE i int; DECLARE r DOUBLE;
DROP TEMPORARY TABLE IF EXISTS mtt; CREATE TEMPORARY TABLE mtt (value JSON); SELECT json_length(j) into n; set i = 0; WHILE i<n DO
INSERT INTO mtt VALUES(json_extract(j, concat('$[', i, ']'))); SET i=i+1; END WHILE; SELECT avg(value) INTO r FROM mtt; RETURN r; END`);
      await this.query(`DROP FUNCTION IF EXISTS minato_cfunc_min`);
      await this.query(`CREATE FUNCTION minato_cfunc_min (j JSON) RETURNS DOUBLE DETERMINISTIC BEGIN DECLARE n int; DECLARE i int; DECLARE r DOUBLE;
DROP TEMPORARY TABLE IF EXISTS mtt; CREATE TEMPORARY TABLE mtt (value JSON); SELECT json_length(j) into n; set i = 0; WHILE i<n DO
INSERT INTO mtt VALUES(json_extract(j, concat('$[', i, ']'))); SET i=i+1; END WHILE; SELECT min(value) INTO r FROM mtt; RETURN r; END`);
      await this.query(`DROP FUNCTION IF EXISTS minato_cfunc_max`);
      await this.query(`CREATE FUNCTION minato_cfunc_max (j JSON) RETURNS DOUBLE DETERMINISTIC BEGIN DECLARE n int; DECLARE i int; DECLARE r DOUBLE;
DROP TEMPORARY TABLE IF EXISTS mtt; CREATE TEMPORARY TABLE mtt (value JSON); SELECT json_length(j) into n; set i = 0; WHILE i<n DO
INSERT INTO mtt VALUES(json_extract(j, concat('$[', i, ']'))); SET i=i+1; END WHILE; SELECT max(value) INTO r FROM mtt; RETURN r; END`);
    } catch (e) {
      this.logger.warn(`Failed to setup compact functions: ${e}`);
    }
  }
  query(sql, debug = true) {
    const error = new Error();
    return new Promise((resolve, reject) => {
      if (debug) this.logger.debug("> %s", sql);
      (this.session ?? this.pool).query(sql, (err, results) => {
        if (!err) return resolve(results);
        this.logger.warn("> %s", sql);
        if (err["code"] === "ER_DUP_ENTRY") {
          err = new import_minato2.RuntimeError("duplicate-entry", err.message);
        }
        err.stack = err.message + error.stack.slice(5);
        reject(err);
      });
    });
  }
  queue(sql, values) {
    sql = (0, import_mysql.format)(sql, values);
    if (this.session || !(this.config.multipleStatements ?? true)) {
      return this.query(sql);
    }
    this.logger.debug("> %s", sql);
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
      let results = await this.query(tasks.map((task) => task.sql).join("; "), false);
      if (tasks.length === 1) results = [results];
      tasks.forEach((task, index) => {
        task.resolve(results[index]);
      });
    } catch (error) {
      tasks.forEach((task) => task.reject(error));
    }
  }
  _select(table, fields, conditional, values = []) {
    let sql = `SELECT ${this._joinKeys(fields)} FROM ${table}`;
    if (conditional) sql += ` WHERE ${conditional}`;
    return this.queue(sql, values);
  }
  async drop(table) {
    await this.query(`DROP TABLE ${(0, import_sql_utils2.escapeId)(table)}`);
  }
  async dropAll() {
    const data = await this._select("information_schema.tables", ["TABLE_NAME"], "TABLE_SCHEMA = ? AND TABLE_TYPE = ?", [this.config.database, "BASE TABLE"]);
    if (!data.length) return;
    await this.query([
      "SET foreign_key_checks = 0",
      ...data.map(({ TABLE_NAME }) => `DROP TABLE ${(0, import_sql_utils2.escapeId)(TABLE_NAME)}`),
      "SET foreign_key_checks = 1"
    ].join("; "));
  }
  async stats() {
    const data = await this._select(
      "information_schema.tables",
      ["TABLE_NAME", "TABLE_ROWS", "DATA_LENGTH"],
      "TABLE_SCHEMA = ? AND TABLE_TYPE = ?",
      [this.config.database, "BASE TABLE"]
    );
    const stats = { size: 0 };
    stats.tables = Object.fromEntries(data.map(({ TABLE_NAME: name, TABLE_ROWS: count, DATA_LENGTH: size }) => {
      stats.size += +size;
      return [name, { count: +count, size: +size }];
    }));
    return stats;
  }
  async get(sel) {
    const { model, tables } = sel;
    const builder = new MySQLBuilder(this, tables, this._compat);
    const sql = builder.get(sel);
    if (!sql) return [];
    return Promise.all([...builder.prequeries, sql].map((x) => this.queue(x))).then((data) => {
      return data.at(-1).map((row) => builder.load(row, model));
    });
  }
  async eval(sel, expr) {
    const builder = new MySQLBuilder(this, sel.tables, this._compat);
    const inner = builder.get(sel.table, true, true);
    const output = builder.parseEval(expr, false);
    const ref = (0, import_sql_utils2.isBracketed)(inner) ? sel.ref : "";
    const sql = `SELECT ${output} AS value FROM ${inner} ${ref}`;
    return Promise.all([...builder.prequeries, sql].map((x) => this.queue(x))).then((data) => {
      return builder.load(data.at(-1)[0].value, expr);
    });
  }
  async set(sel, data) {
    const { model, query, table, tables, ref } = sel;
    const builder = new MySQLBuilder(this, tables, this._compat);
    const filter = builder.parseQuery(query);
    const fields = model.avaiableFields();
    if (filter === "0") return {};
    const updateFields = [...new Set(Object.keys(data).map((key) => {
      return Object.keys(fields).find((field) => field === key || key.startsWith(field + "."));
    }))];
    const update = updateFields.map((field) => {
      const escaped = (0, import_sql_utils2.escapeId)(field);
      return `${escaped} = ${builder.toUpdateExpr(data, field, fields[field], false)}`;
    }).join(", ");
    const sql = [...builder.prequeries, `UPDATE ${(0, import_sql_utils2.escapeId)(table)} ${ref} SET ${update} WHERE ${filter}`].join("; ");
    const result = await this.query(sql);
    return { matched: result.affectedRows, modified: result.changedRows };
  }
  async remove(sel) {
    const { query, table, tables } = sel;
    const builder = new MySQLBuilder(this, tables, this._compat);
    const filter = builder.parseQuery(query);
    if (filter === "0") return {};
    const result = await this.query(`DELETE FROM ${(0, import_sql_utils2.escapeId)(table)} WHERE ` + filter);
    return { matched: result.affectedRows, removed: result.affectedRows };
  }
  async create(sel, data) {
    const { table, model } = sel;
    const { autoInc, primary } = model;
    const formatted = this.sql.dump(data, model);
    const keys = Object.keys(formatted);
    const header = await this.query([
      `INSERT INTO ${(0, import_sql_utils2.escapeId)(table)} (${keys.map(import_sql_utils2.escapeId).join(", ")})`,
      `VALUES (${keys.map((key) => this.sql.escape(formatted[key])).join(", ")})`
    ].join(" "));
    if (!autoInc) return data;
    return { ...data, [primary]: header.insertId };
  }
  async upsert(sel, data, keys) {
    if (!data.length) return {};
    const { model, table, tables, ref } = sel;
    const builder = new MySQLBuilder(this, tables, this._compat);
    const merged = {};
    const insertion = data.map((item) => {
      Object.assign(merged, item);
      return model.format((0, import_minato2.executeUpdate)(model.create(), item, ref));
    });
    const initFields = Object.keys(model.avaiableFields());
    const dataFields = [...new Set(Object.keys(merged).map((key) => {
      return initFields.find((field) => field === key || key.startsWith(field + "."));
    }))];
    let updateFields = (0, import_cosmokit2.difference)(dataFields, keys);
    if (!updateFields.length) updateFields = dataFields.length ? [dataFields[0]] : [];
    const createFilter = /* @__PURE__ */ __name((item) => builder.parseQuery((0, import_cosmokit2.pick)(item, keys)), "createFilter");
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
    const update = updateFields.map((field) => {
      const escaped = (0, import_sql_utils2.escapeId)(field);
      const branches = {};
      data.forEach((item) => {
        (branches[builder.toUpdateExpr(item, field, model.fields[field], true)] ??= []).push(item);
      });
      const entries = Object.entries(branches).map(([expr, items]) => [createMultiFilter(items), expr]).sort(([a], [b]) => a.length - b.length).reverse();
      let value = entries[0][1];
      for (let index = 1; index < entries.length; index++) {
        value = `if(${entries[index][0]}, ${entries[index][1]}, ${value})`;
      }
      return `${escaped} = ${value}`;
    }).join(", ");
    const result = await this.query([
      `INSERT INTO ${(0, import_sql_utils2.escapeId)(table)} (${initFields.map(import_sql_utils2.escapeId).join(", ")})`,
      `VALUES (${insertion.map((item) => this._formatValues(table, item, initFields)).join("), (")})`,
      update ? `ON DUPLICATE KEY UPDATE ${update}` : ""
    ].join(" "));
    const records = +(/^&Records:\s*(\d+)/.exec(result.message)?.[1] ?? result.affectedRows);
    if (!result.message && !result.insertId) return { inserted: 0, matched: result.affectedRows, modified: 0 };
    if (!result.message && result.affectedRows > 1) return { inserted: 0, matched: result.affectedRows / 2, modified: result.affectedRows / 2 };
    return { inserted: records - result.changedRows, matched: result.changedRows, modified: result.affectedRows - records };
  }
  async withTransaction(callback) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        if (err) {
          this.logger.warn("getConnection failed: ", err);
          return;
        }
        conn.beginTransaction(() => callback(conn).then(
          () => conn.commit(() => resolve()),
          (e) => conn.rollback(() => reject(e))
        ).finally(() => conn.release()));
      });
    });
  }
  async getIndexes(table) {
    const indexes = await this.queue([
      `SELECT *`,
      `FROM information_schema.statistics`,
      `WHERE TABLE_SCHEMA = ? && TABLE_NAME = ?`
    ].join(" "), [this.config.database, table]);
    const result = {};
    for (const { INDEX_NAME: name, COLUMN_NAME: key, COLLATION: direction, NON_UNIQUE: unique } of indexes) {
      if (!result[name]) result[name] = { name, unique: unique !== "1", keys: {} };
      result[name].keys[key] = direction === "A" ? "asc" : direction === "D" ? "desc" : direction;
    }
    return Object.values(result);
  }
  async createIndex(table, index) {
    const keyFields = Object.entries(index.keys).map(([key, direction]) => `${(0, import_sql_utils2.escapeId)(key)} ${direction ?? "asc"}`).join(", ");
    await this.query(
      `ALTER TABLE ${(0, import_sql_utils2.escapeId)(table)} ADD ${index.unique ? "UNIQUE" : ""} INDEX ${index.name ? (0, import_sql_utils2.escapeId)(index.name) : ""} (${keyFields})`
    );
  }
  async dropIndex(table, name) {
    await this.query(`DROP INDEX ${(0, import_sql_utils2.escapeId)(name)} ON ${(0, import_sql_utils2.escapeId)(table)}`);
  }
  getTypeDef({ deftype: type, length, precision, scale }) {
    const getIntegerType = /* @__PURE__ */ __name((length2 = 4) => {
      if (length2 <= 1) return "tinyint";
      if (length2 <= 2) return "smallint";
      if (length2 <= 3) return "mediumint";
      if (length2 <= 4) return "int";
      return "bigint";
    }, "getIntegerType");
    switch (type) {
      case "float":
      case "double":
      case "date":
        return type;
      case "time":
        return "time(3)";
      case "timestamp":
        return "datetime(3)";
      case "boolean":
        return "bit";
      case "integer":
        if ((length || 0) > 8) this.logger.warn(`type ${type}(${length}) exceeds the max supported length`);
        return getIntegerType(length);
      case "primary":
      case "unsigned":
        if ((length || 0) > 8) this.logger.warn(`type ${type}(${length}) exceeds the max supported length`);
        return `${getIntegerType(length)} unsigned`;
      case "bigint":
        return getIntegerType(8);
      case "decimal":
        return `decimal(${precision ?? 10}, ${scale ?? 0}) unsigned`;
      case "char":
        return `char(${length || 255})`;
      case "string":
        return (length || 255) > 65536 ? "longtext" : `varchar(${length || 255})`;
      case "text":
        return (length || 255) > 65536 ? "longtext" : `text(${length || 65535})`;
      case "binary":
        return (length || 65537) > 65536 ? "longblob" : `blob`;
      case "list":
        return `text(${length || 65535})`;
      case "json":
        return `text(${length || 65535})`;
      default:
        throw new Error(`unsupported type: ${type}`);
    }
  }
  isDefUpdated(field, column, def) {
    const typename = def.split(/[ (]/)[0];
    if (typename === "text") return !column.DATA_TYPE.endsWith("text");
    if (typename !== column.DATA_TYPE) return true;
    switch (field.deftype) {
      case "integer":
      case "unsigned":
      case "char":
      case "string":
        return !!field.length && !!column.CHARACTER_MAXIMUM_LENGTH && +column.CHARACTER_MAXIMUM_LENGTH !== field.length;
      case "decimal":
        return +column.NUMERIC_PRECISION !== field.precision || +column.NUMERIC_SCALE !== field.scale;
      case "text":
      case "list":
      case "json":
        return false;
      default:
        return false;
    }
  }
};
((MySQLDriver2) => {
  MySQLDriver2.Config = import_minato2.z.intersect([
    import_minato2.z.object({
      host: import_minato2.z.string().default("localhost"),
      port: import_minato2.z.natural().max(65535).default(3306),
      user: import_minato2.z.string().default("root"),
      password: import_minato2.z.string().role("secret"),
      database: import_minato2.z.string().required()
    }),
    import_minato2.z.object({
      ssl: import_minato2.z.union([
        import_minato2.z.const(void 0),
        import_minato2.z.object({
          ca: import_minato2.z.string(),
          cert: import_minato2.z.string(),
          sigalgs: import_minato2.z.string(),
          ciphers: import_minato2.z.string(),
          clientCertEngine: import_minato2.z.string(),
          crl: import_minato2.z.string(),
          dhparam: import_minato2.z.string(),
          ecdhCurve: import_minato2.z.string(),
          honorCipherOrder: import_minato2.z.boolean(),
          key: import_minato2.z.string(),
          privateKeyEngine: import_minato2.z.string(),
          privateKeyIdentifier: import_minato2.z.string(),
          maxVersion: import_minato2.z.string(),
          minVersion: import_minato2.z.string(),
          passphrase: import_minato2.z.string(),
          pfx: import_minato2.z.string(),
          rejectUnauthorized: import_minato2.z.boolean(),
          secureOptions: import_minato2.z.natural(),
          secureProtocol: import_minato2.z.string(),
          sessionIdContext: import_minato2.z.string(),
          sessionTimeout: import_minato2.z.number()
        })
      ])
    })
  ]).i18n({
    "en-US": en_US_default,
    "zh-CN": zh_CN_default
  });
})(MySQLDriver || (MySQLDriver = {}));
var src_default = MySQLDriver;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MySQLDriver
});
//# sourceMappingURL=index.cjs.map
