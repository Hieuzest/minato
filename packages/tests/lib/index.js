var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/model.ts
import { mapValues, isNullable, deduplicate, omit } from "cosmokit";
import { $, getCell, Type, unravel } from "minato";
import { expect } from "chai";
function toBinary(source) {
  return new TextEncoder().encode(source).buffer;
}
__name(toBinary, "toBinary");
function flatten(type2, prefix) {
  if (typeof type2 === "object" && type2?.type === "object") {
    const result = {};
    for (const key in type2.inner) {
      Object.assign(result, flatten(type2.inner[key], `${prefix}.${key}`));
    }
    return result;
  } else {
    return { [prefix]: type2 };
  }
}
__name(flatten, "flatten");
function ModelOperations(database) {
  database.define("bigint2", {
    type: "string",
    dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : value.toString(), "dump"),
    load: /* @__PURE__ */ __name((value) => isNullable(value) ? value : BigInt(value), "load"),
    initial: 123n
  });
  database.define("custom", {
    type: "string",
    dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : `${value.a}|${value.b}`, "dump"),
    load: /* @__PURE__ */ __name((value) => isNullable(value) ? value : { a: value.split("|")[0], b: +value.split("|")[1] }, "load")
  });
  const bnum = database.define({
    type: "binary",
    dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : toBinary(String(value)), "dump"),
    load: /* @__PURE__ */ __name((value) => isNullable(value) ? value : +Buffer.from(value), "load"),
    initial: 0
  });
  const bstr = database.define({
    type: "custom",
    dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : { a: value, b: 1 }, "dump"),
    load: /* @__PURE__ */ __name((value) => isNullable(value) ? value : value.a, "load"),
    initial: "pooo"
  });
  database.define("string2", {
    type: "string",
    dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : `AAA${value}`, "dump"),
    load: /* @__PURE__ */ __name((value) => isNullable(value) ? value : value.slice(3), "load"),
    initial: ""
  });
  database.define("recurx", {
    type: "object",
    inner: {
      id: "unsigned",
      y: "recury"
    }
  });
  database.define("recury", {
    type: "object",
    inner: {
      id: "unsigned",
      x: "recurx"
    }
  });
  const baseFields = {
    id: "unsigned",
    text: {
      type: "string",
      initial: "he`l\"'\\lo"
    },
    num: {
      type: "integer",
      initial: 233
    },
    double: {
      type: "double",
      initial: 3.14
    },
    decimal: {
      type: "decimal",
      scale: 3,
      initial: 12413
    },
    int64: {
      type: "bigint",
      initial: 1n
    },
    bool: {
      type: "boolean",
      initial: true
    },
    list: {
      type: "list",
      initial: ["a`a", 'b"b', "c'c", "d\\d"]
    },
    array: "array",
    object: {
      type: "object",
      inner: {
        num: "unsigned",
        text: "string",
        json: "object",
        embed: {
          type: "object",
          inner: {
            bool: {
              type: "boolean",
              initial: false
            },
            int64: "bigint",
            bigint: "bigint2",
            custom: { type: "custom" },
            bstr
          }
        }
      }
    },
    // dot defined object
    "object2.num": {
      type: "unsigned",
      initial: 1
    },
    "object2.text": {
      type: "string",
      initial: "2"
    },
    "object2.embed.bool": {
      type: "boolean",
      initial: true
    },
    "object2.embed.bigint": "bigint2",
    timestamp: {
      type: "timestamp",
      initial: /* @__PURE__ */ new Date("1970-01-01 00:00:00")
    },
    date: {
      type: "date",
      initial: /* @__PURE__ */ new Date("1970-01-01")
    },
    time: {
      type: "time",
      initial: /* @__PURE__ */ new Date("1970-01-01 12:00:00")
    },
    binary: {
      type: "binary",
      initial: toBinary("initial buffer")
    },
    bigint: "bigint2",
    bnum,
    bnum2: {
      type: "binary",
      dump: /* @__PURE__ */ __name((value) => isNullable(value) ? value : toBinary(String(value)), "dump"),
      load: /* @__PURE__ */ __name((value) => isNullable(value) ? value : +Buffer.from(value), "load"),
      initial: 0
    },
    text2: "string2"
  };
  const baseObject = {
    type: "object",
    inner: { nested: { type: "object", inner: baseFields } },
    initial: { nested: { id: 1 } }
  };
  database.extend("dtypes", {
    ...baseFields
  }, { autoInc: true });
  database.extend("dobjects", {
    id: "unsigned",
    foo: baseObject,
    ...flatten(baseObject, "bar"),
    baz: {
      type: "array",
      inner: baseObject,
      initial: []
    }
  }, { autoInc: true });
  database.extend("recurxs", {
    id: "unsigned",
    y: "recury"
  }, { autoInc: true });
}
__name(ModelOperations, "ModelOperations");
((ModelOperations2) => {
  const magicBorn = /* @__PURE__ */ new Date("1970/08/17");
  const dtypeTable = [
    { id: 1, bool: false },
    { id: 2, text: "pku" },
    { id: 3, num: 1989 },
    { id: 4, list: ["1", "1", "4"], array: [1, 1, 4] },
    { id: 5, object: { num: 10, text: "ab", embed: { bool: true, bigint: 90n, int64: 100n, bstr: "world" } } },
    { id: 6, object2: { num: 10, text: "ab", embed: { bool: false, bigint: 90n } } },
    { id: 7, timestamp: magicBorn },
    { id: 8, date: magicBorn },
    { id: 9, time: /* @__PURE__ */ new Date("1999-10-01 15:40:00") },
    { id: 10, binary: toBinary("hello") },
    { id: 11, bigint: BigInt(1e63) },
    { id: 12, decimal: 2.432, int64: 9223372036854775806n },
    { id: 13, bnum: 114514, bnum2: 12345 },
    { id: 14, object: { embed: { custom: { a: "abc", b: 123 } } } }
  ];
  const dobjectTable = [
    { id: 1 },
    { id: 2, foo: { nested: { id: 1, int64: 123n, list: ["1", "1", "4"], array: [1, 1, 4], object: { num: 10, text: "ab", embed: { bool: false, bigint: BigInt(1e163), custom: { a: "?", b: 8 }, bstr: "wo" } }, bigint: BigInt(1e63), bnum: 114514, bnum2: 12345 } } },
    { id: 3, bar: { nested: { id: 1, list: ["1", "1", "4"], array: [1, 1, 4], object: { num: 10, text: "ab", embed: { bool: false, bigint: BigInt(1e163), custom: { a: "?", b: 8 }, bstr: "wo" } }, bigint: BigInt(1e63), bnum: 114514, bnum2: 12345 } } },
    { id: 4, baz: [{ nested: { id: 1, list: ["1", "1", "4"], array: [1, 1, 4], object: { num: 10, text: "ab", embed: { bool: false, bigint: BigInt(1e163), custom: { a: "?", b: 8 }, bstr: "wo" } }, bigint: BigInt(1e63), bnum: 114514, bnum2: 12345 } }, { nested: { id: 2 } }] },
    { id: 5, foo: { nested: { id: 1, list: ["1", "1", "4"], array: [1, 1, 4], object2: { num: 10, text: "ab", embed: { bool: false, bigint: BigInt(1e163) } }, bigint: BigInt(1e63), bnum: 114514, bnum2: 12345 } } },
    { id: 6, bar: { nested: { id: 1, list: ["1", "1", "4"], array: [1, 1, 4], object2: { num: 10, text: "ab", embed: { bool: false, bigint: BigInt(1e163) } }, bigint: BigInt(1e63), bnum: 114514, bnum2: 12345 } } },
    { id: 7, baz: [{ nested: { id: 1, list: ["1", "1", "4"], array: [1, 1, 4], object2: { num: 10, text: "ab", embed: { bool: false, bigint: BigInt(1e163) } }, bigint: BigInt(1e63), bnum: 114514, bnum2: 12345 } }, { nested: { id: 2 } }] }
  ];
  async function setup2(database, name, table) {
    await database.remove(name, {});
    const result = [];
    for (const item of table) {
      result.push(await database.create(name, item));
    }
    return result;
  }
  __name(setup2, "setup");
  ModelOperations2.fields = /* @__PURE__ */ __name(function Fields(database, options = {}) {
    const { cast = true, typeModel = true } = options;
    it("basic", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      table.forEach((row, i) => expect(row).to.have.shape(omit(dtypeTable[i], ["date", "time"])));
      await expect(database.get("dtypes", {})).to.eventually.have.deep.members(table);
      await database.remove("dtypes", {});
      await database.upsert("dtypes", dtypeTable);
      await expect(database.get("dtypes", {})).to.eventually.have.deep.members(table);
    });
    typeModel && it("pass view to binary", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      table[0].binary = toBinary("this is Buffer");
      await database.set("dtypes", table[0].id, { binary: Buffer.from("this is Buffer") });
      await expect(database.get("dtypes", {})).to.eventually.have.deep.members(table);
    });
    it("modifier", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      await database.remove("dtypes", {});
      await database.upsert("dtypes", dtypeTable.map(({ id }) => ({ id })));
      await Promise.all(table.map(({ id, ...x }) => database.set("dtypes", id, x)));
      await expect(database.get("dtypes", {})).to.eventually.have.deep.members(table);
    });
    it("dot notation in modifier", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      table[0].object = {};
      await database.set("dtypes", table[0].id, (row) => ({
        object: {}
      }));
      await expect(database.get("dtypes", table[0].id)).to.eventually.deep.eq([table[0]]);
      table[0].object = {
        num: 123,
        json: {
          num: 456
        },
        embed: {
          bool: true,
          bigint: 123n,
          custom: {
            a: "a",
            b: 1
          }
        }
      };
      await database.set("dtypes", table[0].id, (row) => ({
        "object.num": 123,
        "object.json.num": 456,
        "object.embed.bool": true,
        "object.embed.bigint": 123n,
        "object.embed.custom": { a: "a", b: 1 }
      }));
      await expect(database.get("dtypes", table[0].id)).to.eventually.deep.eq([table[0]]);
    });
    it("using expressions in modifier", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      table[0].object.json.num = 543 + (table[0].object.json.num ?? 0);
      table[0].object.embed.bool = !table[0].object.embed.bool;
      table[0].object.embed.bigint = 999n;
      await database.set("dtypes", table[0].id, (row) => ({
        "object.json.num": $.add($.ifNull(row.object.json.num, 0), 543),
        "object.embed.bool": $.not(row.object.embed.bool),
        "object.embed.bigint": 999n
      }));
      await expect(database.get("dtypes", {})).to.eventually.have.deep.members(table);
      table[0].object.embed.bool = false;
      await database.set("dtypes", table[0].id, {
        "object.embed.bool": false
      });
      await expect(database.get("dtypes", {})).to.eventually.have.deep.members(table);
      table[0].object.embed.bool = true;
      await database.set("dtypes", table[0].id, {
        "object.embed.bool": true
      });
      await expect(database.get("dtypes", {})).to.eventually.have.deep.members(table);
    });
    it("primitive", async () => {
      expect(Type.fromTerm($.literal(123)).type).to.equal(Type.Number.type);
      expect(Type.fromTerm($.literal("abc")).type).to.equal(Type.String.type);
      expect(Type.fromTerm($.literal(true)).type).to.equal(Type.Boolean.type);
      expect(Type.fromTerm($.literal(/* @__PURE__ */ new Date("1970-01-01"))).type).to.equal("timestamp");
      expect(Type.fromTerm($.literal(toBinary("hello"))).type).to.equal("binary");
      expect(Type.fromTerm($.literal([1, 2, 3])).type).to.equal("json");
      expect(Type.fromTerm($.literal({ a: 1 })).type).to.equal("json");
    });
    cast && it("cast newtype", async () => {
      await setup2(database, "dtypes", dtypeTable);
      await expect(database.get("dtypes", (row) => $.eq(row.bigint, $.literal(234n, "bigint2")))).to.eventually.have.length(0);
      await expect(database.get("dtypes", (row) => $.eq(row.bigint, $.literal(BigInt(1e63), "bigint2")))).to.eventually.have.length(1);
    });
    typeModel && it("$.object encoding", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      await expect(database.eval("dtypes", (row) => $.array($.object(row)))).to.eventually.have.deep.members(table);
    });
    typeModel && it("$.object decoding", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      await expect(
        database.select("dtypes").project({
          obj: /* @__PURE__ */ __name((row) => $.object(row), "obj")
        }).project(mapValues(database.tables["dtypes"].fields, (field, key) => (row) => row.obj[key])).execute()
      ).to.eventually.have.deep.members(table);
    });
    typeModel && it("$.array encoding on cell", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      await expect(database.eval("dtypes", (row) => $.array(row.object))).to.eventually.have.deep.members(table.map((x) => x.object));
      await expect(database.eval("dtypes", (row) => $.array(row.object2))).to.eventually.have.deep.members(table.map((x) => x.object2));
    });
    it("$.array encoding", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      await Promise.all(Object.keys(database.tables["dtypes"].fields).map(
        (key) => expect(database.eval("dtypes", (row) => $.array(row[key]))).to.eventually.have.deep.members(table.map((x) => getCell(x, key)))
      ));
    });
    it("subquery encoding", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      await Promise.all(Object.keys(database.tables["dtypes"].fields).map(
        (key) => expect(
          database.select("dtypes", 1).project({
            x: /* @__PURE__ */ __name((row) => database.select("dtypes").evaluate(key), "x")
          }).execute()
        ).to.eventually.have.shape([{ x: table.map((x) => getCell(x, key)) }])
      ));
    });
    it("object query", async () => {
      const table = await setup2(database, "dtypes", dtypeTable);
      await expect(database.get("dtypes", {
        "object.embed.bool": true
      })).to.eventually.have.shape([table[4]]);
      await expect(database.get("dtypes", {
        "object.num": {
          $gte: 10
        }
      })).to.eventually.have.shape([table[4]]);
      table[4].object.embed.bool = false;
      await expect(database.set("dtypes", {
        object: {
          embed: {
            int64: 100n
          }
        }
      }, {
        "object.embed.bool": false
      })).to.eventually.fulfilled;
      await expect(database.get("dtypes", {
        object: {
          embed: {
            int64: 100n
          }
        }
      })).to.eventually.deep.equal([table[4]]);
      await expect(database.get("dtypes", {
        $or: [
          {
            object: {
              num: 10
            }
          },
          {
            object2: {
              num: {
                $gte: 10
              }
            }
          }
        ]
      })).to.eventually.have.deep.members([table[4], table[5]]);
    });
    it("recursive type", async () => {
      const table = await setup2(database, "recurxs", [{ id: 1, y: { id: 2, x: { id: 3, y: { id: 4, x: { id: 5 } } } } }]);
      await expect(database.get("recurxs", {})).to.eventually.have.deep.members(table);
    });
    it("customized string type", async () => {
      await setup2(database, "dtypes", dtypeTable);
      await database.set("dtypes", 1, { text2: "foo" });
      await expect(database.eval("dtypes", (row) => $.array(row.text2))).to.eventually.contain("foo");
      await expect(database.get("dtypes", (row) => $.eq(row.text2, $.literal("foo", "string2")))).to.eventually.have.length(1);
    });
  }, "Fields");
  ModelOperations2.object = /* @__PURE__ */ __name(function ObjectFields(database, options = {}) {
    const { aggregateNull = true, nullableComparator = true, typeModel = true } = options;
    it("basic", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      await expect(database.get("dobjects", {})).to.eventually.have.deep.members(table);
      await database.remove("dobjects", {});
      await database.upsert("dobjects", dobjectTable);
      await expect(database.get("dobjects", {})).to.eventually.have.deep.members(table);
    });
    it("modifier", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      await database.remove("dobjects", {});
      await database.upsert("dobjects", dobjectTable.map(({ id }) => ({ id })));
      await Promise.all(table.map(({ id, ...x }) => database.set("dobjects", id, x)));
      await expect(database.get("dobjects", {})).to.eventually.have.deep.members(table);
    });
    it("dot notation in modifier", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      table[0].foo.nested = { id: 1 };
      await database.set("dobjects", table[0].id, (row) => ({
        "foo.nested": { id: 1 }
      }));
      await expect(database.get("dobjects", table[0].id)).to.eventually.deep.eq([table[0]]);
      table[0].foo.nested = {
        id: 1,
        timestamp: /* @__PURE__ */ new Date("2009/10/01 15:40:00"),
        date: /* @__PURE__ */ new Date("1999/10/01"),
        binary: toBinary("boom")
      };
      table[0].bar.nested = {
        ...table[0].bar?.nested,
        id: 9,
        timestamp: /* @__PURE__ */ new Date("2009/10/01 15:40:00"),
        date: /* @__PURE__ */ new Date("1999/10/01"),
        binary: toBinary("boom")
      };
      await database.set("dobjects", table[0].id, {
        "foo.nested.timestamp": /* @__PURE__ */ new Date("2009/10/01 15:40:00"),
        "foo.nested.date": /* @__PURE__ */ new Date("1999/10/01"),
        "foo.nested.binary": toBinary("boom"),
        "bar.nested.id": 9,
        "bar.nested.timestamp": /* @__PURE__ */ new Date("2009/10/01 15:40:00"),
        "bar.nested.date": /* @__PURE__ */ new Date("1999/10/01"),
        "bar.nested.binary": toBinary("boom")
      });
      await expect(database.get("dobjects", table[0].id)).to.eventually.deep.eq([table[0]]);
      table[0].baz = [{}, {}];
      await database.set("dobjects", table[0].id, {
        baz: [{}, {}]
      });
      await expect(database.get("dobjects", table[0].id)).to.eventually.deep.eq([table[0]]);
    });
    typeModel && it("$.object encoding", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      await expect(database.eval("dobjects", (row) => $.array($.object(row)))).to.eventually.have.deep.members(table);
    });
    typeModel && it("$.object decoding", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      await expect(
        database.select("dobjects").project({
          obj: /* @__PURE__ */ __name((row) => $.object(row), "obj")
        }).project(mapValues(database.tables["dobjects"].fields, (field, key) => (row) => row.obj[key])).execute()
      ).to.eventually.have.deep.members(table);
    });
    aggregateNull && it("$.array encoding", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      await Promise.all(Object.keys(database.tables["dobjects"].fields).map(
        (key) => expect(database.eval("dobjects", (row) => $.array(row[key]))).to.eventually.have.deep.members(table.map((x) => getCell(x, key)))
      ));
    });
    it("$.array encoding boxed", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      await Promise.all(Object.keys(database.tables["dobjects"].fields).map(
        (key) => expect(database.eval("dobjects", (row) => $.array($.object({ x: row[key] })))).to.eventually.have.deep.members(table.map((x) => ({ x: getCell(x, key) })))
      ));
    });
    it("subquery encoding", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      await Promise.all(["baz"].map(
        (key) => expect(
          database.select("dobjects", 1).project({
            x: /* @__PURE__ */ __name((row) => database.select("dobjects").evaluate(key), "x")
          }).execute()
        ).to.eventually.have.shape([{ x: table.map((x) => getCell(x, key)) }])
      ));
    });
    it("project with dot notation", async () => {
      const table = await setup2(database, "dobjects", dobjectTable);
      const keys = deduplicate([
        "foo.nested.object",
        "foo.nested.object.embed",
        ...Object.keys(database.tables["dobjects"].fields).flatMap((k) => k.split(".").reduce((arr, c) => arr.length ? [`${arr[0]}.${c}`, ...arr] : [c], []))
      ]);
      await Promise.all(keys.map(
        (key) => expect(database.select("dobjects").project([key]).execute()).to.eventually.have.deep.members(table.map((row) => unravel({ [key]: getCell(row, key) })))
      ));
    });
    it("bitwise ops on bigint", async () => {
      await setup2(database, "dobjects", dobjectTable);
      await expect(database.get("dobjects", (row) => $.eq($.and(row.foo.nested.int64, 5n), 1n))).to.eventually.have.length(1);
      await expect(database.get("dobjects", (row) => $.eq($.or(row.foo.nested.int64, 4n), 127n))).to.eventually.have.length(1);
      await expect(database.get("dobjects", (row) => $.eq($.xor(row.foo.nested.int64, 2n), 121n))).to.eventually.have.length(1);
      await expect(database.eval("dobjects", (row) => $.max($.or(row.foo.nested.int64, 9223372036854775701n)))).eventually.to.deep.equal(9223372036854775807n);
    });
    nullableComparator && it("nested $get", async () => {
      await setup2(database, "dobjects", dobjectTable);
      await expect(database.get("dobjects", (row) => $.eq(row.baz[0].nested.id, 1))).to.eventually.have.length(2);
      await expect(database.get("dobjects", (row) => $.eq(row.baz[0].nested.array[0], 1))).to.eventually.have.length(2);
    });
  }, "ObjectFields");
})(ModelOperations || (ModelOperations = {}));
var model_default = ModelOperations;

// src/query.ts
import { $ as $2 } from "minato";
import { expect as expect2 } from "chai";
function QueryOperators(database) {
  database.extend("temp1", {
    id: "unsigned",
    text: "string",
    value: "integer",
    bool: "boolean",
    list: "list",
    timestamp: "timestamp",
    date: "date",
    time: "time",
    regex: "string"
  }, {
    autoInc: true
  });
}
__name(QueryOperators, "QueryOperators");
((QueryOperators2) => {
  QueryOperators2.comparison = /* @__PURE__ */ __name(function Comparison(database, options = {}) {
    const { nullableComparator = true } = options;
    before(async () => {
      await database.remove("temp1", {});
      await database.create("temp1", {
        text: "awesome foo",
        timestamp: /* @__PURE__ */ new Date("2000-01-01"),
        date: /* @__PURE__ */ new Date("2020-01-01"),
        time: /* @__PURE__ */ new Date("2020-01-01 12:00:00")
      });
      await database.create("temp1", { text: "awesome bar" });
      await database.create("temp1", { text: "awesome baz" });
    });
    it("basic support", async () => {
      await expect2(database.get("temp1", {
        id: { $eq: 2 }
      })).eventually.to.have.length(1).with.nested.property("0.text").equal("awesome bar");
      await expect2(database.get("temp1", {
        id: { $ne: 3 }
      })).eventually.to.have.length(2).with.nested.property("0.text").equal("awesome foo");
      await expect2(database.get("temp1", {
        id: { $gt: 1 }
      })).eventually.to.have.length(2).with.nested.property("1.text").equal("awesome baz");
      await expect2(database.get("temp1", {
        id: { $gte: 3 }
      })).eventually.to.have.length(1).with.nested.property("0.text").equal("awesome baz");
      await expect2(database.get("temp1", {
        id: { $lt: 1 }
      })).eventually.to.have.length(0);
      await expect2(database.get("temp1", {
        id: { $lte: 2 }
      })).eventually.to.have.length(2).with.nested.property("0.text").equal("awesome foo");
    });
    it("timestamp comparisons", async () => {
      await expect2(database.get("temp1", {
        timestamp: { $gt: /* @__PURE__ */ new Date("1999-01-01") }
      })).eventually.to.have.length(1).with.nested.property("0.text").equal("awesome foo");
      await expect2(database.get("temp1", {
        timestamp: { $lte: /* @__PURE__ */ new Date("1999-01-01") }
      })).eventually.to.have.length(0);
      nullableComparator && await expect2(database.get(
        "temp1",
        (row) => $2.gt(row.timestamp, /* @__PURE__ */ new Date("1999-01-01"))
      )).eventually.to.have.length(1).with.nested.property("0.text").equal("awesome foo");
    });
    it("date comparisons", async () => {
      await expect2(database.get("temp1", {
        date: { $gt: /* @__PURE__ */ new Date("1999-01-01") }
      })).eventually.to.have.length(1).with.nested.property("0.text").equal("awesome foo");
      await expect2(database.get("temp1", {
        date: { $lte: /* @__PURE__ */ new Date("1999-01-01") }
      })).eventually.to.have.length(0);
    });
    it("time comparisons", async () => {
      await expect2(database.get("temp1", {
        // date should not matter
        time: { $gt: /* @__PURE__ */ new Date("1970-01-01 11:00:00") }
      })).eventually.to.have.length(1).with.nested.property("0.text").equal("awesome foo");
      await expect2(database.get("temp1", {
        time: { $lte: /* @__PURE__ */ new Date("1970-01-01 11:00:00") }
      })).eventually.to.have.length(0);
    });
    it("shorthand syntax", async () => {
      await expect2(database.get("temp1", {
        id: 2
      })).eventually.to.have.length(1).with.nested.property("0.text").equal("awesome bar");
      await expect2(database.get("temp1", {
        timestamp: /* @__PURE__ */ new Date("2000-01-01")
      })).eventually.to.have.length(1).with.nested.property("0.text").equal("awesome foo");
    });
  }, "Comparison");
  QueryOperators2.existence = /* @__PURE__ */ __name(function Existence(database) {
    before(async () => {
      await database.remove("temp1", {});
      await database.create("temp1", { date: /* @__PURE__ */ new Date("2010-01-01") });
      await database.create("temp1", { date: /* @__PURE__ */ new Date("2020-01-01") });
      await database.create("temp1", {});
    });
    it("basic support", async () => {
      await expect2(database.get("temp1", {
        date: { $exists: true }
      })).eventually.to.have.length(2);
      await expect2(database.get("temp1", {
        date: { $exists: false }
      })).eventually.to.have.length(1);
    });
    it("shorthand syntax", async () => {
      await expect2(database.get("temp1", {
        date: null
      })).eventually.to.have.length(1);
    });
  }, "Existence");
  QueryOperators2.membership = /* @__PURE__ */ __name(function Membership(database) {
    before(async () => {
      await database.remove("temp1", {});
      await database.create("temp1", { value: 3 });
      await database.create("temp1", { value: 4 });
      await database.create("temp1", { value: 7 });
    });
    it("edge cases", async () => {
      await expect2(database.get("temp1", {
        value: { $in: [] }
      })).eventually.to.have.length(0);
      await expect2(database.get("temp1", {
        value: { $nin: [] }
      })).eventually.to.have.length(3);
    });
    it("basic support", async () => {
      await expect2(database.get("temp1", {
        value: { $in: [3, 4, 5] }
      })).eventually.to.have.length(2);
      await expect2(database.get("temp1", (row) => {
        return $2.in(row.value, [3, 4, 5]);
      })).eventually.to.have.length(2);
      await expect2(database.get("temp1", {
        value: { $nin: [4, 5, 6] }
      })).eventually.to.have.length(2);
    });
    it("shorthand syntax", async () => {
      await expect2(database.get("temp1", {
        value: []
      })).eventually.to.have.length(0);
      await expect2(database.get("temp1", {
        value: [3, 4, 5]
      })).eventually.to.have.length(2);
    });
  }, "Membership");
  QueryOperators2.regexp = /* @__PURE__ */ __name(function RegularExpression(database, options = {}) {
    const { regexBy = true, regexFor = true } = options;
    before(async () => {
      await database.remove("temp1", {});
      await database.create("temp1", { text: "awesome foo", regex: "foo" });
      await database.create("temp1", { text: "awesome bar", regex: "bar" });
      await database.create("temp1", { text: "awesome foo bar", regex: "baz" });
      await database.create("temp1", { text: "xxx", regex: "bAz" });
    });
    regexFor && it("$regexFor", async () => {
      await expect2(database.get("temp1", {
        regex: { $regexFor: "foo bar" }
      })).eventually.to.have.length(2);
      await expect2(database.get("temp1", {
        regex: { $regexFor: "baz" }
      })).eventually.to.have.length(1);
      await expect2(database.get("temp1", {
        regex: { $regexFor: "bAr" }
      })).eventually.to.have.length(0);
      await expect2(database.get("temp1", {
        regex: { $regexFor: { input: "foo bar" } }
      })).eventually.to.have.length(2);
      await expect2(database.get("temp1", {
        regex: { $regexFor: { input: "bAr", flags: "i" } }
      })).eventually.to.have.length(1);
    });
    regexBy && it("$regexBy", async () => {
      await expect2(database.get("temp1", {
        text: { $regex: /^.*foo.*$/ }
      })).eventually.to.have.length(2);
      await expect2(database.get("temp1", {
        text: { $regex: /^.*bar$/ }
      })).eventually.to.have.length(2);
      await expect2(database.get("temp1", {
        text: { $regex: /^.*bAr$/ }
      })).eventually.to.have.length(0);
      await expect2(database.get("temp1", {
        text: { $regex: /^.*bAr$/i }
      })).eventually.to.have.length(2);
      await expect2(database.get("temp1", {
        text: { $regex: { source: "^.*foo.*$" } }
      })).eventually.to.have.length(2);
    });
    regexBy && it("shorthand syntax", async () => {
      await expect2(database.get("temp1", {
        text: /^.*foo$/
      })).eventually.to.have.length(1).with.nested.property("[0].text").equal("awesome foo");
    });
    regexBy && regexFor && it("$.regex", async () => {
      await expect2(database.get("temp1", (row) => $2.regex("foo bar", row.regex))).eventually.to.have.length(2);
      await expect2(database.get("temp1", (row) => $2.regex("baz", row.regex))).eventually.to.have.length(1);
      await expect2(database.get("temp1", (row) => $2.regex(row.text, /^.*foo.*$/))).eventually.to.have.length(2);
      await expect2(database.get("temp1", (row) => $2.regex(row.text, /^.*bar.*$/))).eventually.to.have.length(2);
      await expect2(database.get("temp1", (row) => $2.regex(row.text, row.regex))).eventually.to.have.length(2);
      await expect2(database.get("temp1", (row) => $2.regex(row.text, /^.*bAr.*$/i))).eventually.to.have.length(2);
      await expect2(database.get("temp1", (row) => $2.regex(row.text, /^.*bAr.*$/))).eventually.to.have.length(0);
      await expect2(database.get("temp1", (row) => $2.regex(row.text, "^.*bAr.*$", "i"))).eventually.to.have.length(2);
    });
  }, "RegularExpression");
  QueryOperators2.bitwise = /* @__PURE__ */ __name(function Bitwise(database) {
    before(async () => {
      await database.remove("temp1", {});
      await database.create("temp1", { value: 3 });
      await database.create("temp1", { value: 4 });
      await database.create("temp1", { value: 7 });
    });
    it("basic support", async () => {
      await expect2(database.get("temp1", {
        value: { $bitsAllSet: 3 }
      })).eventually.to.have.shape([{ value: 3 }, { value: 7 }]);
      await expect2(database.get("temp1", {
        value: { $bitsAllClear: 9 }
      })).eventually.to.have.shape([{ value: 4 }]);
      await expect2(database.get("temp1", {
        value: { $bitsAnySet: 4 }
      })).eventually.to.have.shape([{ value: 4 }, { value: 7 }]);
      await expect2(database.get("temp1", {
        value: { $bitsAnyClear: 6 }
      })).eventually.to.have.shape([{ value: 3 }, { value: 4 }]);
    });
    it("using expressions", async () => {
      await expect2(database.get(
        "temp1",
        (row) => $2.eq($2.and(row.value, 1, 1), 1)
      )).eventually.to.have.shape([{ value: 3 }, { value: 7 }]);
      await expect2(database.get(
        "temp1",
        (row) => $2.eq($2.or(row.value, 3, 3), 7)
      )).eventually.to.have.shape([{ value: 4 }, { value: 7 }]);
      await expect2(database.get(
        "temp1",
        (row) => $2.eq($2.and(row.value, $2.not(4)), 3)
      )).eventually.to.have.shape([{ value: 3 }, { value: 7 }]);
      await expect2(database.get(
        "temp1",
        (row) => $2.eq($2.xor(0, row.value, 3), 7)
      )).eventually.to.have.shape([{ value: 4 }]);
      await expect2(database.eval("temp1", (_) => $2.max($2.not(2 ** 30)))).eventually.to.deep.equal(-(2 ** 30) - 1);
      await expect2(database.eval("temp1", (_) => $2.max($2.not(-(2 ** 30))))).eventually.to.deep.equal(2 ** 30 - 1);
      await expect2(database.eval("temp1", (_) => $2.max($2.or(-(2 ** 30), 1)))).eventually.to.deep.equal(-(2 ** 30) + 1);
      await expect2(database.eval("temp1", (_) => $2.max($2.xor(2, 3, 6)))).eventually.to.deep.equal(7);
      await expect2(database.eval("temp1", (_) => $2.array($2.xor(true, false)))).eventually.to.include.members([true]);
      await expect2(database.eval("temp1", (_) => $2.array($2.xor(true, false, true)))).eventually.to.include.members([false]);
      await expect2(database.eval("temp1", (_) => $2.max($2.not(BigInt(2 ** 40))))).eventually.to.deep.equal(BigInt(-(2 ** 40) - 1));
      await expect2(database.eval("temp1", (_) => $2.max($2.and(9223372036854775701n, 9223372036854775702n)))).eventually.to.deep.equal(9223372036854775700n);
      await expect2(database.eval("temp1", (_) => $2.max($2.or(9223372036854775701n, 1n)))).eventually.to.deep.equal(9223372036854775701n);
      await expect2(database.eval("temp1", (_) => $2.max($2.xor(9223372036854775701n, 9223372036854775702n)))).eventually.to.deep.equal(3n);
      await expect2(database.eval("temp1", (_) => $2.max($2.not(9223372036854775701n)))).eventually.to.deep.equal(-9223372036854775702n);
    });
  }, "Bitwise");
  QueryOperators2.list = /* @__PURE__ */ __name(function List(database, options = {}) {
    const { size = true, element = true, elementQuery = element } = options;
    before(async () => {
      await database.remove("temp1", {});
      await database.create("temp1", { id: 1, list: [] });
      await database.create("temp1", { id: 2, list: [23] });
      await database.create("temp1", { id: 3, list: [233] });
      await database.create("temp1", { id: 4, list: [233, 332] });
    });
    size && it("$size", async () => {
      await expect2(database.get("temp1", {
        list: { $size: 1 }
      })).eventually.to.have.length(2).with.shape([{ id: 2 }, { id: 3 }]);
      await expect2(database.get("temp1", {
        list: { $size: 0 }
      })).eventually.to.have.length(1).with.shape([{ id: 1 }]);
    });
    size && it("$.length", async () => {
      await expect2(
        database.select("temp1").project({ x: /* @__PURE__ */ __name((row) => $2.length(row.list), "x") }).orderBy((row) => row.x).execute()
      ).eventually.to.deep.equal([
        { x: 0 },
        { x: 1 },
        { x: 1 },
        { x: 2 }
      ]);
    });
    element && it("$el shorthand", async () => {
      await expect2(database.get("temp1", {
        list: { $el: 233 }
      })).eventually.to.have.length(2).with.shape([{ id: 3 }, { id: 4 }]);
    });
    elementQuery && it("$el with field temp1", async () => {
      await expect2(database.get("temp1", {
        list: { $el: { $lt: 50 } }
      })).eventually.to.have.shape([{ id: 2 }]);
    });
  }, "List");
  QueryOperators2.evaluation = /* @__PURE__ */ __name(function Evaluation(database) {
    before(async () => {
      await database.remove("temp1", {});
      await database.create("temp1", { id: 1, value: 8 });
      await database.create("temp1", { id: 2, value: 7 });
      await database.create("temp1", { id: 3, value: 9 });
    });
    it("arithmetic operators", async () => {
      await expect2(database.get("temp1", (row) => {
        return $2.eq(9, $2.add(row.id, row.value));
      })).eventually.to.have.length(2).with.shape([{ id: 1 }, { id: 2 }]);
    });
  }, "Evaluation");
  let Logical;
  ((Logical2) => {
    Logical2.queryLevel = /* @__PURE__ */ __name(function LogicalQueryLevel(database) {
      before(async () => {
        await database.remove("temp1", {});
        await database.create("temp1", { id: 1 });
        await database.create("temp1", { id: 2 });
        await database.create("temp1", { id: 3 });
      });
      it("edge cases", async () => {
        await expect2(database.get("temp1", {})).eventually.to.have.length(3);
        await expect2(database.get("temp1", { $and: [] })).eventually.to.have.length(3);
        await expect2(database.get("temp1", { $or: [] })).eventually.to.have.length(0);
        await expect2(database.get("temp1", { $not: {} })).eventually.to.have.length(0);
        await expect2(database.get("temp1", { $not: { $and: [] } })).eventually.to.have.length(0);
        await expect2(database.get("temp1", { $not: { $or: [] } })).eventually.to.have.length(3);
      });
      it("$or", async () => {
        await expect2(database.get("temp1", {
          $or: [{ id: 1 }, { id: { $ne: 2 } }]
        })).eventually.to.have.length(2).with.shape([{ id: 1 }, { id: 3 }]);
        await expect2(database.get("temp1", {
          $or: [{ id: 1 }, { id: { $eq: 2 } }]
        })).eventually.to.have.length(2).with.shape([{ id: 1 }, { id: 2 }]);
        await expect2(database.get("temp1", {
          $or: [{ id: { $ne: 1 } }, { id: { $ne: 2 } }]
        })).eventually.to.have.length(3).with.shape([{ id: 1 }, { id: 2 }, { id: 3 }]);
      });
      it("$and", async () => {
        await expect2(database.get("temp1", {
          $and: [{ id: 1 }, { id: { $ne: 2 } }]
        })).eventually.to.have.length(1).with.shape([{ id: 1 }]);
        await expect2(database.get("temp1", {
          $and: [{ id: 1 }, { id: { $eq: 2 } }]
        })).eventually.to.have.length(0);
        await expect2(database.get("temp1", {
          $and: [{ id: { $ne: 1 } }, { id: { $ne: 2 } }]
        })).eventually.to.have.length(1).with.shape([{ id: 3 }]);
      });
      it("$not", async () => {
        await expect2(database.get("temp1", {
          $not: { id: 1 }
        })).eventually.to.have.length(2).with.shape([{ id: 2 }, { id: 3 }]);
        await expect2(database.get("temp1", {
          $not: { id: { $ne: 1 } }
        })).eventually.to.have.length(1).with.shape([{ id: 1 }]);
      });
    }, "LogicalQueryLevel");
    Logical2.fieldLevel = /* @__PURE__ */ __name(function LogicalFieldLevel(database) {
      before(async () => {
        await database.remove("temp1", {});
        await database.create("temp1", { id: 1 });
        await database.create("temp1", { id: 2 });
        await database.create("temp1", { id: 3 });
      });
      it("edge cases", async () => {
        await expect2(database.get("temp1", { id: {} })).eventually.to.have.length(3);
        await expect2(database.get("temp1", { id: { $and: [] } })).eventually.to.have.length(3);
        await expect2(database.get("temp1", { id: { $or: [] } })).eventually.to.have.length(0);
        await expect2(database.get("temp1", { id: { $not: {} } })).eventually.to.have.length(0);
        await expect2(database.get("temp1", { id: { $not: { $and: [] } } })).eventually.to.have.length(0);
        await expect2(database.get("temp1", { id: { $not: { $or: [] } } })).eventually.to.have.length(3);
      });
      it("$or", async () => {
        await expect2(database.get("temp1", {
          id: { $or: [1, { $gt: 2 }] }
        })).eventually.to.have.length(2).with.shape([{ id: 1 }, { id: 3 }]);
        await expect2(database.get("temp1", {
          id: { $or: [1, { $gt: 2 }], $ne: 3 }
        })).eventually.to.have.length(1).with.shape([{ id: 1 }]);
      });
      it("$and", async () => {
        await expect2(database.get("temp1", {
          id: { $and: [[1, 2], { $lt: 2 }] }
        })).eventually.to.have.length(1).with.shape([{ id: 1 }]);
        await expect2(database.get("temp1", {
          id: { $and: [[1, 2], { $lt: 2 }], $eq: 2 }
        })).eventually.to.have.length(0);
      });
      it("$not", async () => {
        await expect2(database.get("temp1", {
          id: { $not: 1 }
        })).eventually.to.have.length(2).with.shape([{ id: 2 }, { id: 3 }]);
        await expect2(database.get("temp1", {
          id: { $not: 1, $lt: 3 }
        })).eventually.to.have.length(1).with.shape([{ id: 2 }]);
      });
    }, "LogicalFieldLevel");
  })(Logical || (Logical = {}));
  QueryOperators2.logical = Logical;
})(QueryOperators || (QueryOperators = {}));
var query_default = QueryOperators;

// src/update.ts
import { $ as $3 } from "minato";
import { deepEqual, omit as omit2 } from "cosmokit";
import { expect as expect3 } from "chai";
function OrmOperations(database) {
  database.extend("temp2", {
    id: "unsigned",
    text: "string",
    num: "integer",
    double: "double",
    bool: "boolean",
    list: "list",
    timestamp: "timestamp",
    date: "date",
    time: "time",
    bigtext: "text",
    binary: "binary",
    bigint: {
      type: "string",
      dump: /* @__PURE__ */ __name((value) => value ? value.toString() : value, "dump"),
      load: /* @__PURE__ */ __name((value) => value ? BigInt(value) : value, "load")
    }
  }, {
    autoInc: true,
    indexes: ["text"]
  });
  database.extend("temp3", {
    ida: "unsigned",
    idb: "string",
    value: "string"
  }, {
    primary: ["ida", "idb"],
    unique: ["value"]
  });
}
__name(OrmOperations, "OrmOperations");
((OrmOperations2) => {
  const merge = /* @__PURE__ */ __name((a, b) => ({ ...a, ...b }), "merge");
  const magicBorn = /* @__PURE__ */ new Date("1970/08/17");
  const toBinary2 = /* @__PURE__ */ __name((source) => new TextEncoder().encode(source).buffer, "toBinary");
  const barTable = [
    { id: 1, bool: true },
    { id: 2, text: "pku" },
    { id: 3, num: 1989 },
    { id: 4, list: ["1", "1", "4"] },
    { id: 5, timestamp: magicBorn },
    { id: 6, date: magicBorn },
    { id: 7, time: /* @__PURE__ */ new Date("1970-01-01 12:00:00") },
    { id: 8, binary: toBinary2("hello") },
    { id: 9, bigint: BigInt(1e63) },
    { id: 10, text: "a\b	\f\n\r'\"\\`b", list: ["a\b	\f\n\r'\"\\`b"] }
  ];
  const bazTable = [
    { ida: 1, idb: "a", value: "a" },
    { ida: 2, idb: "a", value: "b" },
    { ida: 1, idb: "b", value: "c" },
    { ida: 2, idb: "b", value: "d" }
  ];
  async function setup2(database, name, table) {
    await database.remove(name, {});
    const result = [];
    for (const item of table) {
      result.push(await database.create(name, item));
    }
    return result;
  }
  __name(setup2, "setup");
  OrmOperations2.create = /* @__PURE__ */ __name(function Create(database) {
    it("auto increment primary key", async () => {
      const table = barTable.map((bar) => merge(database.tables.temp2.create(), bar));
      for (const index2 in barTable) {
        const bar = await database.create("temp2", omit2(barTable[index2], ["id"]));
        barTable[index2].id = bar.id;
        expect3(bar).to.have.shape(table[index2]);
      }
      for (const obj of table) {
        await expect3(database.get("temp2", { id: obj.id })).to.eventually.have.shape([obj]);
      }
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
      await database.remove("temp2", { id: table.length });
      await expect3(database.create("temp2", {})).to.eventually.have.shape({ id: table.length + 1 });
    });
    it("specify primary key", async () => {
      for (const obj of bazTable) {
        await expect3(database.create("temp3", obj)).eventually.shape(obj);
      }
      for (const obj of bazTable) {
        await expect3(database.get("temp3", { ida: obj.ida, idb: obj.idb })).eventually.shape([obj]);
      }
    });
    it("missing primary key", async () => {
      await expect3(database.create("temp3", { ida: 1 })).eventually.rejected;
    });
    it("duplicate primary key", async () => {
      await expect3(database.create("temp2", { id: barTable[0].id })).eventually.rejected;
      await expect3(database.create("temp3", { ida: 1, idb: "a" })).eventually.rejected;
    });
    it("parallel create", async () => {
      await database.remove("temp2", {});
      await Promise.all([...Array(5)].map(() => database.create("temp2", {})));
      const result = await database.get("temp2", {});
      expect3(result).length(5);
      const ids = result.map((e) => e.id).sort((a, b) => a - b);
      const min = Math.min(...ids);
      expect3(ids.map((id) => id - min + 1)).shape([1, 2, 3, 4, 5]);
      await database.remove("temp2", {});
    });
    it("enormous field", async () => {
      const row = { id: 100, bigtext: Array(1e6).fill("a").join("") };
      await database.create("temp2", row);
      await expect3(database.get("temp2", 100)).to.eventually.have.nested.property("0.bigtext", row.bigtext);
    });
    it("advanced type", async () => {
      await setup2(database, "temp2", barTable);
      await expect3(database.create("temp2", { binary: toBinary2("world") })).to.eventually.have.shape({ binary: toBinary2("world") });
      await expect3(database.get("temp2", { binary: { $exists: true } })).to.eventually.have.shape([
        { binary: toBinary2("hello") },
        { binary: toBinary2("world") }
      ]);
      await expect3(database.create("temp2", { bigint: 1234567891011121314151617181920n })).to.eventually.have.shape({ bigint: 1234567891011121314151617181920n });
      await expect3(database.get("temp2", { bigint: { $exists: true } })).to.eventually.have.shape([
        { bigint: BigInt(1e63) },
        { bigint: 1234567891011121314151617181920n }
      ]);
    });
  }, "Create");
  OrmOperations2.set = /* @__PURE__ */ __name(function Set2(database) {
    it("basic support", async () => {
      const table = await setup2(database, "temp2", barTable);
      const data = table.find((bar) => bar.timestamp);
      data.list = ["2", "3", "3"];
      data.text = `$'"%~\``;
      const magicIds = table.slice(2, 4).map((data2) => {
        data2.list = ["2", "3", "3"];
        data2.text = `$'"%~\``;
        return data2.id;
      });
      await expect3(database.set("temp2", {
        $or: [
          { id: magicIds },
          { timestamp: magicBorn }
        ]
      }, { list: ["2", "3", "3"], text: `$'"%~\`` })).to.eventually.have.shape({ matched: 3 });
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
    it("null override", async () => {
      const table = await setup2(database, "temp2", barTable);
      const data = table.find((bar) => bar.timestamp);
      data.text = null;
      await database.set("temp2", { timestamp: { $exists: true } }, { text: null });
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
      await expect3(database.get("temp2", { text: { $exists: false } })).to.eventually.have.length(1);
    });
    it("noop", async () => {
      const table = await setup2(database, "temp2", barTable);
      await database.set("temp2", {}, {});
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
      await database.set("temp2", {}, { text: void 0 });
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
    it("using expressions", async () => {
      const table = await setup2(database, "temp2", barTable);
      table[1].num = table[1].id * 2;
      table[2].num = table[2].id * 2;
      await database.set("temp2", [table[1].id, table[2].id, 99], (row) => ({
        num: $3.multiply(2, row.id)
      }));
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
    it("using expressions in query", async () => {
      const table = await setup2(database, "temp2", barTable);
      table[1].num = table[1].id * 2;
      table[2].num = table[2].id * 2;
      await database.set("temp2", (row) => $3.in(row.id, [table[1].id, table[2].id, 99]), (row) => ({
        num: $3.multiply(2, row.id)
      }));
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
    it("enormous field", async () => {
      const row = await database.create("temp2", {});
      row.bigtext = Array(1e6).fill("a").join("");
      await database.set("temp2", row.id, { bigtext: row.bigtext });
      await expect3(database.get("temp2", row.id)).to.eventually.have.nested.property("0.bigtext", row.bigtext);
    });
    it("advanced type", async () => {
      const table = await setup2(database, "temp2", barTable);
      const data1 = table.find((item) => item.id === 1);
      data1.binary = toBinary2("world");
      data1.bigint = 1234567891011121314151617181920n;
      await database.set("temp2", { id: 1 }, { binary: toBinary2("world"), bigint: 1234567891011121314151617181920n });
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
  }, "Set");
  OrmOperations2.upsert = /* @__PURE__ */ __name(function Upsert(database) {
    it("update existing records", async () => {
      const table = await setup2(database, "temp2", barTable);
      const data = [
        { id: table[0].id, text: "thu" },
        { id: table[1].id, num: 1911 },
        { id: table[2].id, list: ["2", "3", "3"] }
      ];
      data.forEach((update) => {
        const index2 = table.findIndex((obj) => obj.id === update.id);
        table[index2] = merge(table[index2], update);
      });
      await expect3(database.upsert("temp2", data.slice(0, 2))).to.eventually.have.shape({ inserted: 0, matched: 2 });
      await expect3(database.upsert("temp2", data.slice(0, 2))).to.eventually.have.shape({ inserted: 0, matched: 2 });
      await expect3(database.upsert("temp2", data.slice(2))).to.eventually.have.shape({ inserted: 0, matched: 1 });
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
    it("insert new records", async () => {
      const table = await setup2(database, "temp2", barTable);
      const data = [
        { id: table[table.length - 1].id + 1, text: 'wm"lake' },
        { id: table[table.length - 1].id + 2, text: "by'tower" },
        { id: table[table.length - 1].id + 3, text: "over" }
      ];
      table.push(...data.map((bar) => merge(database.tables.temp2.create(), bar)));
      await expect3(database.upsert("temp2", data.slice(0, 2))).to.eventually.have.shape({ inserted: 2, matched: 0 });
      await expect3(database.upsert("temp2", data.slice(2))).to.eventually.have.shape({ inserted: 1, matched: 0 });
      await expect3(database.upsert("temp2", data.slice(2))).to.eventually.have.shape({ inserted: 0, matched: 1 });
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
    it("using expressions", async () => {
      const table = await setup2(database, "temp2", barTable);
      const data2 = table.find((item) => item.id === 2);
      const data3 = table.find((item) => item.id === 3);
      const data99 = table.find((item) => item.id === 99);
      data2.num = data2.id * 2;
      data3.num = data3.num + 3;
      expect3(data99).to.be.undefined;
      table.push({ id: 99, num: 999 });
      await expect3(database.upsert("temp2", (row) => [
        { id: 2, num: $3.multiply(2, row.id) },
        { id: 3, num: $3.add(3, row.num) },
        { id: 99, num: 999 }
      ])).to.eventually.have.shape({ inserted: 1, matched: 2 });
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
    it("using expressions with initial values", async () => {
      const table = await setup2(database, "temp3", bazTable);
      const data = [
        { ida: 114, idb: "514", value: "baz" }
      ];
      table.push(...data.map((bar) => merge(database.tables.temp3.create(), bar)));
      await database.upsert("temp3", (row) => [
        { ida: 114, idb: "514", value: $3.concat(row.value, "baz") }
      ]);
      await expect3(database.get("temp3", {})).to.eventually.have.deep.members(table);
    });
    it("multi condition on composite primary", async () => {
      const table = await setup2(database, "temp3", bazTable);
      table[1].value = `$'"%~\``;
      table[2].value = "cc";
      table.push({ ida: 114, idb: "514", value: "baz" });
      await database.upsert("temp3", (row) => [
        { ida: 2, idb: "a", value: `$'"%~\`` },
        { ida: 1, idb: "b", value: "cc" },
        { ida: 114, idb: "514", value: $3.concat(row.value, "baz") }
      ]);
      await expect3(database.get("temp3", {})).to.eventually.have.deep.members(table);
    });
    it("enormous field", async () => {
      const row = await database.create("temp2", {});
      row.bigtext = Array(1e6).fill("a").join("");
      await database.upsert("temp2", [row]);
      await expect3(database.get("temp2", row.id)).to.eventually.have.nested.property("0.bigtext", row.bigtext);
    });
    it("with unique", async () => {
      await setup2(database, "temp3", bazTable);
      await expect3(database.upsert("temp3", [
        { ida: 10, idb: "a", value: "e" },
        { ida: 11, idb: "b", value: "f" },
        { ida: 12, idb: "c", value: "d" }
      ], ["value"])).to.eventually.have.shape({ inserted: 2, matched: 1 });
    });
    it("advanced type", async () => {
      const table = await setup2(database, "temp2", barTable);
      const data1 = table.find((item) => item.id === 1);
      data1.binary = toBinary2("world");
      data1.bigint = 1234567891011121314151617181920n;
      table.push({ binary: toBinary2("foobar"), bigint: 1234567891011121314151617181920212223n });
      await database.upsert("temp2", [
        { id: 1, binary: toBinary2("world"), bigint: 1234567891011121314151617181920n },
        { binary: toBinary2("foobar"), bigint: 1234567891011121314151617181920212223n }
      ]);
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
  }, "Upsert");
  OrmOperations2.remove = /* @__PURE__ */ __name(function Remove(database) {
    it("basic support", async () => {
      await setup2(database, "temp3", bazTable);
      await expect3(database.remove("temp3", { ida: 1, idb: "a" })).to.eventually.have.shape({ matched: 1 });
      await expect3(database.get("temp3", {})).eventually.length(3);
      await expect3(database.remove("temp3", { ida: 1, idb: "b", value: "b" })).to.eventually.have.shape({ matched: 0 });
      await expect3(database.get("temp3", {})).eventually.length(3);
      await expect3(database.remove("temp3", { idb: "b" })).to.eventually.have.shape({ matched: 2 });
      await expect3(database.get("temp3", {})).eventually.length(1);
      await expect3(database.remove("temp3", {})).to.eventually.have.shape({ matched: 1 });
      await expect3(database.get("temp3", {})).eventually.length(0);
    });
    it("advanced query", async () => {
      const table = await setup2(database, "temp2", barTable);
      await database.remove("temp2", { id: { $gt: table[1].id } });
      await expect3(database.get("temp2", {})).eventually.length(2);
      await database.remove("temp2", { id: { $lte: table[1].id } });
      await expect3(database.get("temp2", {})).eventually.length(0);
    });
  }, "Remove");
  OrmOperations2.stats = /* @__PURE__ */ __name(function Stats(database) {
    it("basic support", async () => {
      const stats2 = await database.stats();
      expect3(stats2.size).to.be.a("number");
      expect3(stats2.tables["temp2"].count).to.be.a("number");
      expect3(stats2.tables["temp2"].size).to.be.a("number");
    });
  }, "Stats");
  OrmOperations2.misc = /* @__PURE__ */ __name(function Misc(database) {
    it("date type", async () => {
      const table = await setup2(database, "temp2", barTable);
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
      await expect3(database.eval("temp2", (row) => $3.max(row.timestamp))).to.eventually.deep.eq(table[4].timestamp);
      await expect3(database.eval("temp2", (row) => $3.max(row.date))).to.eventually.deep.eq(table[5].date);
      await expect3(database.eval("temp2", (row) => $3.max(row.time))).to.eventually.deep.eq(table[6].time);
      table.push(await database.create("temp2", {
        text: "date type",
        timestamp: /* @__PURE__ */ new Date(),
        date: /* @__PURE__ */ new Date(),
        time: /* @__PURE__ */ new Date()
      }));
      await expect3(database.get("temp2", {})).to.eventually.have.shape(table);
    });
    it("$.number on date types", async () => {
      await setup2(database, "temp2", barTable);
      const date = /* @__PURE__ */ new Date("1970-02-02 12:00:00");
      const table = [
        { num: 191, timestamp: date },
        { num: 192, date },
        { num: 193, time: date }
      ];
      await database.upsert("temp2", table);
      await expect3(database.eval("temp2", (row) => $3.array($3.number(row.timestamp)), { num: 191 })).to.eventually.deep.equal([+date / 1e3]);
      date.setHours(0, 0, 0, 0);
      await expect3(database.eval("temp2", (row) => $3.array($3.number(row.date)), { num: 192 })).to.eventually.deep.equal([+date / 1e3]);
      await expect3(database.eval("temp2", (row) => $3.array($3.number(row.time)), { num: 193 })).to.eventually.deep.equal([43200 + date.getTimezoneOffset() * 60]);
      await expect3(database.eval("temp2", (row) => $3.min($3.number(row.timestamp)))).to.eventually.deep.equal(0);
    });
    it("math functions", async () => {
      const table = await setup2(database, "temp2", barTable);
      table[0].double = 123.45;
      table[0].num = 6;
      await database.set("temp2", table[0].id, { double: table[0].double, num: table[0].num });
      await expect3(database.eval("temp2", (row) => $3.max($3.abs($3.sub(0, row.double))), table[0].id)).to.eventually.deep.eq(table[0].double);
      await expect3(database.eval("temp2", (row) => $3.max($3.mod(row.double, row.num)), table[0].id)).to.eventually.deep.eq(table[0].double % table[0].num);
      await expect3(database.eval("temp2", (row) => $3.max($3.ceil(row.double)), table[0].id)).to.eventually.deep.eq(Math.ceil(table[0].double));
      await expect3(database.eval("temp2", (row) => $3.max($3.floor(row.double)), table[0].id)).to.eventually.deep.eq(Math.floor(table[0].double));
      await expect3(database.eval("temp2", (row) => $3.max($3.round(row.double)), table[0].id)).to.eventually.deep.eq(Math.round(table[0].double));
      await expect3(database.eval("temp2", (row) => $3.max($3.exp(row.double)), table[0].id)).to.eventually.deep.eq(Math.exp(table[0].double));
      await expect3(database.eval("temp2", (row) => $3.max($3.log(row.double)), table[0].id)).to.eventually.deep.eq(Math.log(table[0].double));
      await expect3(database.eval("temp2", (row) => $3.max($3.floor($3.log(row.double, 3))), table[0].id)).to.eventually.deep.eq(Math.floor(Math.log(table[0].double) / Math.log(3)));
      await expect3(database.eval("temp2", (row) => $3.max($3.floor($3.pow(row.double, row.num))), table[0].id)).to.eventually.deep.eq(Math.floor(Math.pow(table[0].double, table[0].num)));
    });
    it("$.random", async () => {
      await setup2(database, "temp2", barTable);
      await expect3(database.eval("temp2", (row) => $3.max($3.random()))).to.eventually.gt(0).lt(1);
    });
  }, "Misc");
  OrmOperations2.index = /* @__PURE__ */ __name(function Index(database) {
    it("basic support", async () => {
      const driver = Object.values(database.drivers)[0];
      const index2 = {
        unique: false,
        keys: {
          num: "asc",
          timestamp: "asc"
        }
      };
      await driver.createIndex("temp2", index2);
      let indexes = await driver.getIndexes("temp2");
      let added = indexes.find((ind) => deepEqual(omit2(ind, ["name"]), index2));
      expect3(added).to.not.be.undefined;
      await driver.dropIndex("temp2", added.name);
      indexes = await driver.getIndexes("temp2");
      added = indexes.find((ind) => deepEqual(omit2(ind, ["name"]), index2));
      expect3(added).to.be.undefined;
    });
    it("named", async () => {
      const driver = Object.values(database.drivers)[0];
      const index2 = {
        name: "index_unique:temp2:num_asc+timestamp_asc",
        unique: true,
        keys: {
          num: "asc",
          timestamp: "asc"
        }
      };
      await driver.createIndex("temp2", index2);
      let indexes = await driver.getIndexes("temp2");
      let added = indexes.find((ind) => deepEqual(ind, index2));
      expect3(added).to.not.be.undefined;
      await driver.dropIndex("temp2", added.name);
      indexes = await driver.getIndexes("temp2");
      added = indexes.find((ind) => deepEqual(ind, index2));
      expect3(added).to.be.undefined;
    });
    it("extend", async () => {
      const driver = Object.values(database.drivers)[0];
      const index2 = {
        unique: false,
        keys: {
          text: "asc"
        }
      };
      const indexes = await driver.getIndexes("temp2");
      const existed = indexes.find((ind) => deepEqual(omit2(ind, ["name"]), index2));
      expect3(existed).to.not.be.undefined;
    });
  }, "Index");
  OrmOperations2.drop = /* @__PURE__ */ __name(function Drop(database) {
    it("make coverage happy", async () => {
      await expect3(database.drop("unknown")).to.be.rejected;
    });
  }, "Drop");
  function subquery(database) {
    it("set query", async () => {
      await setup2(database, "temp2", barTable);
      await database.set("temp2", (row) => $3.eq(row.text, database.select("temp2", (r) => $3.eq(r.id, 2)).evaluate((r) => $3.max(r.text))), { text: "ok" });
      await expect3(database.get("temp2", 2)).to.eventually.have.shape([{ text: "ok" }]);
    });
    it("set update", async () => {
      const table = await setup2(database, "temp2", barTable);
      await database.set("temp2", 1, (row) => ({ text: database.select("temp2", (r) => $3.eq(r.id, $3.add(1, row.id))).evaluate((r) => $3.max(r.text)) }));
      await expect3(database.get("temp2", 1)).to.eventually.have.shape([{ text: table[1].text }]);
    });
  }
  OrmOperations2.subquery = subquery;
  __name(subquery, "subquery");
})(OrmOperations || (OrmOperations = {}));
var update_default = OrmOperations;

// src/object.ts
import { $ as $4 } from "minato";
import { expect as expect4 } from "chai";
function ObjectOperations(database) {
  database.extend("object", {
    "id": "string",
    "meta.a": { type: "string", initial: "666" },
    "meta.embed": { type: "json", initial: { c: "world" } }
  });
}
__name(ObjectOperations, "ObjectOperations");
((ObjectOperations2) => {
  async function setup2(database) {
    await database.remove("object", {});
    const result = [];
    result.push(await database.create("object", { id: "0", meta: { a: "233", embed: { b: 2, c: "hello" } } }));
    result.push(await database.create("object", { id: "1" }));
    expect4(result).to.have.length(2);
    return result;
  }
  __name(setup2, "setup");
  ObjectOperations2.create = /* @__PURE__ */ __name(function Create(database) {
    it("initial value", async () => {
      const table = await setup2(database);
      table.push(await database.create("object", { id: "2", meta: { embed: { b: 999 } } }));
      expect4(table[table.length - 1]).to.deep.equal({
        id: "2",
        meta: { a: "666", embed: { b: 999 } }
      });
      await expect4(database.get("object", {})).to.eventually.deep.equal(table);
    });
  }, "Create");
  ObjectOperations2.get = /* @__PURE__ */ __name(function Get(database) {
    it("field extraction", async () => {
      await setup2(database);
      const table = await database.get("object", {}, ["meta"]);
      expect4(table).to.deep.equal([
        { meta: { a: "233", embed: { b: 2, c: "hello" } } },
        { meta: { a: "666", embed: { c: "world" } } }
      ]);
    });
    it("selection", async () => {
      await setup2(database);
      await expect4(database.select("object", "0").project({ x: /* @__PURE__ */ __name((row) => row.meta.embed.c, "x") }).execute()).to.eventually.deep.equal([{ x: "hello" }]);
    });
  }, "Get");
  ObjectOperations2.upsert = /* @__PURE__ */ __name(function Upsert(database) {
    it("object literal", async () => {
      const table = await setup2(database);
      table[0].meta = { a: "233", embed: { b: 114 } };
      table[1].meta = { a: "1", embed: { b: 514, c: "world" } };
      table.push({ id: "2", meta: { a: "666", embed: { b: 1919 } } });
      table.push({ id: "3", meta: { a: "foo", embed: { b: 810, c: "world" } } });
      await expect4(database.upsert("object", (row) => [
        { id: "0", meta: { embed: { b: 114 } } },
        { id: "1", meta: { a: row.id, "embed.b": $4.add(500, 14) } },
        { id: "2", meta: { embed: { b: 1919 } } },
        { id: "3", meta: { a: "foo", "embed.b": 810 } }
      ])).eventually.fulfilled;
      await expect4(database.get("object", {})).to.eventually.deep.equal(table);
    });
    it("nested property", async () => {
      const table = await setup2(database);
      table[0].meta = { a: "0", embed: { b: 114, c: "hello" } };
      table[1].meta = { a: "1", embed: { b: 514 } };
      table.push({ id: "2", meta: { a: "2", embed: { b: 1919, c: "world" } } });
      table.push({ id: "3", meta: { a: "3", embed: { b: 810 } } });
      await expect4(database.upsert("object", (row) => [
        { id: "0", "meta.a": row.id, "meta.embed.b": 114 },
        { id: "1", "meta.a": row.id, "meta.embed": { b: 514 } },
        { id: "2", "meta.a": row.id, "meta.embed.b": $4.multiply(19, 101) },
        { id: "3", "meta.a": row.id, "meta.embed": { b: 810 } }
      ])).eventually.fulfilled;
      await expect4(database.get("object", {})).to.eventually.deep.equal(table);
    });
    it("empty object override", async () => {
      const table = await setup2(database);
      table[0].meta.embed = {};
      await database.upsert("object", [{ id: "0", meta: { embed: {} } }]);
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
    it("expressions w/ json object", async () => {
      const table = await setup2(database);
      table[0].meta.a = table[0].meta.embed.c + "a";
      table[1].meta.embed.b = 1;
      await database.upsert("object", (row) => [
        { id: "0", meta: { a: $4.concat(row.meta.embed.c, "a") } },
        { id: "1", "meta.embed.b": $4.add($4.ifNull(row.meta.embed.b, 0), 1) }
      ]);
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
    it("expressions w/o json object", async () => {
      const table = await setup2(database);
      table[0].meta.a = table[0].meta.a + "a";
      await database.upsert("object", (row) => [{ id: "0", meta: { a: $4.concat(row.meta.a, "a") } }]);
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
  }, "Upsert");
  ObjectOperations2.modify = /* @__PURE__ */ __name(function Modify(database) {
    it("object literal", async () => {
      const table = await setup2(database);
      table[0].meta = { a: "0", embed: { b: 114 } };
      table[1].meta = { a: "1", embed: { b: 514, c: "world" } };
      await expect4(database.set("object", "0", (row) => ({
        meta: { a: row.id, embed: { b: 114 } }
      }))).eventually.fulfilled;
      await expect4(database.set("object", "1", (row) => ({
        meta: { a: row.id, "embed.b": 514 }
      }))).eventually.fulfilled;
      await expect4(database.get("object", {})).to.eventually.deep.equal(table);
    });
    it("using subquery", async () => {
      const table = await setup2(database);
      table[0].meta = { a: "0", embed: { b: 114 } };
      table[1].meta = { a: "1", embed: { b: 514, c: "world" } };
      await expect4(
        database.set(
          "object",
          (row) => $4.eq(row.id, database.select("object", "0").evaluate((r) => $4.max(r.id))),
          (row) => ({
            meta: { a: row.id, embed: { b: 114 } }
          })
        )
      ).eventually.fulfilled;
      await expect4(database.set(
        "object",
        (row) => $4.eq(row.id, database.select("object", "1").evaluate((r) => $4.max(r.id))),
        (row) => ({
          meta: { a: row.id, "embed.b": 514 }
        })
      )).eventually.fulfilled;
      await expect4(database.get("object", {})).to.eventually.deep.equal(table);
    });
    it("nested property", async () => {
      const table = await setup2(database);
      table[0].meta = { a: "0", embed: { b: 114, c: "hello" } };
      table[1].meta = { a: "1", embed: { b: 514 } };
      await expect4(database.set("object", "0", (row) => ({
        "meta.a": row.id,
        "meta.embed.b": 114
      }))).eventually.fulfilled;
      await expect4(database.set("object", "1", (row) => ({
        "meta.a": row.id,
        "meta.embed": { b: 514 }
      }))).eventually.fulfilled;
      await expect4(database.get("object", {})).to.eventually.deep.equal(table);
    });
    it("empty object override", async () => {
      const table = await setup2(database);
      table[0].meta.embed = {};
      await database.set("object", { id: "0" }, { meta: { embed: {} } });
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
    it("expressions w/ json object", async () => {
      const table = await setup2(database);
      table[0].meta.a = table[0].meta.embed.c + "a";
      await database.set("object", { id: "0" }, (row) => ({ meta: { a: $4.concat(row.meta.embed.c, "a") } }));
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
    it("expressions w/o json object", async () => {
      const table = await setup2(database);
      table[0].meta.a = table[0].meta.a + "a";
      await database.set("object", { id: "0" }, (row) => ({ meta: { a: $4.concat(row.meta.a, "a") } }));
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
    it("object in json", async () => {
      const table = await setup2(database);
      table[1].meta.embed.d = {};
      await database.set("object", { id: "1" }, { "meta.embed.d": {} });
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
      table[0].meta.embed.d = { foo: 1, bar: { a: 3, b: 4 } };
      await database.set("object", { id: "0" }, { "meta.embed.d": { foo: 1, bar: { a: 3, b: 4 } } });
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
    it("nested object in json", async () => {
      const table = await setup2(database);
      table[0].meta.embed.d = { foo: 2, bar: { a: 1 } };
      await database.set("object", { id: "0" }, { "meta.embed.d.bar": { a: 1 }, "meta.embed.d.foo": 2 });
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
    it("$.number in json", async () => {
      const table = await setup2(database);
      table[0].meta.embed.b = 233;
      table[1].meta.embed.b = 666;
      await database.set("object", {}, (row) => ({ "meta.embed.b": $4.number(row.meta.a) }));
      await expect4(database.get("object", {})).to.eventually.have.deep.members(table);
    });
  }, "Modify");
  ObjectOperations2.misc = /* @__PURE__ */ __name(function Misc(database) {
    it("join selections with dot fields", async () => {
      await setup2(database);
      await database.set("object", "1", { "meta.embed.b": 3 });
      await expect4(database.join({
        x: database.select("object").where((row) => $4.lt(row.meta.embed.b, 100)),
        y: database.select("object").where((row) => $4.lt(row.meta.embed.b, 100))
      }).execute((row) => $4.sum(1))).to.eventually.deep.equal(4);
    });
    it("switch model in object query", async () => {
      const table = await setup2(database);
      await expect4(database.select("object", {
        "meta.a": "666"
      }).project({
        t: "meta"
      }).execute()).to.eventually.have.deep.members([{ t: table[1].meta }]);
    });
    it("accumulate project", async () => {
      const table = await setup2(database);
      await expect4(database.select("object", {
        "meta.a": "666"
      }).project((row) => ({
        t: "meta",
        t2: row.meta.embed.c,
        t3: $4.concat(row.meta.a, "my"),
        ...row.meta,
        ...row
      })).execute()).to.eventually.have.deep.members([{
        t: table[1].meta,
        t2: "world",
        t3: "666my",
        ...table[1].meta,
        ...table[1]
      }]);
    });
  }, "Misc");
})(ObjectOperations || (ObjectOperations = {}));
var object_default = ObjectOperations;

// src/migration.ts
import { expect as expect5 } from "chai";
import { deepEqual as deepEqual2, noop, omit as omit3 } from "cosmokit";
function MigrationTests(database) {
  beforeEach(async () => {
    await database.drop("qux").catch(noop);
  });
  it("alter field", async () => {
    Reflect.deleteProperty(database.tables, "qux");
    database.extend("qux", {
      id: "unsigned",
      text: "string(64)"
    });
    await database.upsert("qux", [
      { id: 1, text: "foo" },
      { id: 2, text: "bar" }
    ]);
    await expect5(database.get("qux", {})).to.eventually.deep.equal([
      { id: 1, text: "foo" },
      { id: 2, text: "bar" }
    ]);
    database.extend("qux", {
      id: "unsigned",
      text: "string(64)",
      number: "unsigned"
    });
    await database.upsert("qux", [
      { id: 1, text: "foo", number: 100 },
      { id: 2, text: "bar", number: 200 }
    ]);
    await expect5(database.get("qux", {})).to.eventually.deep.equal([
      { id: 1, text: "foo", number: 100 },
      { id: 2, text: "bar", number: 200 }
    ]);
    Reflect.deleteProperty(database.tables, "qux");
    database.extend("qux", {
      id: "unsigned",
      text: "string(64)"
    });
    await expect5(database.get("qux", {})).to.eventually.deep.equal([
      { id: 1, text: "foo" },
      { id: 2, text: "bar" }
    ]);
  });
  it("should migrate field", async () => {
    Reflect.deleteProperty(database.tables, "qux");
    database.extend("qux", {
      id: "unsigned",
      text: "string(64)",
      number: "unsigned",
      flag: "boolean"
    }, {
      unique: ["number"]
    });
    await database.upsert("qux", [
      { id: 1, text: "foo", number: 100, flag: true },
      { id: 2, text: "bar", number: 200, flag: false }
    ]);
    Reflect.deleteProperty(database.tables, "qux");
    database.extend("qux", {
      id: "unsigned",
      value: { type: "unsigned", legacy: ["number"] },
      text: { type: "string", length: 256, legacy: ["string"] }
    }, {
      unique: ["value"]
    });
    database.extend("qux2", {
      id: "unsigned",
      flag: "boolean"
    });
    database.migrate("qux", {
      flag: "boolean"
    }, async (database2) => {
      const data = await database2.get("qux", {}, ["id", "flag"]);
      await database2.upsert("qux2", data);
    });
    await expect5(database.get("qux", {})).to.eventually.deep.equal([
      { id: 1, text: "foo", value: 100 },
      { id: 2, text: "bar", value: 200 }
    ]);
    await expect5(database.get("qux2", {})).to.eventually.deep.equal([
      { id: 1, flag: true },
      { id: 2, flag: false }
    ]);
  });
  it("set json initial", async () => {
    Reflect.deleteProperty(database.tables, "qux");
    database.extend("qux", {
      id: "unsigned",
      text: "string(64)"
    });
    await database.upsert("qux", [
      { id: 1, text: "foo" },
      { id: 2, text: "bar" }
    ]);
    await expect5(database.get("qux", {})).to.eventually.deep.equal([
      { id: 1, text: "foo" },
      { id: 2, text: "bar" }
    ]);
    database.extend("qux", {
      obj: {
        type: "json",
        initial: {},
        nullable: false
      }
    });
    await expect5(database.get("qux", {})).to.eventually.deep.equal([
      { id: 1, text: "foo", obj: {} },
      { id: 2, text: "bar", obj: {} }
    ]);
  });
  it("indexes", async () => {
    const driver = Object.values(database.drivers)[0];
    Reflect.deleteProperty(database.tables, "qux");
    database.extend("qux", {
      id: "unsigned",
      number: "unsigned"
    });
    await database.upsert("qux", [
      { id: 1, number: 1 },
      { id: 2, number: 2 }
    ]);
    await expect5(database.get("qux", {})).to.eventually.have.deep.members([
      { id: 1, number: 1 },
      { id: 2, number: 2 }
    ]);
    database.extend("qux", {
      id: "unsigned",
      number: "unsigned"
    }, {
      indexes: ["number"]
    });
    await expect5(database.get("qux", {})).to.eventually.have.deep.members([
      { id: 1, number: 1 },
      { id: 2, number: 2 }
    ]);
    let indexes = await driver.getIndexes("qux");
    expect5(indexes.find((ind) => deepEqual2(omit3(ind, ["name"]), {
      unique: false,
      keys: {
        number: "asc"
      }
    }))).to.not.be.undefined;
    Reflect.deleteProperty(database.tables, "qux");
    database.extend("qux", {
      id: "unsigned",
      value: {
        type: "unsigned",
        legacy: ["number"]
      }
    }, {
      indexes: ["value"]
    });
    await expect5(database.get("qux", {})).to.eventually.have.deep.members([
      { id: 1, value: 1 },
      { id: 2, value: 2 }
    ]);
    indexes = await driver.getIndexes("qux");
    expect5(indexes.find((ind) => deepEqual2(omit3(ind, ["name"]), {
      unique: false,
      keys: {
        value: "asc"
      }
    }))).to.not.be.undefined;
    database.extend("qux", {}, {
      indexes: [{
        name: "named-index",
        keys: {
          id: "asc",
          value: "asc"
        }
      }]
    });
    await expect5(database.get("qux", {})).to.eventually.have.deep.members([
      { id: 1, value: 1 },
      { id: 2, value: 2 }
    ]);
    indexes = await driver.getIndexes("qux");
    expect5(indexes.find((ind) => deepEqual2(ind, {
      name: "named-index",
      unique: false,
      keys: {
        id: "asc",
        value: "asc"
      }
    }))).to.not.be.undefined;
    database.extend("qux", {
      text: "string"
    }, {
      indexes: [{
        name: "named-index",
        keys: {
          text: "asc",
          value: "asc"
        }
      }]
    });
    await expect5(database.get("qux", {})).to.eventually.have.deep.members([
      { id: 1, value: 1, text: "" },
      { id: 2, value: 2, text: "" }
    ]);
    indexes = await driver.getIndexes("qux");
    expect5(indexes.find((ind) => deepEqual2(ind, {
      name: "named-index",
      unique: false,
      keys: {
        text: "asc",
        value: "asc"
      }
    }))).to.not.be.undefined;
  });
}
__name(MigrationTests, "MigrationTests");
var migration_default = MigrationTests;

// src/selection.ts
import { $ as $5 } from "minato";
import { expect as expect6 } from "chai";

// src/utils.ts
import { mapValues as mapValues2 } from "cosmokit";
async function setup(database, name, table) {
  await database.remove(name, {});
  const result = [];
  for (const item of table) {
    const data = mapValues2(item, (v, k) => v && database.tables[name].fields[k]?.relation ? { $literal: v } : v);
    result.push(await database.create(name, data));
  }
  return result;
}
__name(setup, "setup");

// src/selection.ts
function SelectionTests(database) {
  database.extend("foo", {
    id: "unsigned",
    value: "integer"
  });
  database.migrate("foo", { deprecated: "unsigned" }, async () => {
  });
  database.extend("bar", {
    id: "unsigned",
    uid: "unsigned",
    pid: "unsigned",
    value: "integer"
  }, {
    autoInc: true
  });
  before(async () => {
    await setup(database, "foo", [
      { id: 1, value: 0 },
      { id: 2, value: 2 },
      { id: 3, value: 2 }
    ]);
    await setup(database, "bar", [
      { uid: 1, pid: 1, value: 0 },
      { uid: 1, pid: 1, value: 1 },
      { uid: 1, pid: 2, value: 0 },
      { uid: 1, pid: 3, value: 1 },
      { uid: 2, pid: 1, value: 1 },
      { uid: 2, pid: 1, value: 1 }
    ]);
  });
}
__name(SelectionTests, "SelectionTests");
((SelectionTests2) => {
  function sort(database) {
    it("shorthand", async () => {
      await expect6(database.get("foo", {}, {
        sort: { id: "desc", value: "asc" }
      })).to.eventually.deep.equal([
        { id: 3, value: 2 },
        { id: 2, value: 2 },
        { id: 1, value: 0 }
      ]);
      await expect6(database.get("foo", {}, {
        sort: { value: "asc", id: "desc" }
      })).to.eventually.deep.equal([
        { id: 1, value: 0 },
        { id: 3, value: 2 },
        { id: 2, value: 2 }
      ]);
    });
    it("callback", async () => {
      await expect6(
        database.select("foo").orderBy((row) => $5.subtract(row.id, row.value)).execute()
      ).to.eventually.deep.equal([
        { id: 2, value: 2 },
        { id: 1, value: 0 },
        { id: 3, value: 2 }
      ]);
    });
    it("limit", async () => {
      await expect6(
        database.select("foo").orderBy("id", "desc").limit(1).offset(2).execute()
      ).to.eventually.deep.equal([
        { id: 1, value: 0 }
      ]);
    });
    it("random", async () => {
      await expect6(database.select("foo").orderBy((row) => $5.random()).execute(["id"])).to.eventually.have.deep.members([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]);
    });
  }
  SelectionTests2.sort = sort;
  __name(sort, "sort");
  function project(database) {
    it("shorthand", async () => {
      await expect6(database.get("foo", {}, ["id"])).to.eventually.deep.equal([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]);
      await expect6(database.select("foo", (row) => $5.eq(row.id, 1)).orderBy("id").execute(["id"])).to.eventually.deep.equal([
        { id: 1 }
      ]);
    });
    it("callback", async () => {
      await expect6(
        database.select("foo").project({
          id: /* @__PURE__ */ __name((row) => $5.add($5.multiply(row.id, row.id), 1), "id")
        }).execute()
      ).to.eventually.deep.equal([
        { id: 2 },
        { id: 5 },
        { id: 10 }
      ]);
    });
    it("chaining", async () => {
      await expect6(
        database.select("foo").project({
          id: /* @__PURE__ */ __name((row) => $5.multiply(row.id, row.id), "id")
        }).project({
          id: /* @__PURE__ */ __name((row) => $5.add(row.id, 1), "id")
        }).execute()
      ).to.eventually.deep.equal([
        { id: 2 },
        { id: 5 },
        { id: 10 }
      ]);
    });
    it("aggregate", async () => {
      await expect6(
        database.select("foo").groupBy({}, {
          count: /* @__PURE__ */ __name((row) => $5.count(row.id), "count"),
          size: /* @__PURE__ */ __name((row) => $5.length(row.id), "size"),
          max: /* @__PURE__ */ __name((row) => $5.max(row.id), "max"),
          min: /* @__PURE__ */ __name((row) => $5.min(row.id), "min"),
          avg: /* @__PURE__ */ __name((row) => $5.avg(row.id), "avg")
        }).execute()
      ).to.eventually.deep.equal([
        { avg: 2, count: 3, max: 3, min: 1, size: 3 }
      ]);
    });
  }
  SelectionTests2.project = project;
  __name(project, "project");
  function aggregate(database) {
    it("shorthand", async () => {
      await expect6(database.eval("foo", (row) => $5.sum(row.id))).to.eventually.equal(6);
      await expect6(database.eval("foo", (row) => $5.count(row.value))).to.eventually.equal(2);
      await expect6(database.eval("foo", (row) => $5.count(row.value), { id: -1 })).to.eventually.equal(0);
    });
    it("inner expressions", async () => {
      await expect6(
        database.select("foo").execute((row) => $5.avg($5.multiply($5.subtract(row.id, 1), row.value)))
      ).to.eventually.equal(2);
    });
    it("outer expressions", async () => {
      await expect6(
        database.select("foo").execute((row) => $5.subtract($5.sum(row.id), $5.count(row.value)))
      ).to.eventually.equal(4);
    });
    it("chaining", async () => {
      await expect6(
        database.select("foo").project({
          value: /* @__PURE__ */ __name((row) => $5.multiply($5.subtract(row.id, 1), row.value), "value")
        }).execute((row) => $5.avg(row.value))
      ).to.eventually.equal(2);
    });
  }
  SelectionTests2.aggregate = aggregate;
  __name(aggregate, "aggregate");
  function group(database) {
    it("multiple", async () => {
      await expect6(
        database.select("foo").groupBy(["id", "value"]).orderBy("id").execute()
      ).to.eventually.deep.equal([
        { id: 1, value: 0 },
        { id: 2, value: 2 },
        { id: 3, value: 2 }
      ]);
    });
    it("callback", async () => {
      await expect6(
        database.select("foo").groupBy({
          key: /* @__PURE__ */ __name((row) => $5.subtract(row.id, row.value), "key")
        }).orderBy("key").execute()
      ).to.eventually.deep.equal([
        { key: 0 },
        { key: 1 }
      ]);
    });
    it("extra", async () => {
      await expect6(
        database.select("foo").groupBy("value", {
          sum: /* @__PURE__ */ __name((row) => $5.sum(row.id), "sum"),
          count: /* @__PURE__ */ __name((row) => $5.count(row.id), "count")
        }).orderBy("value").execute()
      ).to.eventually.deep.equal([
        { value: 0, sum: 1, count: 1 },
        { value: 2, sum: 5, count: 2 }
      ]);
      await expect6(
        database.select("foo").groupBy("value", (row) => ({
          sum: $5.sum(row.id),
          count: $5.count(row.id)
        })).orderBy("value").execute()
      ).to.eventually.deep.equal([
        { value: 0, sum: 1, count: 1 },
        { value: 2, sum: 5, count: 2 }
      ]);
    });
    it("having", async () => {
      await expect6(
        database.select("foo").having((row) => $5.gt($5.sum(row.id), 1)).groupBy("value").execute()
      ).to.eventually.deep.equal([
        { value: 2 }
      ]);
    });
    it("chaining", async () => {
      await expect6(
        database.select("bar").groupBy(["uid", "pid"], {
          submit: /* @__PURE__ */ __name((row) => $5.sum(1), "submit"),
          accept: /* @__PURE__ */ __name((row) => $5.sum(row.value), "accept")
        }).groupBy(["uid"], {
          submit: /* @__PURE__ */ __name((row) => $5.sum(row.submit), "submit"),
          accept: /* @__PURE__ */ __name((row) => $5.sum($5.if($5.gt(row.accept, 0), 1, 0)), "accept")
        }).orderBy("uid").execute()
      ).to.eventually.deep.equal([
        { uid: 1, submit: 4, accept: 2 },
        { uid: 2, submit: 2, accept: 1 }
      ]);
    });
  }
  SelectionTests2.group = group;
  __name(group, "group");
  function join(database) {
    it("inner join", async () => {
      await expect6(
        database.join(["foo", "bar"]).execute()
      ).to.eventually.have.length(18);
      await expect6(
        database.join(["foo", "bar"], (foo, bar) => $5.eq(foo.value, bar.value)).execute()
      ).to.eventually.have.length(2);
      await expect6(
        database.select("foo").join("bar", database.select("bar"), (foo, bar) => $5.eq(foo.value, bar.value)).execute()
      ).to.eventually.have.length(2);
    });
    it("left join", async () => {
      await expect6(
        database.join(["foo", "bar"], (foo, bar) => $5.eq(foo.value, bar.value), [false, true]).execute()
      ).to.eventually.have.shape([
        {
          foo: { value: 0, id: 1 },
          bar: { uid: 1, pid: 1, value: 0, id: 1 }
        },
        {
          foo: { value: 0, id: 1 },
          bar: { uid: 1, pid: 2, value: 0, id: 3 }
        },
        { foo: { value: 2, id: 2 }, bar: {} },
        { foo: { value: 2, id: 3 }, bar: {} }
      ]);
      await expect6(
        database.join(["foo", "bar"], (foo, bar) => $5.eq(foo.value, bar.value), [true, false]).execute()
      ).to.eventually.have.shape([
        {
          bar: { uid: 1, pid: 1, value: 0, id: 1 },
          foo: { value: 0, id: 1 }
        },
        { bar: { uid: 1, pid: 1, value: 1, id: 2 }, foo: {} },
        {
          bar: { uid: 1, pid: 2, value: 0, id: 3 },
          foo: { value: 0, id: 1 }
        },
        { bar: { uid: 1, pid: 3, value: 1, id: 4 }, foo: {} },
        { bar: { uid: 2, pid: 1, value: 1, id: 5 }, foo: {} },
        { bar: { uid: 2, pid: 1, value: 1, id: 6 }, foo: {} }
      ]);
      await expect6(
        database.select("foo").join("bar", database.select("bar"), (foo, bar) => $5.eq(foo.value, bar.value), true).execute()
      ).to.eventually.have.shape([
        {
          value: 0,
          id: 1,
          bar: { uid: 1, pid: 1, value: 0, id: 1 }
        },
        {
          value: 0,
          id: 1,
          bar: { uid: 1, pid: 2, value: 0, id: 3 }
        },
        { value: 2, id: 2 },
        { value: 2, id: 3 }
      ]);
      await expect6(
        database.select("bar").join("foo", database.select("foo"), (bar, foo) => $5.eq(foo.value, bar.value), true).execute()
      ).to.eventually.have.shape([
        {
          uid: 1,
          pid: 1,
          value: 0,
          id: 1,
          foo: { value: 0, id: 1 }
        },
        { uid: 1, pid: 1, value: 1, id: 2 },
        {
          uid: 1,
          pid: 2,
          value: 0,
          id: 3,
          foo: { value: 0, id: 1 }
        },
        { uid: 1, pid: 3, value: 1, id: 4 },
        { uid: 2, pid: 1, value: 1, id: 5 },
        { uid: 2, pid: 1, value: 1, id: 6 }
      ]);
    });
    it("duplicate", async () => {
      await expect6(
        database.select("foo").project(["value"]).join("bar", database.select("bar"), (foo, bar) => $5.eq(foo.value, bar.uid)).execute()
      ).to.eventually.have.length(4);
    });
    it("left join", async () => {
      await expect6(
        database.join(["foo", "bar"], (foo, bar) => $5.eq(foo.value, bar.value), [false, true]).execute()
      ).to.eventually.have.shape([
        {
          foo: { value: 0, id: 1 },
          bar: { uid: 1, pid: 1, value: 0, id: 1 }
        },
        {
          foo: { value: 0, id: 1 },
          bar: { uid: 1, pid: 2, value: 0, id: 3 }
        },
        { foo: { value: 2, id: 2 }, bar: {} },
        { foo: { value: 2, id: 3 }, bar: {} }
      ]);
      await expect6(
        database.join(["foo", "bar"], (foo, bar) => $5.eq(foo.value, bar.value), [true, false]).execute()
      ).to.eventually.have.shape([
        {
          bar: { uid: 1, pid: 1, value: 0, id: 1 },
          foo: { value: 0, id: 1 }
        },
        { bar: { uid: 1, pid: 1, value: 1, id: 2 }, foo: {} },
        {
          bar: { uid: 1, pid: 2, value: 0, id: 3 },
          foo: { value: 0, id: 1 }
        },
        { bar: { uid: 1, pid: 3, value: 1, id: 4 }, foo: {} },
        { bar: { uid: 2, pid: 1, value: 1, id: 5 }, foo: {} },
        { bar: { uid: 2, pid: 1, value: 1, id: 6 }, foo: {} }
      ]);
    });
    it("group", async () => {
      await expect6(database.join(["foo", "bar"], (foo, bar) => $5.eq(foo.id, bar.pid)).groupBy("foo", { count: /* @__PURE__ */ __name((row) => $5.sum(row.bar.uid), "count") }).orderBy((row) => row.foo.id).execute()).to.eventually.deep.equal([
        { foo: { id: 1, value: 0 }, count: 6 },
        { foo: { id: 2, value: 2 }, count: 1 },
        { foo: { id: 3, value: 2 }, count: 1 }
      ]);
    });
    it("selections", async () => {
      await expect6(
        database.join({
          all: "bar",
          index: database.select("bar").groupBy("uid", { id: /* @__PURE__ */ __name((row) => $5.max(row.id), "id") })
        }, ({ all, index }) => $5.eq(all.id, index.id)).execute(["all"])
      ).to.eventually.have.shape([
        { all: { id: 4, uid: 1, pid: 3, value: 1 } },
        { all: { id: 6, uid: 2, pid: 1, value: 1 } }
      ]);
      await expect6(
        database.join({
          all: "bar",
          index: database.select("bar").where((row) => $5.gt(row.id, 0))
        }, ({ all, index }) => $5.eq(all.id, index.id)).execute(["all"])
      ).to.eventually.have.length(6);
      await expect6(
        database.join({
          t1: database.select("bar").where((row) => $5.gt(row.pid, 1)),
          t2: database.select("bar").where((row) => $5.gt(row.uid, 1)),
          t3: database.select("bar").where((row) => $5.gt(row.id, 4))
        }, ({ t1, t2, t3 }) => $5.gt($5.add(t1.id, t2.id, t3.id), 14)).execute()
      ).to.eventually.have.length(4);
      await expect6(
        database.select("bar").where((row) => $5.gt(row.pid, 1)).join("t2", database.select("bar").where((row) => $5.gt(row.uid, 1))).join("t3", database.select("bar").where((row) => $5.gt(row.id, 4)), (self, t3) => $5.gt($5.add(self.id, self.t2.id, t3.id), 14)).execute()
      ).to.eventually.have.length(4);
    });
    it("aggregate", async () => {
      await expect6(
        database.join(["foo", "bar"]).execute((row) => $5.count(row.bar.id))
      ).to.eventually.equal(6);
      await expect6(
        database.join(["foo", "bar"]).where((row) => $5.gt(row.bar.id, 3)).execute((row) => $5.count(row.bar.id))
      ).to.eventually.equal(3);
      await expect6(
        database.join(["foo", "bar"]).where((row) => $5.gt(row.bar.id, 3)).orderBy((row) => row.bar.id).execute((row) => $5.count(row.bar.id))
      ).to.eventually.equal(3);
    });
  }
  SelectionTests2.join = join;
  __name(join, "join");
  function subquery(database) {
    it("select", async () => {
      await expect6(database.select("foo").project({
        x: /* @__PURE__ */ __name((r1) => database.select("foo", (r2) => $5.gt(r1.id, r2.id)).evaluate((r2) => $5.count(r2.id)), "x")
      }).orderBy("x").execute()).to.eventually.deep.equal([
        { x: 0 },
        { x: 1 },
        { x: 2 }
      ]);
    });
    it("where", async () => {
      await expect6(database.get("foo", (row) => $5.in(
        row.id,
        database.select("foo").project({ x: /* @__PURE__ */ __name((row2) => $5.add(row2.id, 1), "x") }).evaluate("x")
      ))).to.eventually.deep.equal([
        { id: 2, value: 2 },
        { id: 3, value: 2 }
      ]);
      await expect6(database.get("foo", (row) => $5.in(
        [row.id, row.id],
        database.select("foo").project({ x: /* @__PURE__ */ __name((row2) => $5.add(row2.id, 1), "x") }).evaluate(["x", "x"])
      ))).to.eventually.deep.equal([
        { id: 2, value: 2 },
        { id: 3, value: 2 }
      ]);
      await expect6(database.get("foo", (row) => $5.in(
        [row.id, row.id],
        [[2, 2], [3, 3]]
      ))).to.eventually.deep.equal([
        { id: 2, value: 2 },
        { id: 3, value: 2 }
      ]);
    });
    it("from", async () => {
      const sel = database.select("foo").project({
        x: /* @__PURE__ */ __name((row) => $5.add(row.id, row.value), "x"),
        id: "id"
      });
      await expect6(database.select(sel).execute((row) => $5.sum(row.x))).to.eventually.equal(10);
    });
    it("select join", async () => {
      await expect6(database.select("foo").project({
        x: /* @__PURE__ */ __name((r) => database.select("bar").where((row) => $5.and($5.gte(row.pid, r.id), $5.lt(row.uid, r.id))).evaluate((row) => $5.count(row.id)), "x")
      }).execute()).to.eventually.deep.equal([
        { x: 0 },
        { x: 2 },
        { x: 1 }
      ]);
    });
    it("groupBy", async () => {
      const sel = database.select("bar").evaluate((row) => $5.count(row.id));
      await expect6(
        database.select("foo").groupBy({
          key: /* @__PURE__ */ __name((row) => $5.subtract(sel, row.value), "key")
        }).orderBy("key").execute()
      ).to.eventually.deep.equal([
        { key: 4 },
        { key: 6 }
      ]);
    });
    it("having", async () => {
      const sel = database.select("bar").evaluate((row) => $5.subtract($5.count(row.id), 5));
      await expect6(
        database.select("foo").having((row) => $5.gt($5.sum(row.id), sel)).groupBy("value").execute()
      ).to.eventually.deep.equal([
        { value: 2 }
      ]);
    });
    it("nested subquery", async () => {
      const one = database.select("bar").evaluate((row) => $5.subtract($5.count(row.id), 5));
      const sel = /* @__PURE__ */ __name((x) => database.select("bar").evaluate((row) => $5.add(one, $5.subtract($5.count(row.id), x), 0)), "sel");
      await expect6(
        database.select("foo").project({
          t: /* @__PURE__ */ __name((row) => row.id, "t"),
          x: /* @__PURE__ */ __name((row) => sel(row.id), "x")
        }).execute()
      ).to.eventually.deep.equal([
        { t: 1, x: 6 },
        { t: 2, x: 5 },
        { t: 3, x: 4 }
      ]);
    });
    it("inner join", async () => {
      const one = database.select("bar").evaluate((row) => $5.subtract($5.count(row.id), 5));
      const sel = /* @__PURE__ */ __name((x) => database.select("bar").where((row) => $5.eq(x, row.uid)).evaluate((row) => $5.count(row.id)), "sel");
      await expect6(
        database.join(["foo", "bar"], (foo, bar) => $5.gt(foo.value, one)).execute()
      ).to.eventually.have.length(12);
      await expect6(
        database.join(["foo", "bar"], (foo, bar) => $5.lt(foo.value, sel(foo.id))).execute()
      ).to.eventually.have.length(6);
    });
    it("selections", async () => {
      const w = /* @__PURE__ */ __name((x) => database.join(["bar", "foo"]).evaluate((row) => $5.add($5.count(row.bar.id), -6, x)), "w");
      await expect6(
        database.join({
          t1: database.select("bar").where((row) => $5.gt(w(row.pid), 1)),
          t2: database.select("bar").where((row) => $5.gt(row.uid, 1)),
          t3: database.select("bar").where((row) => $5.gt(row.id, w(4)))
        }, ({ t1, t2, t3 }) => $5.gt($5.add(t1.id, t2.id, w(t3.id)), 14)).project({
          val: /* @__PURE__ */ __name((row) => $5.add(row.t1.id, row.t2.id, w(row.t3.id)), "val")
        }).execute()
      ).to.eventually.have.length(4);
    });
    it("access from join", async () => {
      const w = /* @__PURE__ */ __name((x) => database.select("bar").evaluate((row) => $5.add($5.count(row.id), -6, x)), "w");
      await expect6(
        database.join(["foo", "bar"], (foo, bar) => $5.gt(foo.id, w(bar.pid))).execute()
      ).to.eventually.have.length(9);
    });
    it("join selection", async () => {
      await expect6(
        database.select(
          database.select("foo")
        ).execute()
      ).to.eventually.have.length(3);
      await expect6(
        database.join({
          foo1: database.select("foo"),
          foo2: database.select("foo")
        }).execute()
      ).to.eventually.have.length(9);
    });
    it("return array", async () => {
      await expect6(database.select("foo").project({
        x: /* @__PURE__ */ __name((r) => database.select("bar").where((row) => $5.and($5.gte(row.pid, r.id), $5.lt(row.uid, r.id))).evaluate("id"), "x")
      }).execute()).to.eventually.deep.equal([
        { x: [] },
        { x: [3, 4] },
        { x: [4] }
      ]);
    });
    it("return nested array", async () => {
      await expect6(database.select("foo").project({
        x: /* @__PURE__ */ __name((r) => database.select("bar").where((row) => $5.and($5.gte(row.pid, r.id), $5.lt(row.uid, r.id))).project({
          id: /* @__PURE__ */ __name((_) => database.select("foo").project({
            id: /* @__PURE__ */ __name((row) => $5.add(row.id, r.id), "id")
          }).evaluate("id"), "id")
        }).evaluate("id"), "x")
      }).execute()).to.eventually.deep.equal([
        { x: [] },
        { x: [[3, 4, 5], [3, 4, 5]] },
        { x: [[4, 5, 6]] }
      ]);
      await expect6(database.select("foo").project({
        x: /* @__PURE__ */ __name((r) => database.select("bar").where((row) => $5.and($5.gte(row.pid, r.id), $5.lt(row.uid, r.id))).project({
          id: /* @__PURE__ */ __name((_) => database.select("foo").project({
            id: /* @__PURE__ */ __name((row) => $5.add(row.id, r.id), "id")
          }).evaluate("id"), "id")
        }).evaluate("id"), "x")
      }).execute((row) => $5.array(row.x))).to.eventually.deep.equal([
        [],
        [[3, 4, 5], [3, 4, 5]],
        [[4, 5, 6]]
      ]);
    });
    it("return array of objects", async () => {
      await expect6(database.select("foo").project({
        x: /* @__PURE__ */ __name((r) => database.select("bar").where((row) => $5.and($5.gte(row.pid, r.id), $5.lt(row.uid, r.id))).evaluate(), "x")
      }).orderBy((row) => $5.length(row.x)).execute()).to.eventually.have.shape([
        { x: [] },
        { x: [{ id: 4 }] },
        { x: [{ id: 3 }, { id: 4 }] }
      ]);
    });
    it("return aggregate", async () => {
      await expect6(
        database.select("foo").project({ x: /* @__PURE__ */ __name((row) => database.select("bar", (r) => $5.eq(r.pid, row.id)).evaluate((r) => $5.max(r.value)), "x") }).execute()
      ).to.eventually.have.shape([
        { x: 1 },
        { x: 0 },
        { x: 1 }
      ]);
    });
  }
  SelectionTests2.subquery = subquery;
  __name(subquery, "subquery");
})(SelectionTests || (SelectionTests = {}));
var selection_default = SelectionTests;

// src/json.ts
import { $ as $6 } from "minato";
import { expect as expect7 } from "chai";
function JsonTests(database) {
  database.extend("foo", {
    id: "unsigned",
    value: "integer"
  });
  database.extend("bar", {
    id: "unsigned",
    uid: "unsigned",
    pid: "unsigned",
    value: "integer",
    obj: "json",
    s: "string",
    l: "list",
    la: {
      type: "array",
      inner: "string"
    }
  }, {
    autoInc: true
  });
  database.extend("baz", {
    id: "unsigned",
    nums: {
      type: "array",
      inner: "unsigned"
    }
  });
  database.extend("bax", {
    id: "unsigned",
    array: {
      type: "array",
      inner: {
        type: "object",
        inner: {
          text: "string"
        }
      }
    },
    object: {
      type: "object",
      inner: {
        num: "unsigned"
      }
    }
  });
  before(async () => {
    await setup(database, "foo", [
      { id: 1, value: 0 },
      { id: 2, value: 2 },
      { id: 3, value: 2 }
    ]);
    await setup(database, "bar", [
      { uid: 1, pid: 1, value: 0, obj: { x: 1, y: "a", z: "1", o: { a: 1, b: "1" } }, s: "1", l: ["1", "2"], la: ["a", "b"] },
      { uid: 1, pid: 1, value: 1, obj: { x: 2, y: "b", z: "2", o: { a: 2, b: "2" } }, s: "2", l: ["5", "3", "4"], la: ["b", "c"] },
      { uid: 1, pid: 2, value: 0, obj: { x: 3, y: "c", z: "3", o: { a: 3, b: "3" } }, s: "3", l: ["2"], la: ["c"] }
    ]);
    await setup(database, "baz", [
      { id: 1, nums: [4, 5, 6] },
      { id: 2, nums: [5, 6, 7] },
      { id: 3, nums: [7, 8] }
    ]);
  });
}
__name(JsonTests, "JsonTests");
((JsonTests2) => {
  const Bax = [{
    id: 1,
    array: [{ text: "foo" }]
  }];
  function query(database, options = {}) {
    const { nullableComparator = true } = options;
    it("$size", async () => {
      await expect7(database.get("baz", {
        nums: { $size: 3 }
      })).to.eventually.deep.equal([
        { id: 1, nums: [4, 5, 6] },
        { id: 2, nums: [5, 6, 7] }
      ]);
      await expect7(database.select("baz", {
        nums: { $size: 3 }
      }).project({
        size: /* @__PURE__ */ __name((row) => $6.length(row.nums), "size")
      }).execute()).to.eventually.deep.equal([
        { size: 3 },
        { size: 3 }
      ]);
      await expect7(database.select("baz", {
        nums: { $size: 0 }
      }).project({
        size: /* @__PURE__ */ __name((row) => $6.length(row.nums), "size")
      }).execute()).to.eventually.have.length(0);
    });
    it("$el", async () => {
      await expect7(database.get("baz", {
        nums: { $el: 5 }
      })).to.eventually.deep.equal([
        { id: 1, nums: [4, 5, 6] },
        { id: 2, nums: [5, 6, 7] }
      ]);
      await expect7(database.get("bar", {
        l: { $el: "4" }
      })).to.eventually.have.shape([
        { uid: 1, pid: 1, value: 1 }
      ]);
      await expect7(database.get("bar", {
        la: { $el: "b" }
      })).to.eventually.have.shape([
        { uid: 1, pid: 1, value: 0 },
        { uid: 1, pid: 1, value: 1 }
      ]);
    });
    it("$in", async () => {
      await expect7(database.get("bar", {
        s: { $in: ["1", "2"] }
      })).to.eventually.have.shape([
        { uid: 1, pid: 1, value: 0 },
        { uid: 1, pid: 1, value: 1 }
      ]);
    });
    it("$.in", async () => {
      await expect7(database.get("baz", (row) => $6.in($6.add(3, row.id), row.nums))).to.eventually.deep.equal([
        { id: 1, nums: [4, 5, 6] },
        { id: 2, nums: [5, 6, 7] }
      ]);
      await expect7(database.get("bar", (row) => $6.in("4", row.l))).to.eventually.have.shape([
        { uid: 1, pid: 1, value: 1 }
      ]);
      await expect7(database.get("bar", (row) => $6.in("b", row.la))).to.eventually.have.shape([
        { uid: 1, pid: 1, value: 0 },
        { uid: 1, pid: 1, value: 1 }
      ]);
    });
    it("$.nin", async () => {
      await expect7(database.get("baz", (row) => $6.nin($6.add(3, row.id), row.nums))).to.eventually.deep.equal([
        { id: 3, nums: [7, 8] }
      ]);
      await expect7(database.get("bar", (row) => $6.nin("4", row.l))).to.eventually.have.shape([
        { uid: 1, pid: 1, value: 0 },
        { uid: 1, pid: 2, value: 0 }
      ]);
      await expect7(database.get("bar", (row) => $6.nin("b", row.la))).to.eventually.have.shape([
        { uid: 1, pid: 2, value: 0 }
      ]);
    });
    it("execute nested selection", async () => {
      await expect7(database.eval("bar", (row) => $6.max($6.add(1, row.value)))).to.eventually.deep.equal(2);
      await expect7(database.eval("bar", (row) => $6.max($6.add(1, row.obj.x)))).to.eventually.deep.equal(4);
    });
    it("$get array", async () => {
      await expect7(database.get("baz", (row) => $6.eq($6.get(row.nums, 0), 4))).to.eventually.deep.equal([
        { id: 1, nums: [4, 5, 6] }
      ]);
      await expect7(database.get("baz", (row) => $6.eq(row.nums[0], 4))).to.eventually.deep.equal([
        { id: 1, nums: [4, 5, 6] }
      ]);
    });
    nullableComparator && it("$get array with expressions", async () => {
      await expect7(database.get("baz", (row) => $6.eq($6.get(row.nums, $6.add(row.id, -1)), 4))).to.eventually.deep.equal([
        { id: 1, nums: [4, 5, 6] }
      ]);
    });
    it("$get object", async () => {
      await expect7(database.get("bar", (row) => $6.eq(row.obj.o.a, 2))).to.eventually.have.shape([
        { value: 1 }
      ]);
      await expect7(database.get("bar", (row) => $6.eq($6.get(row.obj.o, "a"), 2))).to.eventually.have.shape([
        { value: 1 }
      ]);
    });
  }
  JsonTests2.query = query;
  __name(query, "query");
  function modify(database) {
    it("$.object", async () => {
      await setup(database, "bax", Bax);
      await database.set("bax", 1, (row) => ({
        object: $6.object({
          num: row.id
        })
      }));
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "foo" }], object: { num: 1 } }
      ]);
    });
    it("$.literal", async () => {
      await setup(database, "bax", Bax);
      await database.set("bax", 1, {
        array: $6.literal([{ text: "foo2" }])
      });
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "foo2" }], object: { num: 0 } }
      ]);
      await database.set("bax", 1, {
        object: $6.literal({ num: 2 })
      });
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "foo2" }], object: { num: 2 } }
      ]);
      await database.set("bax", 1, {
        "object.num": $6.literal(3)
      });
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "foo2" }], object: { num: 3 } }
      ]);
    });
    it("$.literal cast", async () => {
      await setup(database, "bax", Bax);
      await database.set("bax", 1, {
        array: $6.literal([{ text: "foo2" }], "array")
      });
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "foo2" }], object: { num: 0 } }
      ]);
      await database.set("bax", 1, {
        object: $6.literal({ num: 2 }, "object")
      });
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "foo2" }], object: { num: 2 } }
      ]);
    });
    it("$.literal with empty object", async () => {
      await setup(database, "bax", Bax);
      await database.set("bax", 1, {
        object: {
          num: 2
        }
      });
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "foo" }], object: { num: 2 } }
      ]);
      await database.set("bax", 1, {
        object: {}
      });
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "foo" }], object: {} }
      ]);
    });
    it("nested illegal string", async () => {
      await setup(database, "bax", Bax);
      await database.set("bax", 1, (row) => ({
        array: [{ text: "$foo2" }]
      }));
      await expect7(database.get("bax", 1)).to.eventually.deep.equal([
        { id: 1, array: [{ text: "$foo2" }], object: { num: 0 } }
      ]);
    });
  }
  JsonTests2.modify = modify;
  __name(modify, "modify");
  function selection(database) {
    it("$.object", async () => {
      const res = await database.select("foo").project({
        obj: /* @__PURE__ */ __name((row) => $6.object({
          id: row.id,
          value: row.value
        }), "obj")
      }).orderBy((row) => row.obj.id).execute();
      expect7(res).to.deep.equal([
        { obj: { id: 1, value: 0 } },
        { obj: { id: 2, value: 2 } },
        { obj: { id: 3, value: 2 } }
      ]);
    });
    it("$.object using spread", async () => {
      const res = await database.select("foo").project({
        obj: /* @__PURE__ */ __name((row) => $6.object({
          id2: row.id,
          ...row
        }), "obj")
      }).orderBy((row) => row.obj.id).execute();
      expect7(res).to.deep.equal([
        { obj: { id2: 1, id: 1, value: 0 } },
        { obj: { id2: 2, id: 2, value: 2 } },
        { obj: { id2: 3, id: 3, value: 2 } }
      ]);
    });
    it("$.object in json", async () => {
      const res = await database.select("bar").project({
        obj: /* @__PURE__ */ __name((row) => $6.object({
          num: row.obj.x,
          str: row.obj.y,
          str2: row.obj.z,
          obj: row.obj.o,
          a: row.obj.o.a
        }), "obj")
      }).execute();
      expect7(res).to.deep.equal([
        { obj: { a: 1, num: 1, obj: { a: 1, b: "1" }, str: "a", str2: "1" } },
        { obj: { a: 2, num: 2, obj: { a: 2, b: "2" }, str: "b", str2: "2" } },
        { obj: { a: 3, num: 3, obj: { a: 3, b: "3" }, str: "c", str2: "3" } }
      ]);
    });
    it("project in json with nested object", async () => {
      const res = await database.select("bar").project({
        "obj.num": /* @__PURE__ */ __name((row) => row.obj.x, "obj.num"),
        "obj.str": /* @__PURE__ */ __name((row) => row.obj.y, "obj.str"),
        "obj.str2": /* @__PURE__ */ __name((row) => row.obj.z, "obj.str2"),
        "obj.obj": /* @__PURE__ */ __name((row) => row.obj.o, "obj.obj"),
        "obj.a": /* @__PURE__ */ __name((row) => row.obj.o.a, "obj.a")
      }).execute();
      expect7(res).to.deep.equal([
        { obj: { a: 1, num: 1, obj: { a: 1, b: "1" }, str: "a", str2: "1" } },
        { obj: { a: 2, num: 2, obj: { a: 2, b: "2" }, str: "b", str2: "2" } },
        { obj: { a: 3, num: 3, obj: { a: 3, b: "3" }, str: "c", str2: "3" } }
      ]);
    });
    it("$.object on row", async () => {
      const res = await database.select("foo").project({
        obj: /* @__PURE__ */ __name((row) => $6.object(row), "obj")
      }).orderBy((row) => row.obj.id).execute();
      expect7(res).to.deep.equal([
        { obj: { id: 1, value: 0 } },
        { obj: { id: 2, value: 2 } },
        { obj: { id: 3, value: 2 } }
      ]);
    });
    it("$.object on cell", async () => {
      const res = await database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).groupBy("bar", {
        x: /* @__PURE__ */ __name((row) => $6.array($6.object(row.foo)), "x")
      }).execute(["x"]);
      expect7(res).to.have.deep.members([
        { x: [{ id: 1, value: 0 }] },
        { x: [{ id: 1, value: 0 }] },
        { x: [{ id: 2, value: 2 }] }
      ]);
    });
    it("$.array groupBy", async () => {
      await expect7(
        database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).groupBy(["foo"], {
          x: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.x), "x"),
          y: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.y), "y")
        }).orderBy((row) => row.foo.id).execute()
      ).to.eventually.have.shape([
        { foo: { id: 1, value: 0 }, x: [1, 2], y: ["a", "b"] },
        { foo: { id: 2, value: 2 }, x: [3], y: ["c"] }
      ]);
      await expect7(
        database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).groupBy(["foo"], {
          x: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.x), "x"),
          y: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.y), "y")
        }).orderBy((row) => row.foo.id).execute((row) => $6.array(row.y))
      ).to.eventually.have.shape([
        ["a", "b"],
        ["c"]
      ]);
      await expect7(
        database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).groupBy(["foo"], {
          x: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.x), "x"),
          y: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.y), "y")
        }).orderBy((row) => row.foo.id).execute((row) => $6.count(row.y))
      ).to.eventually.deep.equal(2);
    });
    it("$.array groupFull", async () => {
      const res = await database.select("bar").groupBy({}, {
        count2: /* @__PURE__ */ __name((row) => $6.array(row.s), "count2"),
        countnumber: /* @__PURE__ */ __name((row) => $6.array(row.value), "countnumber"),
        x: /* @__PURE__ */ __name((row) => $6.array(row.obj.x), "x"),
        y: /* @__PURE__ */ __name((row) => $6.array(row.obj.y), "y")
      }).execute();
      expect7(res).to.deep.equal([
        {
          count2: ["1", "2", "3"],
          countnumber: [0, 1, 0],
          x: [1, 2, 3],
          y: ["a", "b", "c"]
        }
      ]);
    });
    it("$.array in json", async () => {
      const res = await database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).groupBy("foo", {
        bars: /* @__PURE__ */ __name((row) => $6.array($6.object({
          value: row.bar.value,
          obj: row.bar.obj
        })), "bars"),
        x: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.x), "x"),
        y: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.y), "y"),
        z: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.z), "z"),
        o: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.o), "o")
      }).orderBy((row) => row.foo.id).execute();
      expect7(res).to.have.shape([
        {
          foo: { id: 1, value: 0 },
          bars: [{
            obj: { o: { a: 1, b: "1" }, x: 1, y: "a", z: "1" },
            value: 0
          }, {
            obj: { o: { a: 2, b: "2" }, x: 2, y: "b", z: "2" },
            value: 1
          }],
          x: [1, 2],
          y: ["a", "b"],
          z: ["1", "2"],
          o: [{ a: 1, b: "1" }, { a: 2, b: "2" }]
        },
        {
          foo: { id: 2, value: 2 },
          bars: [{
            obj: { o: { a: 3, b: "3" }, x: 3, y: "c", z: "3" },
            value: 0
          }],
          x: [3],
          y: ["c"],
          z: ["3"],
          o: [{ a: 3, b: "3" }]
        }
      ]);
    });
    it("$.array with expressions", async () => {
      const res = await database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).groupBy("foo", {
        bars: /* @__PURE__ */ __name((row) => $6.array($6.object({
          value: row.bar.value,
          value2: $6.add(row.bar.value, row.foo.value)
        })), "bars"),
        x: /* @__PURE__ */ __name((row) => $6.array($6.add(1, row.bar.obj.x)), "x"),
        y: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.y), "y")
      }).orderBy((row) => row.foo.id).execute();
      expect7(res).to.have.shape([
        {
          foo: { id: 1, value: 0 },
          bars: [{ value: 0, value2: 0 }, { value: 1, value2: 1 }],
          x: [2, 3],
          y: ["a", "b"]
        },
        {
          foo: { id: 2, value: 2 },
          bars: [{ value: 0, value2: 2 }],
          x: [4],
          y: ["c"]
        }
      ]);
    });
    it("$.array nested", async () => {
      const res = await database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).orderBy((row) => row.foo.id).groupBy("foo", {
        y: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.x), "y")
      }).groupBy({}, {
        z: /* @__PURE__ */ __name((row) => $6.array(row.y), "z")
      }).execute();
      expect7(res).to.have.shape([
        {
          z: [[1, 2], [3]]
        }
      ]);
    });
    it("non-aggr func", async () => {
      const res = await database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).groupBy("foo", {
        y: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.x), "y")
      }).project({
        sum: /* @__PURE__ */ __name((row) => $6.sum(row.y), "sum"),
        avg: /* @__PURE__ */ __name((row) => $6.avg(row.y), "avg"),
        min: /* @__PURE__ */ __name((row) => $6.min(row.y), "min"),
        max: /* @__PURE__ */ __name((row) => $6.max(row.y), "max"),
        count: /* @__PURE__ */ __name((row) => $6.length(row.y), "count")
      }).orderBy((row) => row.count).execute();
      expect7(res).to.deep.equal([
        { sum: 3, avg: 3, min: 3, max: 3, count: 1 },
        { sum: 3, avg: 1.5, min: 1, max: 2, count: 2 }
      ]);
    });
    it("non-aggr func inside aggr", async () => {
      const res = await database.join(["foo", "bar"], (foo, bar) => $6.eq(foo.id, bar.pid)).orderBy((row) => row.foo.id).groupBy("foo", {
        y: /* @__PURE__ */ __name((row) => $6.array(row.bar.obj.x), "y")
      }).groupBy({}, {
        sum: /* @__PURE__ */ __name((row) => $6.avg($6.sum(row.y)), "sum"),
        avg: /* @__PURE__ */ __name((row) => $6.avg($6.avg(row.y)), "avg"),
        min: /* @__PURE__ */ __name((row) => $6.min($6.min(row.y)), "min"),
        max: /* @__PURE__ */ __name((row) => $6.max($6.max(row.y)), "max")
      }).execute();
      expect7(res).to.deep.equal([
        { sum: 3, avg: 2.25, min: 1, max: 3 }
      ]);
    });
    it("pass sqlType", async () => {
      const res = await database.select("bar").project({
        x: /* @__PURE__ */ __name((row) => row.l, "x"),
        y: /* @__PURE__ */ __name((row) => row.obj, "y")
      }).execute();
      expect7(res).to.deep.equal([
        { x: ["1", "2"], y: { x: 1, y: "a", z: "1", o: { a: 1, b: "1" } } },
        { x: ["5", "3", "4"], y: { x: 2, y: "b", z: "2", o: { a: 2, b: "2" } } },
        { x: ["2"], y: { x: 3, y: "c", z: "3", o: { a: 3, b: "3" } } }
      ]);
    });
    it("pass sqlType in join", async () => {
      const res = await database.join({
        foo: "foo",
        bar: "bar"
      }, ({ foo, bar }) => $6.eq(foo.id, bar.pid)).project({
        x: /* @__PURE__ */ __name((row) => row.bar.l, "x"),
        y: /* @__PURE__ */ __name((row) => row.bar.obj, "y")
      }).execute();
      expect7(res).to.have.deep.members([
        { x: ["1", "2"], y: { x: 1, y: "a", z: "1", o: { a: 1, b: "1" } } },
        { x: ["5", "3", "4"], y: { x: 2, y: "b", z: "2", o: { a: 2, b: "2" } } },
        { x: ["2"], y: { x: 3, y: "c", z: "3", o: { a: 3, b: "3" } } }
      ]);
    });
  }
  JsonTests2.selection = selection;
  __name(selection, "selection");
})(JsonTests || (JsonTests = {}));
var json_default = JsonTests;

// src/transaction.ts
import { $ as $7 } from "minato";
import { expect as expect8 } from "chai";
function TransactionOperations(database) {
  database.extend("temptx", {
    id: "unsigned",
    text: "string",
    num: "integer",
    bool: "boolean",
    list: "list",
    timestamp: "timestamp",
    date: "date",
    time: "time"
  }, {
    autoInc: true
  });
}
__name(TransactionOperations, "TransactionOperations");
((TransactionOperations2) => {
  const merge = /* @__PURE__ */ __name((a, b) => ({ ...a, ...b }), "merge");
  const magicBorn = /* @__PURE__ */ new Date("1970/08/17");
  const barTable = [
    { id: 1, bool: true },
    { id: 2, text: "pku" },
    { id: 3, num: 1989 },
    { id: 4, list: ["1", "1", "4"] },
    { id: 5, timestamp: magicBorn },
    { id: 6, date: magicBorn },
    { id: 7, time: /* @__PURE__ */ new Date("1970-01-01 12:00:00") }
  ];
  async function setup2(database, name, table) {
    await database.remove(name, {});
    const result = [];
    for (const item of table) {
      result.push(await database.create(name, item));
    }
    return result;
  }
  __name(setup2, "setup");
  function commit(database) {
    it("create", async () => {
      const table = barTable.map((bar) => merge(database.tables.temptx.create(), bar));
      let counter = 0;
      await expect8(database.withTransaction(async (database2) => {
        for (const index in barTable) {
          const bar = await database2.create("temptx", barTable[index]);
          barTable[index].id = bar.id;
          expect8(bar).to.have.shape(table[index]);
          counter++;
        }
        await expect8(database2.get("temptx", {})).to.eventually.have.length(barTable.length);
      })).to.be.fulfilled;
      expect8(counter).to.equal(barTable.length);
      await expect8(database.get("temptx", {})).to.eventually.have.length(barTable.length);
    });
    it("set", async () => {
      const table = await setup2(database, "temptx", barTable);
      const data = table.find((bar) => bar.timestamp);
      data.list = ["2", "3", "3"];
      const magicIds = table.slice(2, 4).map((data2) => {
        data2.list = ["2", "3", "3"];
        return data2.id;
      });
      await expect8(database.withTransaction(async (database2) => {
        await database2.set("temptx", {
          $or: [
            { id: magicIds },
            { timestamp: magicBorn }
          ]
        }, { list: ["2", "3", "3"] });
        await expect8(database2.get("temptx", {})).to.eventually.have.shape(table);
      })).to.be.fulfilled;
      await expect8(database.get("temptx", {})).to.eventually.have.shape(table);
    });
    it("upsert new records", async () => {
      await database.remove("temptx", {});
      await expect8(database.withTransaction(async (database2) => {
        const table = await setup2(database2, "temptx", barTable);
        const data = [
          { id: table[table.length - 1].id + 1, text: 'wm"lake' },
          { id: table[table.length - 1].id + 2, text: "by'tower" }
        ];
        table.push(...data.map((bar) => merge(database2.tables.temptx.create(), bar)));
        await database2.upsert("temptx", data);
      })).to.be.fulfilled;
      await expect8(database.get("temptx", {})).to.eventually.have.length(9);
    });
    it("upsert using expressions", async () => {
      const table = await setup2(database, "temptx", barTable);
      const data2 = table.find((item) => item.id === 2);
      const data3 = table.find((item) => item.id === 3);
      const data9 = table.find((item) => item.id === 9);
      data2.num = data2.id * 2;
      data3.num = data3.num + 3;
      expect8(data9).to.be.undefined;
      table.push({ id: 9, num: 999 });
      await expect8(database.withTransaction(async (database2) => {
        await database2.upsert("temptx", (row) => [
          { id: 2, num: $7.multiply(2, row.id) },
          { id: 3, num: $7.add(3, row.num) },
          { id: 9, num: 999 }
        ]);
        await expect8(database2.get("temptx", {})).to.eventually.have.shape(table);
      })).to.be.fulfilled;
      await expect8(database.get("temptx", {})).to.eventually.have.shape(table);
    });
    it("remove", async () => {
      await setup2(database, "temptx", barTable);
      await expect8(database.withTransaction(async (database2) => {
        await database2.remove("temptx", { id: 2 });
        await expect8(database2.get("temptx", {})).eventually.length(6);
        await database2.remove("temptx", { id: 2 });
        await expect8(database2.get("temptx", {})).eventually.length(6);
        await database2.remove("temptx", {});
        await expect8(database2.get("temptx", {})).eventually.length(0);
      })).to.be.fulfilled;
      await expect8(database.get("temptx", {})).eventually.length(0);
    });
  }
  TransactionOperations2.commit = commit;
  __name(commit, "commit");
  function abort(database) {
    it("create", async () => {
      const table = barTable.map((bar) => merge(database.tables.temptx.create(), bar));
      let counter = 0;
      await expect8(database.withTransaction(async (database2) => {
        for (const index in barTable) {
          const bar = await database2.create("temptx", barTable[index]);
          barTable[index].id = bar.id;
          expect8(bar).to.have.shape(table[index]);
          counter++;
        }
        await expect8(database2.get("temptx", {})).to.eventually.have.length(barTable.length);
        throw new Error("oops");
      })).to.be.rejected;
      expect8(counter).to.equal(barTable.length);
      await expect8(database.get("temptx", {})).to.eventually.have.length(0);
    });
    it("set", async () => {
      const table = await setup2(database, "temptx", barTable);
      const data = table.find((bar) => bar.timestamp);
      data.list = ["2", "3", "3"];
      const magicIds = table.slice(2, 4).map((data2) => {
        data2.list = ["2", "3", "3"];
        return data2.id;
      });
      await expect8(database.withTransaction(async (database2) => {
        await database2.set("temptx", {
          $or: [
            { id: magicIds },
            { timestamp: magicBorn }
          ]
        }, { list: ["2", "3", "3"] });
        await expect8(database2.get("temptx", {})).to.eventually.have.shape(table);
        throw new Error("oops");
      })).to.be.rejected;
      await expect8(database.get("temptx", {})).to.eventually.have.shape(barTable);
    });
    it("upsert new records", async () => {
      await database.remove("temptx", {});
      await expect8(database.withTransaction(async (database2) => {
        const table = await setup2(database2, "temptx", barTable);
        const data = [
          { id: table[table.length - 1].id + 1, text: 'wm"lake' },
          { id: table[table.length - 1].id + 2, text: "by'tower" }
        ];
        table.push(...data.map((bar) => merge(database2.tables.temptx.create(), bar)));
        await database2.upsert("temptx", data);
        throw new Error("oops");
      })).to.be.rejected;
      await expect8(database.get("temptx", {})).to.eventually.have.length(0);
    });
    it("upsert using expressions", async () => {
      const table = await setup2(database, "temptx", barTable);
      const data2 = table.find((item) => item.id === 2);
      const data3 = table.find((item) => item.id === 3);
      const data9 = table.find((item) => item.id === 9);
      data2.num = data2.id * 2;
      data3.num = data3.num + 3;
      expect8(data9).to.be.undefined;
      table.push({ id: 9, num: 999 });
      await expect8(database.withTransaction(async (database2) => {
        await database2.upsert("temptx", (row) => [
          { id: 2, num: $7.multiply(2, row.id) },
          { id: 3, num: $7.add(3, row.num) },
          { id: 9, num: 999 }
        ]);
        await expect8(database2.get("temptx", {})).to.eventually.have.shape(table);
        throw new Error("oops");
      })).to.be.rejected;
      await expect8(database.get("temptx", {})).to.eventually.have.shape(barTable);
    });
    it("remove", async () => {
      await setup2(database, "temptx", barTable);
      await expect8(database.withTransaction(async (database2) => {
        await database2.remove("temptx", { id: 2 });
        await expect8(database2.get("temptx", {})).eventually.length(6);
        await database2.remove("temptx", { id: 2 });
        await expect8(database2.get("temptx", {})).eventually.length(6);
        await database2.remove("temptx", {});
        await expect8(database2.get("temptx", {})).eventually.length(0);
        throw new Error("oops");
      })).to.be.rejected;
      await expect8(database.get("temptx", {})).to.eventually.have.shape(barTable);
    });
  }
  TransactionOperations2.abort = abort;
  __name(abort, "abort");
})(TransactionOperations || (TransactionOperations = {}));
var transaction_default = TransactionOperations;

// src/relation.ts
import { $ as $8, Relation } from "minato";
import { expect as expect9 } from "chai";
function RelationTests(database) {
  database.extend("user", {
    id: "unsigned",
    value: "integer",
    successor: {
      type: "oneToOne",
      table: "user",
      target: "predecessor"
    }
  }, {
    autoInc: true
  });
  database.extend("profile", {
    id: "unsigned",
    name: "string",
    user: {
      type: "oneToOne",
      table: "user",
      target: "profile"
    }
  }, {
    unique: [["user", "name"]]
  });
  database.extend("post", {
    id2: "unsigned",
    score: "unsigned",
    content: "string",
    author: {
      type: "manyToOne",
      table: "user",
      target: "posts"
    }
  }, {
    autoInc: true,
    primary: "id2"
  });
  database.extend("tag", {
    id: "unsigned",
    name: "string",
    posts: {
      type: "manyToMany",
      table: "post",
      target: "tags"
    }
  }, {
    autoInc: true
  });
  database.extend("post2tag", {
    "post.id": "unsigned",
    "tag.id": "unsigned",
    post: {
      type: "manyToOne",
      table: "post",
      target: "_tags"
    },
    tag: {
      type: "manyToOne",
      table: "tag",
      target: "_posts"
    }
  }, {
    primary: ["post.id", "tag.id"]
  });
  database.extend("login", {
    id: "string",
    platform: "string(64)",
    name: "string"
  }, {
    primary: ["id", "platform"]
  });
  database.extend("guild", {
    id: "string",
    platform2: "string(64)",
    name: "string",
    logins: {
      type: "manyToMany",
      table: "login",
      target: "guilds",
      shared: { platform2: "platform" }
    }
  }, {
    primary: ["id", "platform2"]
  });
  database.extend("guildSync", {
    syncAt: "unsigned",
    platform: "string",
    guild: {
      type: "manyToOne",
      table: "guild",
      target: "syncs",
      fields: ["guild.id", "platform"]
    },
    login: {
      type: "manyToOne",
      table: "login",
      target: "syncs",
      fields: ["login.id", "platform"]
    }
  }, {
    primary: ["guild", "login"]
  });
  database.extend("member", {
    guild: {
      type: "manyToOne",
      table: "guild",
      target: "members"
    },
    user: {
      type: "manyToOne",
      table: "login"
    },
    name: "string"
  }, {
    primary: ["user", "guild"]
  });
  async function setupAutoInc(database2, name, length) {
    await database2.upsert(name, Array(length).fill({}));
    await database2.remove(name, {});
  }
  __name(setupAutoInc, "setupAutoInc");
  before(async () => {
    await setupAutoInc(database, "user", 3);
    await setupAutoInc(database, "post", 3);
    await setupAutoInc(database, "tag", 3);
  });
}
__name(RelationTests, "RelationTests");
((RelationTests2) => {
  const userTable = [
    { id: 1, value: 0 },
    { id: 2, value: 1, successor: { id: 1 } },
    { id: 3, value: 2 }
  ];
  const profileTable = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cat" }
  ];
  const postTable = [
    { id2: 1, content: "A1", author: { id: 1 } },
    { id2: 2, content: "B2", author: { id: 1 } },
    { id2: 3, content: "C3", author: { id: 2 } }
  ];
  const tagTable = [
    { id: 1, name: "X" },
    { id: 2, name: "Y" },
    { id: 3, name: "Z" }
  ];
  const post2TagTable = [
    { post: { id: 1 }, tag: { id: 1 } },
    { post: { id: 1 }, tag: { id: 2 } },
    { post: { id: 2 }, tag: { id: 1 } },
    { post: { id: 2 }, tag: { id: 3 } },
    { post: { id: 3 }, tag: { id: 3 } }
  ];
  const post2TagTable2 = [
    { post: { id2: 1 }, tag: { id: 1 } },
    { post: { id2: 1 }, tag: { id: 2 } },
    { post: { id2: 2 }, tag: { id: 1 } },
    { post: { id2: 2 }, tag: { id: 3 } },
    { post: { id2: 3 }, tag: { id: 3 } }
  ];
  function select(database, options = {}) {
    const { nullableComparator = true } = options;
    it("basic support", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      await expect9(database.get("profile", {}, ["user"])).to.eventually.have.shape(
        profiles.map((profile) => ({
          user: users.find((user) => user.id === profile.id)
        }))
      );
      await expect9(database.get("user", {}, { include: { profile: true, posts: true } })).to.eventually.have.shape(
        users.map((user) => ({
          ...user,
          profile: profiles.find((profile) => profile.id === user.id),
          posts: posts.filter((post) => post.author?.id === user.id)
        }))
      );
      await expect9(database.select("post", {}, { author: true }).execute()).to.eventually.have.shape(
        posts.map((post) => ({
          ...post,
          author: users.find((user) => user.id === post.author?.id)
        }))
      );
    });
    nullableComparator && it("self relation", async () => {
      const users = await setup(database, "user", userTable);
      await expect9(database.select("user", {}, { successor: true }).execute()).to.eventually.have.shape(
        users.map((user) => ({
          ...user,
          successor: users.find((successor) => successor.id === user.successor?.id) ?? null
        }))
      );
    });
    it("nested reads", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      await expect9(database.select("user", {}, { posts: { author: { successor: false } } }).execute()).to.eventually.have.shape(
        users.map((user) => ({
          ...user,
          posts: posts.filter((post) => post.author?.id === user.id).map((post) => ({
            ...post,
            author: users.find((user2) => user2.id === post.author?.id)
          }))
        }))
      );
      await expect9(database.select("profile", {}, { user: { posts: { author: true } } }).execute()).to.eventually.have.shape(
        profiles.map((profile) => ({
          ...profile,
          user: {
            ...users.find((user) => user.id === profile.id),
            posts: posts.filter((post) => post.author?.id === profile.id).map((post) => ({
              ...post,
              author: users.find((user) => user.id === profile.id)
            }))
          }
        }))
      );
      await expect9(database.select("post", {}, { author: { profile: true } }).execute()).to.eventually.have.shape(
        posts.map((post) => ({
          ...post,
          author: {
            ...users.find((user) => user.id === post.author?.id),
            profile: profiles.find((profile) => profile.id === post.author?.id)
          }
        }))
      );
    });
    it("manyToMany", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      const tags = await setup(database, "tag", tagTable);
      const post2tags = await setup(database, "post2tag", post2TagTable);
      const re = await setup(database, Relation.buildAssociationTable("post", "tag"), post2TagTable2);
      await expect9(database.select("post", {}, { _tags: { tag: { _posts: { post: true } } } }).execute()).to.eventually.be.fulfilled;
      await expect9(database.select("post", {}, { tags: { posts: true } }).execute()).to.eventually.have.shape(
        posts.map((post) => ({
          ...post,
          tags: post2tags.filter((p2t) => p2t.post?.id === post.id2).map((p2t) => tags.find((tag) => tag.id === p2t.tag?.id)).filter((tag) => tag).map((tag) => ({
            ...tag,
            posts: post2tags.filter((p2t) => p2t.tag?.id === tag.id).map((p2t) => posts.find((post2) => post2.id2 === p2t.post?.id))
          }))
        }))
      );
    });
  }
  RelationTests2.select = select;
  __name(select, "select");
  function query(database) {
    it("oneToOne / manyToOne", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      await expect9(database.get("user", {
        profile: {
          user: {
            id: 1
          }
        }
      })).to.eventually.have.shape(users.slice(0, 1).map((user) => ({
        ...user,
        profile: profiles.find((profile) => profile.id === user.id)
      })));
      await expect9(database.get("user", (row) => $8.query(row, {
        profile: /* @__PURE__ */ __name((r) => $8.eq(r.id, row.id), "profile")
      }))).to.eventually.have.shape(users.map((user) => ({
        ...user,
        profile: profiles.find((profile) => profile.id === user.id)
      })));
      await expect9(database.get("user", {
        profile: {
          user: {
            value: 1
          }
        }
      })).to.eventually.have.shape(users.slice(1, 2).map((user) => ({
        ...user,
        profile: profiles.find((profile) => profile.id === user.id)
      })));
      await expect9(database.get("post", {
        author: {
          id: 1
        },
        tags: {
          $every: {}
        }
      })).to.eventually.have.shape(posts.map((post) => ({
        ...post,
        author: users.find((user) => post.author?.id === user.id)
      })).filter((post) => post.author?.id === 1));
      await expect9(database.get("post", {
        author: {
          id: 1,
          value: 1
        }
      })).to.eventually.have.length(0);
    });
    it("oneToMany", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      await expect9(database.get("user", {
        posts: {
          $some: {
            author: {
              id: 1
            }
          }
        }
      })).to.eventually.have.shape(users.slice(0, 1).map((user) => ({
        ...user,
        posts: posts.filter((post) => post.author?.id === user.id)
      })));
      await expect9(database.get("user", {
        posts: {
          $some: /* @__PURE__ */ __name((row) => $8.eq(row.id2, 1), "$some")
        }
      })).to.eventually.have.shape(users.slice(0, 1).map((user) => ({
        ...user,
        posts: posts.filter((post) => post.author?.id === user.id)
      })));
      await expect9(database.get("user", {
        posts: {
          $none: {
            author: {
              id: 1
            }
          }
        }
      })).to.eventually.have.shape(users.slice(1).map((user) => ({
        ...user,
        posts: posts.filter((post) => post.author?.id === user.id)
      })));
      await expect9(database.get("user", {
        posts: {
          $every: {
            author: {
              id: 1
            }
          }
        }
      })).to.eventually.have.shape([users[0], users[2]].map((user) => ({
        ...user,
        posts: posts.filter((post) => post.author?.id === user.id)
      })));
      await expect9(database.get("user", {
        posts: {
          $or: [
            {
              $some: {
                author: {
                  id: 1
                }
              }
            },
            {
              $none: {
                author: {}
              }
            }
          ]
        }
      })).to.eventually.have.shape([users[0], users[2]].map((user) => ({
        ...user,
        posts: posts.filter((post) => post.author?.id === user.id)
      })));
      await expect9(database.get("user", {
        posts: {
          $not: {
            $some: {
              author: {
                id: 1
              }
            }
          }
        }
      })).to.eventually.have.shape([users[1], users[2]].map((user) => ({
        ...user,
        posts: posts.filter((post) => post.author?.id === user.id)
      })));
    });
    it("manyToMany", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      const tags = await setup(database, "tag", tagTable);
      const post2tags = await setup(database, "post2tag", post2TagTable);
      const re = await setup(database, Relation.buildAssociationTable("post", "tag"), post2TagTable2);
      await expect9(database.get("post", {
        tags: {
          $some: {
            id: 1
          }
        }
      })).to.eventually.have.shape(posts.slice(0, 2).map((post) => ({
        ...post,
        tags: post2tags.filter((p2t) => p2t.post?.id === post.id2).map((p2t) => tags.find((tag) => tag.id === p2t.tag?.id)).filter((tag) => tag)
      })));
      await expect9(database.get("post", {
        tags: {
          $none: {
            id: 1
          }
        }
      })).to.eventually.have.shape(posts.slice(2).map((post) => ({
        ...post,
        tags: post2tags.filter((p2t) => p2t.post?.id === post.id2).map((p2t) => tags.find((tag) => tag.id === p2t.tag?.id)).filter((tag) => tag)
      })));
      await expect9(database.get("post", {
        tags: {
          $every: {
            id: 3
          }
        }
      })).to.eventually.have.shape(posts.slice(2, 3).map((post) => ({
        ...post,
        tags: post2tags.filter((p2t) => p2t.post?.id === post.id2).map((p2t) => tags.find((tag) => tag.id === p2t.tag?.id)).filter((tag) => tag)
      })));
      await expect9(database.get("post", {
        tags: {
          $some: 1,
          $none: [3],
          $every: {}
        }
      })).to.eventually.have.shape(posts.slice(0, 1).map((post) => ({
        ...post,
        tags: post2tags.filter((p2t) => p2t.post?.id === post.id2).map((p2t) => tags.find((tag) => tag.id === p2t.tag?.id)).filter((tag) => tag)
      })));
    });
    it("nested query", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      const tags = await setup(database, "tag", tagTable);
      const post2tags = await setup(database, "post2tag", post2TagTable);
      const re = await setup(database, Relation.buildAssociationTable("post", "tag"), post2TagTable2);
      await expect9(database.get("user", {
        posts: {
          $some: {
            tags: {
              $some: {
                id: 1
              }
            }
          }
        }
      })).to.eventually.have.shape([users[0]].map((user) => ({
        ...user,
        posts: posts.filter((post) => post.author?.id === user.id)
      })));
      await expect9(database.get("tag", {
        posts: {
          $some: {
            author: {
              id: 2
            }
          }
        }
      })).to.eventually.have.shape([tags[2]].map((tag) => ({
        ...tag,
        posts: post2tags.filter((p2t) => p2t.tag?.id === tag.id).map((p2t) => posts.find((post) => post.id2 === p2t.post?.id)).filter((post) => post)
      })));
    });
    it("omit query", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      await expect9(database.get("user", { id: 2 }, ["id", "profile"])).to.eventually.have.shape(
        [users[1]].map((user) => ({
          id: user.id,
          profile: profiles.find((profile) => user.id === profile.id)
        }))
      );
    });
    it("existence", async () => {
      await setup(database, "user", userTable);
      await setup(database, "profile", profileTable);
      await setup(database, "post", postTable);
      await expect9(database.select("user", { successor: null }, null).execute()).to.eventually.have.shape([
        { id: 1 },
        { id: 3 }
      ]);
      await expect9(database.select("user", { predecessor: null }, null).execute()).to.eventually.have.shape([
        { id: 2 },
        { id: 3 }
      ]);
      await database.set("user", 1, { profile: null });
      await expect9(database.select("user", { profile: null }, null).execute()).to.eventually.have.shape([
        { id: 1 }
      ]);
      await database.set("user", 2, {
        posts: {
          $disconnect: {
            id2: 3
          }
        }
      });
      await expect9(database.select("post", { author: null }, null).execute()).to.eventually.have.shape([
        { id2: 3 }
      ]);
      await expect9(database.select("user", {
        posts: {
          $every: {
            author: null
          }
        }
      }, null).execute()).to.eventually.have.shape([
        { id: 2 },
        { id: 3 }
      ]);
    });
    it("manyToOne fallback", async () => {
      await setup(database, "user", []);
      await setup(database, "profile", []);
      await setup(database, "post", []);
      await database.create("post", {
        id2: 1,
        content: "new post",
        author: {
          $literal: {
            id: 2
          }
        }
      });
      await expect9(database.get("post", 1, ["author"])).to.eventually.have.shape([{
        author: {
          id: 2
        }
      }]);
      await database.create("user", {
        id: 2,
        value: 123
      });
      await expect9(database.get("post", 1, ["author"])).to.eventually.have.shape([{
        author: {
          id: 2,
          value: 123
        }
      }]);
    });
    it("filter on relations", async () => {
      const users = await setup(database, "user", userTable);
      const posts = await setup(database, "post", postTable);
      const tags = await setup(database, "tag", tagTable);
      const post2tags = await setup(database, "post2tag", post2TagTable);
      await setup(database, Relation.buildAssociationTable("post", "tag"), post2TagTable2);
      await expect9(database.get("user", {
        posts: {
          $some: {
            id2: 1
          }
        }
      }, {
        include: {
          posts: {
            id2: 1
          }
        }
      })).to.eventually.have.shape(users.slice(0, 1).map((user) => ({
        ...user,
        posts: posts.filter((post) => post.id2 === 1)
      })));
      await expect9(database.get("user", {
        posts: {
          $some: {
            tags: {
              $some: {
                id: 1
              }
            }
          }
        }
      }, {
        include: {
          posts: {
            tags: {
              id: 1
            }
          }
        }
      })).to.eventually.have.shape([users[0]].map((user) => ({
        ...user,
        posts: posts.filter((post) => post.author?.id === user.id).map((post) => ({
          ...post,
          tags: post2tags.filter((p2t) => p2t.post?.id === post.id2).map((p2t) => tags.find((tag) => tag.id === p2t.tag?.id)).filter((tag) => tag?.id === 1)
        }))
      })));
    });
  }
  RelationTests2.query = query;
  __name(query, "query");
  function create(database, options = {}) {
    const { nullableComparator = true } = options;
    it("basic support", async () => {
      await setup(database, "user", []);
      await setup(database, "profile", []);
      await setup(database, "post", []);
      for (const user of userTable) {
        await expect9(database.create("user", {
          ...user,
          profile: {
            ...profileTable.find((profile) => profile.id === user.id)
          },
          posts: postTable.filter((post) => post.author?.id === user.id)
        })).to.eventually.have.shape(user);
      }
      await expect9(database.select("profile", {}, { user: true }).execute()).to.eventually.have.shape(
        profileTable.map((profile) => ({
          ...profile,
          user: userTable.find((user) => user.id === profile.id)
        }))
      );
      await expect9(database.select("user", {}, { profile: true, posts: true }).execute()).to.eventually.have.shape(
        userTable.map((user) => ({
          ...user,
          profile: profileTable.find((profile) => profile.id === user.id),
          posts: postTable.filter((post) => post.author?.id === user.id)
        }))
      );
    });
    nullableComparator && it("nullable oneToOne", async () => {
      await setup(database, "user", []);
      await database.create("user", {
        id: 1,
        value: 1,
        successor: {
          $create: {
            id: 2,
            value: 2
          }
        },
        predecessor: {
          $create: {
            id: 6,
            value: 6
          }
        }
      });
      await expect9(database.select("user", {}, { successor: true }).orderBy("id").execute()).to.eventually.have.shape([
        { id: 1, value: 1, successor: { id: 2, value: 2 } },
        { id: 2, value: 2, successor: null },
        { id: 6, value: 6, successor: { id: 1, value: 1 } }
      ]);
      await database.create("user", {
        id: 3,
        value: 3,
        predecessor: {
          $upsert: {
            id: 4,
            value: 4
          }
        },
        successor: {
          $upsert: {
            id: 6,
            value: 6
          }
        }
      });
      await expect9(database.select("user", {}, { successor: true }).orderBy("id").execute()).to.eventually.have.shape([
        { id: 1, value: 1, successor: { id: 2, value: 2 } },
        { id: 2, value: 2, successor: null },
        { id: 3, value: 3, successor: { id: 6, value: 6 } },
        { id: 4, value: 4, successor: { id: 3, value: 3 } },
        { id: 6, value: 6 }
      ]);
      await database.remove("user", [2, 4]);
      await database.create("user", {
        id: 2,
        value: 2,
        successor: {
          $connect: {
            id: 1
          }
        }
      });
      await database.create("user", {
        id: 4,
        value: 4,
        predecessor: {
          $connect: {
            id: 3
          }
        }
      });
      await database.create("user", {
        id: 5,
        value: 5,
        successor: {
          $connect: {
            value: 3
          }
        }
      });
      await expect9(database.select("user", {}, { successor: true }).orderBy("id").execute()).to.eventually.have.shape([
        { id: 1, value: 1, successor: { id: 2, value: 2 } },
        { id: 2, value: 2, successor: { id: 1, value: 1 } },
        { id: 3, value: 3, successor: { id: 4, value: 4 } },
        { id: 4, value: 4, successor: null },
        { id: 5, value: 5, successor: { id: 3, value: 3 } },
        { id: 6, value: 6, successor: { id: 1, value: 1 } }
      ]);
    });
    it("oneToMany", async () => {
      await setup(database, "user", []);
      await setup(database, "profile", []);
      await setup(database, "post", []);
      for (const user of userTable) {
        await database.create("user", {
          ...userTable.find((u) => u.id === user.id),
          posts: postTable.filter((post) => post.author?.id === user.id)
        });
      }
      await expect9(database.select("user", {}, { posts: true }).execute()).to.eventually.have.shape(
        userTable.map((user) => ({
          ...user,
          posts: postTable.filter((post) => post.author?.id === user.id)
        }))
      );
    });
    it("upsert / connect oneToMany / manyToOne", async () => {
      await setup(database, "user", []);
      await setup(database, "profile", []);
      await setup(database, "post", []);
      await database.create("user", {
        id: 1,
        value: 1,
        posts: {
          $upsert: [
            {
              id2: 1,
              content: "post1"
            },
            {
              id2: 2,
              content: "post2"
            }
          ]
        }
      });
      await expect9(database.select("user", 1, { posts: true }).execute()).to.eventually.have.shape([
        {
          id: 1,
          value: 1,
          posts: [
            { id2: 1, content: "post1" },
            { id2: 2, content: "post2" }
          ]
        }
      ]);
      await database.create("user", {
        id: 2,
        value: 2,
        posts: {
          $connect: {
            id2: 1
          },
          $create: [
            {
              id2: 3,
              content: "post3",
              author: {
                $upsert: {
                  id: 2,
                  value: 3
                }
              }
            },
            {
              id2: 4,
              content: "post4",
              author: {
                $connect: {
                  id: 1
                }
              }
            }
          ]
        }
      });
      await expect9(database.select("user", {}, { posts: true }).execute()).to.eventually.have.shape([
        {
          id: 1,
          value: 1,
          posts: [
            { id2: 2, content: "post2" },
            { id2: 4, content: "post4" }
          ]
        },
        {
          id: 2,
          value: 3,
          posts: [
            { id2: 1, content: "post1" },
            { id2: 3, content: "post3" }
          ]
        }
      ]);
    });
    it("manyToOne", async () => {
      const users = await setup(database, "user", []);
      await setup(database, "post", []);
      users.push({ id: 1, value: 2 });
      await database.create("post", {
        id2: 1,
        content: "post2",
        author: {
          $create: {
            id: 1,
            value: 2
          }
        }
      });
      await expect9(database.get("user", {})).to.eventually.have.shape(users);
      users[0].value = 3;
      await database.create("post", {
        id2: 2,
        content: "post3",
        author: {
          $create: {
            id: 1,
            value: 3
          }
        }
      });
      await expect9(database.get("user", {})).to.eventually.have.shape(users);
      await database.create("post", {
        id2: 3,
        content: "post4",
        author: {
          id: 1
        }
      });
      await expect9(database.get("user", {})).to.eventually.have.shape(users);
      await expect9(database.get("post", {}, { include: { author: true } })).to.eventually.have.shape([
        { id2: 1, content: "post2", author: { id: 1, value: 3 } },
        { id2: 2, content: "post3", author: { id: 1, value: 3 } },
        { id2: 3, content: "post4", author: { id: 1, value: 3 } }
      ]);
    });
    it("manyToMany", async () => {
      await setup(database, "user", []);
      await setup(database, "post", []);
      await setup(database, "tag", []);
      await setup(database, Relation.buildAssociationTable("post", "tag"), []);
      for (const user of userTable) {
        await database.create("user", {
          ...userTable.find((u) => u.id === user.id),
          posts: postTable.filter((post) => post.author?.id === user.id).map((post) => ({
            ...post,
            tags: {
              $upsert: post2TagTable.filter((p2t) => p2t.post?.id === post.id2).map((p2t) => tagTable.find((tag) => tag.id === p2t.tag?.id)).filter((x) => !!x)
            }
          }))
        });
      }
      await expect9(database.select("user", {}, { posts: { tags: true } }).execute()).to.eventually.have.shape(
        userTable.map((user) => ({
          ...user,
          posts: postTable.filter((post) => post.author?.id === user.id).map((post) => ({
            ...post,
            tags: post2TagTable.filter((p2t) => p2t.post?.id === post.id2).map((p2t) => tagTable.find((tag) => tag.id === p2t.tag?.id))
          }))
        }))
      );
    });
    it("manyToMany expr", async () => {
      await setup(database, "user", []);
      await setup(database, "post", []);
      await setup(database, "tag", []);
      await setup(database, Relation.buildAssociationTable("post", "tag"), []);
      await database.create("post", {
        id2: 1,
        content: "post1",
        author: {
          $create: {
            id: 1,
            value: 1
          }
        },
        tags: {
          $create: [
            {
              name: "tag1"
            },
            {
              name: "tag2"
            }
          ]
        }
      });
      await database.create("post", {
        id2: 2,
        content: "post2",
        author: {
          $connect: {
            id: 1
          }
        },
        tags: {
          $connect: {
            name: "tag1"
          }
        }
      });
      await expect9(database.select("user", {}, { posts: { tags: true } }).execute()).to.eventually.have.shape([
        {
          id: 1,
          value: 1,
          posts: [
            {
              id2: 1,
              content: "post1",
              tags: [
                { name: "tag1" },
                { name: "tag2" }
              ]
            },
            {
              id2: 2,
              content: "post2",
              tags: [
                { name: "tag1" }
              ]
            }
          ]
        }
      ]);
    });
    it("explicit manyToMany", async () => {
      await setup(database, "login", []);
      await setup(database, "guild", []);
      await setup(database, "guildSync", []);
      await database.create("login", {
        id: "1",
        platform: "sandbox",
        name: "Bot1",
        syncs: {
          $create: [
            {
              syncAt: 123,
              guild: {
                $upsert: { id: "1", platform2: "sandbox", name: "Guild1" }
              }
            }
          ]
        }
      });
      await database.upsert("guild", [
        { id: "2", platform2: "sandbox", name: "Guild2" },
        { id: "3", platform2: "sandbox", name: "Guild3" }
      ]);
      await database.create("login", {
        id: "2",
        platform: "sandbox",
        name: "Bot2",
        syncs: {
          $create: [
            {
              syncAt: 123,
              guild: {
                $connect: { id: "2" }
              }
            }
          ]
        }
      });
      await expect9(database.get("login", {
        platform: "sandbox"
      }, {
        include: { syncs: { guild: true } }
      })).to.eventually.have.shape([
        {
          id: "1",
          platform: "sandbox",
          name: "Bot1",
          syncs: [
            {
              syncAt: 123,
              guild: { id: "1", platform2: "sandbox", name: "Guild1" }
            }
          ]
        },
        {
          id: "2",
          platform: "sandbox",
          name: "Bot2",
          syncs: [
            {
              syncAt: 123,
              guild: { id: "2", platform2: "sandbox", name: "Guild2" }
            }
          ]
        }
      ]);
    });
  }
  RelationTests2.create = create;
  __name(create, "create");
  function modify(database, options = {}) {
    const { nullableComparator = true } = options;
    it("oneToOne / manyToOne", async () => {
      const users = await setup(database, "user", userTable);
      const profiles = await setup(database, "profile", profileTable);
      await setup(database, "post", postTable);
      profiles.splice(2, 1);
      await database.set("user", 3, {
        profile: null
      });
      await expect9(database.get("profile", {})).to.eventually.have.deep.members(profiles);
      profiles.push(database.tables["profile"].create({ id: 3, name: "Reborn" }));
      await database.set("user", 3, {
        profile: {
          name: "Reborn"
        }
      });
      await expect9(database.get("profile", {})).to.eventually.have.deep.members(profiles);
      users[0].value = 99;
      await database.set("post", 1, {
        author: {
          value: 99
        }
      });
      await expect9(database.get("user", {})).to.eventually.have.deep.members(users);
      profiles.splice(2, 1);
      await database.set("user", 3, {
        profile: null
      });
      await expect9(database.get("profile", {})).to.eventually.have.deep.members(profiles);
      users.push({ id: 100, value: 200, successor: { id: void 0 } });
      await database.set("post", 1, {
        author: {
          id: 100,
          value: 200
        }
      });
      await expect9(database.get("user", {})).to.eventually.have.deep.members(users);
    });
    it("oneToOne expr", async () => {
      await setup(database, "user", []);
      await setup(database, "profile", []);
      await setup(database, "post", []);
      await database.create("user", {
        id: 1,
        value: 0
      });
      await database.set("user", 1, {
        profile: {
          $create: {
            name: "Apple"
          }
        }
      });
      await expect9(database.select("user", {}, { profile: true }).execute()).to.eventually.have.shape(
        [{ id: 1, value: 0, profile: { name: "Apple" } }]
      );
      await database.set("user", 1, {
        profile: {
          $upsert: [{
            name: "Apple2"
          }]
        }
      });
      await expect9(database.select("user", {}, { profile: true }).execute()).to.eventually.have.shape(
        [{ id: 1, value: 0, profile: { name: "Apple2" } }]
      );
      await database.set("user", 1, {
        profile: {
          $set: /* @__PURE__ */ __name((r) => ({
            name: $8.concat(r.name, "3")
          }), "$set")
        }
      });
      await expect9(database.select("user", {}, { profile: true }).execute()).to.eventually.have.shape(
        [{ id: 1, value: 0, profile: { name: "Apple23" } }]
      );
    });
    nullableComparator && it("nullable oneToOne", async () => {
      await setup(database, "user", []);
      await database.upsert("user", [
        { id: 1, value: 1 },
        { id: 2, value: 2 },
        { id: 3, value: 3 }
      ]);
      await database.set("user", 1, {
        successor: {
          $upsert: {
            id: 2
          }
        },
        predecessor: {
          $upsert: {
            id: 2
          }
        }
      });
      await database.set("user", 3, {
        successor: {
          $create: {
            id: 4,
            value: 4
          }
        },
        predecessor: {
          $connect: {
            id: 4
          }
        }
      });
      await expect9(database.select("user", {}, { successor: true }).execute()).to.eventually.have.shape([
        { id: 1, value: 1, successor: { id: 2, value: 2 } },
        { id: 2, value: 2, successor: { id: 1, value: 1 } },
        { id: 3, value: 3, successor: { id: 4, value: 4 } },
        { id: 4, value: 4, successor: { id: 3, value: 3 } }
      ]);
      await database.set("user", [1, 2], {
        successor: null
      });
      await expect9(database.select("user", {}, { successor: true }).execute()).to.eventually.have.shape([
        { id: 1, value: 1, successor: null },
        { id: 2, value: 2, successor: null },
        { id: 3, value: 3, successor: { id: 4, value: 4 } },
        { id: 4, value: 4, successor: { id: 3, value: 3 } }
      ]);
      await database.set("user", 3, {
        predecessor: {
          $disconnect: {}
        },
        successor: {
          $disconnect: {}
        }
      });
      await expect9(database.select("user", {}, { successor: true }).execute()).to.eventually.have.shape([
        { id: 1, value: 1, successor: null },
        { id: 2, value: 2, successor: null },
        { id: 3, value: 3, successor: null },
        { id: 4, value: 4, successor: null }
      ]);
      await database.set("user", 2, {
        predecessor: {
          $connect: {
            id: 3
          }
        },
        successor: {
          $connect: {
            id: 1
          }
        }
      });
      await expect9(database.select("user", {}, { successor: true }).execute()).to.eventually.have.shape([
        { id: 1, value: 1, successor: null },
        { id: 2, value: 2, successor: { id: 1, value: 1 } },
        { id: 3, value: 3, successor: { id: 2, value: 2 } },
        { id: 4, value: 4, successor: null }
      ]);
    });
    nullableComparator && it("set null on oneToOne", async () => {
      await setup(database, "user", []);
      for (const user of [
        { id: 1, value: 1, profile: { name: "A" } },
        { id: 2, value: 2, profile: { name: "B" } },
        { id: 3, value: 3, profile: { name: "B" } }
      ]) {
        await database.create("user", user);
      }
      await database.set("user", 1, {
        profile: null
      });
      await expect9(database.select("user", {}, { profile: true }).execute()).to.eventually.have.shape([
        { id: 1, value: 1, profile: null },
        { id: 2, value: 2, profile: { name: "B" } },
        { id: 3, value: 3, profile: { name: "B" } }
      ]);
      await expect9(database.set("profile", 3, {
        user: null
      })).to.be.eventually.rejected;
    });
    nullableComparator && it("manyToOne expr", async () => {
      await setup(database, "user", []);
      await setup(database, "profile", []);
      await setup(database, "post", []);
      await database.create("post", {
        id2: 1,
        content: "Post1"
      });
      await database.set("post", 1, {
        author: {
          $upsert: {
            id: 1,
            value: 0
          }
        }
      });
      await database.set("post", 1, {
        author: {
          $set: /* @__PURE__ */ __name((_) => ({
            profile: {
              name: "Apple"
            }
          }), "$set")
        }
      });
      await expect9(database.select("user", {}, { posts: true, profile: true }).execute()).to.eventually.have.shape(
        [{ id: 1, value: 0, profile: { name: "Apple" }, posts: [{ id2: 1, content: "Post1" }] }]
      );
      await database.set("post", 1, {
        author: {
          $set: /* @__PURE__ */ __name((r) => ({
            value: 123
          }), "$set")
        }
      });
      await expect9(database.select("user", {}, { posts: true, profile: true }).execute()).to.eventually.have.shape(
        [{ id: 1, value: 123, profile: { name: "Apple" }, posts: [{ id2: 1, content: "Post1" }] }]
      );
      await database.set("post", 1, {
        author: null
      });
      await expect9(database.select("user", {}, { posts: true, profile: true }).execute()).to.eventually.have.shape(
        [{ id: 1, value: 123, profile: { name: "Apple" }, posts: [] }]
      );
      await database.set("post", 1, {
        author: {
          value: 999,
          profile: { name: "Banana" }
        }
      });
      await expect9(database.select("user", {}, { posts: true, profile: true }).execute()).to.eventually.have.shape([
        { id: 1, value: 123, profile: { name: "Apple" }, posts: [] },
        { value: 999, profile: { name: "Banana" }, posts: [{ id2: 1, content: "Post1" }] }
      ]);
    });
    it("create oneToMany", async () => {
      await setup(database, "user", userTable);
      await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      posts.push(database.tables["post"].create({ id2: 4, author: { id: 2 }, content: "post1" }));
      posts.push(database.tables["post"].create({ id2: 5, author: { id: 2 }, content: "post2" }));
      posts.push(database.tables["post"].create({ id2: 6, author: { id: 2 }, content: "post1" }));
      posts.push(database.tables["post"].create({ id2: 7, author: { id: 2 }, content: "post2" }));
      await database.set("user", 2, {
        posts: {
          $create: [
            { id2: 4, content: "post1" },
            { id2: 5, content: "post2" }
          ],
          $upsert: [
            { id2: 6, content: "post1" },
            { id2: 7, content: "post2" }
          ]
        }
      });
      await expect9(database.get("post", {})).to.eventually.have.deep.members(posts);
      posts.push(database.tables["post"].create({ id2: 101, author: { id: 1 }, content: "post101" }));
      await database.set("user", 1, (row) => ({
        value: $8.add(row.id, 98),
        posts: {
          $create: { id2: 101, content: "post101" }
        }
      }));
      await expect9(database.get("post", {})).to.eventually.have.deep.members(posts);
    });
    it("set oneToMany", async () => {
      await setup(database, "user", userTable);
      await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      posts[0].score = 2;
      posts[1].score = 3;
      await database.set("user", 1, (row) => ({
        posts: {
          $set: /* @__PURE__ */ __name((r) => ({
            score: $8.add(row.id, r.id2)
          }), "$set")
        }
      }));
      await expect9(database.get("post", {})).to.eventually.have.deep.members(posts);
      posts[0].score = 12;
      posts[1].score = 13;
      await database.set("user", 1, (row) => ({
        posts: {
          $set: [
            {
              where: { score: { $gt: 2 } },
              update: /* @__PURE__ */ __name((r) => ({ score: $8.add(r.score, 10) }), "update")
            },
            {
              where: /* @__PURE__ */ __name((r) => $8.eq(r.score, 2), "where"),
              update: /* @__PURE__ */ __name((r) => ({ score: $8.add(r.score, 10) }), "update")
            }
          ]
        }
      }));
      await expect9(database.get("post", {})).to.eventually.have.deep.members(posts);
    });
    nullableComparator && it("delete oneToMany", async () => {
      await setup(database, "user", userTable);
      await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      posts.splice(0, 1);
      await database.set("user", {}, (row) => ({
        posts: {
          $remove: /* @__PURE__ */ __name((r) => $8.eq(r.id2, row.id), "$remove")
        }
      }));
      await expect9(database.get("post", {})).to.eventually.have.deep.members(posts);
      await database.set("post", 2, {
        author: {
          $remove: {},
          $connect: { id: 2 }
        }
      });
      await database.set("post", 3, {
        author: {
          $disconnect: {}
        }
      });
      await expect9(database.get("user", {}, { include: { posts: true } })).to.eventually.have.shape([
        {
          id: 2,
          posts: [
            { id2: 2 }
          ]
        },
        {
          id: 3,
          posts: []
        }
      ]);
    });
    it("override oneToMany", async () => {
      await setup(database, "user", userTable);
      await setup(database, "profile", profileTable);
      const posts = await setup(database, "post", postTable);
      posts[0].score = 2;
      posts[1].score = 3;
      await database.set("user", 1, (row) => ({
        posts: posts.slice(0, 2)
      }));
      await expect9(database.get("post", {})).to.eventually.have.deep.members(posts);
      posts[0].score = 4;
      posts[1].score = 5;
      await database.set("user", 1, {
        posts: posts.slice(0, 2)
      });
      await expect9(database.get("post", {})).to.eventually.have.deep.members(posts);
      await database.set("user", 1, {
        posts: []
      });
      await expect9(database.get("post", {})).to.eventually.have.length(posts.length - 2);
    });
    nullableComparator && it("connect / disconnect oneToMany", async () => {
      await setup(database, "user", userTable);
      await setup(database, "profile", profileTable);
      await setup(database, "post", postTable);
      await database.set("user", 1, {
        posts: {
          $disconnect: {},
          $connect: { id2: 3 }
        }
      });
      await expect9(database.get("user", 1, ["posts"])).to.eventually.have.shape([{
        posts: [
          { id2: 3 }
        ]
      }]);
    });
    it("modify manyToMany", async () => {
      await setup(database, "user", userTable);
      await setup(database, "profile", profileTable);
      await setup(database, "post", postTable);
      await setup(database, "tag", []);
      await setup(database, Relation.buildAssociationTable("post", "tag"), []);
      await database.set("post", 2, {
        tags: {
          $create: {
            id: 1,
            name: "Tag1"
          },
          $upsert: [
            {
              id: 2,
              name: "Tag2"
            },
            {
              id: 3,
              name: "Tag3"
            }
          ]
        }
      });
      await expect9(database.get("post", 2, ["tags"])).to.eventually.have.nested.property("[0].tags").with.shape([
        { id: 1, name: "Tag1" },
        { id: 2, name: "Tag2" },
        { id: 3, name: "Tag3" }
      ]);
      await database.set("post", 2, (row) => ({
        tags: {
          $set: /* @__PURE__ */ __name((r) => ({
            name: $8.concat(r.name, row.content, "2")
          }), "$set"),
          $remove: {
            id: 3
          }
        }
      }));
      await expect9(database.get("post", 2, ["tags"])).to.eventually.have.nested.property("[0].tags").with.shape([
        { id: 1, name: "Tag1B22" },
        { id: 2, name: "Tag2B22" }
      ]);
      await database.set("post", 2, {
        tags: [
          { id: 1, name: "Tag1" },
          { id: 2, name: "Tag2" },
          { id: 3, name: "Tag3" }
        ]
      });
      await expect9(database.get("post", 2, ["tags"])).to.eventually.have.nested.property("[0].tags").with.shape([
        { id: 1, name: "Tag1" },
        { id: 2, name: "Tag2" },
        { id: 3, name: "Tag3" }
      ]);
      await database.set("post", 2, (row) => ({
        tags: {
          $set: [
            {
              where: { id: 1 },
              update: { name: "Set1" }
            },
            {
              where: /* @__PURE__ */ __name((r) => $8.query(r, { id: 2 }), "where"),
              update: { name: "Set2" }
            },
            {
              where: /* @__PURE__ */ __name((r) => $8.eq(r.id, 3), "where"),
              update: /* @__PURE__ */ __name((_) => ({ name: "Set3" }), "update")
            }
          ]
        }
      }));
      await expect9(database.get("post", 2, ["tags"])).to.eventually.have.nested.property("[0].tags").with.shape([
        { id: 1, name: "Set1" },
        { id: 2, name: "Set2" },
        { id: 3, name: "Set3" }
      ]);
    });
    it("connect / disconnect manyToMany", async () => {
      await setup(database, "user", userTable);
      await setup(database, "profile", profileTable);
      await setup(database, "post", postTable);
      await setup(database, "tag", tagTable);
      await setup(database, Relation.buildAssociationTable("post", "tag"), post2TagTable2);
      await database.set("post", 2, {
        tags: {
          $disconnect: {}
        }
      });
      await expect9(database.get("post", 2, ["tags"])).to.eventually.have.nested.property("[0].tags").deep.equal([]);
      await database.set("post", 2, (row) => ({
        tags: {
          $connect: /* @__PURE__ */ __name((r) => $8.eq(r.id, row.id2), "$connect")
        }
      }));
      await expect9(database.get("post", 2, ["tags"])).to.eventually.have.nested.property("[0].tags").with.shape([{
        id: 2
      }]);
    });
    it("query relation", async () => {
      await setup(database, "user", userTable);
      const posts = await setup(database, "post", postTable);
      await setup(database, "tag", tagTable);
      await setup(database, Relation.buildAssociationTable("post", "tag"), post2TagTable2);
      posts.filter((post) => post2TagTable.some((p2t) => p2t.post?.id === post.id2 && p2t.tag?.id === 1)).forEach((post) => post.score += 10);
      await database.set("post", {
        tags: {
          $some: {
            id: 1
          }
        }
      }, (row) => ({
        score: $8.add(row.score, 10)
      }));
      await expect9(database.get("post", {})).to.eventually.have.deep.members(posts);
    });
    it("nested modify", async () => {
      await setup(database, "user", userTable);
      await setup(database, "post", postTable);
      const profiles = await setup(database, "profile", profileTable);
      profiles[0].name = "Evil";
      await database.set("user", 1, {
        posts: {
          $set: {
            where: { id2: { $gt: 1 } },
            update: {
              author: {
                $set: /* @__PURE__ */ __name((_) => ({
                  profile: {
                    $set: /* @__PURE__ */ __name((_2) => ({
                      name: "Evil"
                    }), "$set")
                  }
                }), "$set")
              }
            }
          }
        }
      });
      await expect9(database.get("profile", {})).to.eventually.have.deep.members(profiles);
    });
    it("shared manyToMany", async () => {
      await setup(database, "login", [
        { id: "1", platform: "sandbox", name: "Bot1" },
        { id: "2", platform: "sandbox", name: "Bot2" },
        { id: "3", platform: "sandbox", name: "Bot3" },
        { id: "1", platform: "whitebox", name: "Bot1" }
      ]);
      await setup(database, "guild", [
        { id: "1", platform2: "sandbox", name: "Guild1" },
        { id: "2", platform2: "sandbox", name: "Guild2" },
        { id: "3", platform2: "sandbox", name: "Guild3" },
        { id: "1", platform2: "whitebox", name: "Guild1" }
      ]);
      await setup(database, Relation.buildAssociationTable("login", "guild"), []);
      await database.set("login", {
        id: "1",
        platform: "sandbox"
      }, {
        guilds: {
          $connect: {
            id: {
              $or: ["1", "2"]
            }
          }
        }
      });
      await expect9(database.get("login", {
        id: "1",
        platform: "sandbox"
      }, ["guilds"])).to.eventually.have.nested.property("[0].guilds").with.length(2);
      await database.set("login", {
        id: "1",
        platform: "sandbox"
      }, {
        guilds: {
          $disconnect: {
            id: "2"
          }
        }
      });
      await expect9(database.get("login", {
        id: "1",
        platform: "sandbox"
      }, ["guilds"])).to.eventually.have.nested.property("[0].guilds").with.length(1);
      await database.create("guild", {
        id: "4",
        platform2: "sandbox",
        name: "Guild4",
        logins: {
          $upsert: [
            { id: "1" },
            { id: "2" }
          ]
        }
      });
      await expect9(database.get("login", { platform: "sandbox" }, ["id", "guilds"])).to.eventually.have.shape([
        { id: "1", guilds: [{ id: "1" }, { id: "4" }] },
        { id: "2", guilds: [{ id: "4" }] },
        { id: "3", guilds: [] }
      ]);
      await expect9(database.get("guild", { platform2: "sandbox" }, ["id", "logins"])).to.eventually.have.shape([
        { id: "1", logins: [{ id: "1" }] },
        { id: "2", logins: [] },
        { id: "3", logins: [] },
        { id: "4", logins: [{ id: "1" }, { id: "2" }] }
      ]);
    });
    it("explicit manyToMany", async () => {
      await setup(database, "login", [
        { id: "1", platform: "sandbox", name: "Guild1" },
        { id: "2", platform: "sandbox", name: "Guild2" },
        { id: "3", platform: "sandbox", name: "Guild3" }
      ]);
      await setup(database, "guild", []);
      await setup(database, "guildSync", []);
      await database.set("login", {
        id: "1",
        platform: "sandbox"
      }, {
        syncs: {
          $create: [
            {
              syncAt: 123,
              guild: { id: "1", platform2: "sandbox" }
            }
          ]
        }
      });
      await expect9(database.get("login", {
        id: "1",
        platform: "sandbox"
      }, {
        include: { syncs: { guild: true } }
      })).to.eventually.have.shape([
        {
          id: "1",
          syncs: [
            { syncAt: 123, guild: { id: "1", platform2: "sandbox" } }
          ]
        }
      ]);
      await database.create("member", {
        user: {
          $connect: {
            id: "1"
          }
        },
        guild: {
          $connect: {
            id: "1"
          }
        }
      });
      await expect9(database.get("member", {
        user: {
          guilds: {}
        }
      })).to.eventually.have.length(1);
    });
  }
  RelationTests2.modify = modify;
  __name(modify, "modify");
})(RelationTests || (RelationTests = {}));
var relation_default = RelationTests;

// src/performance.ts
import { Logger } from "minato";
function PerformanceTests(database) {
  database.extend("perf", {
    id: "unsigned",
    text: "text",
    number: "integer"
  }, {
    autoInc: true
  });
  before(async () => {
    const driver = Object.values(database.drivers)[0];
    const logger = new Logger(driver.constructor.name);
    logger.level = 2;
    await database.upsert("perf", new Array(2e3).fill(0).map((_, i) => ({ text: "hello", number: i })));
  });
  after(async () => {
    const driver = Object.values(database.drivers)[0];
    const logger = new Logger(driver.constructor.name);
    logger.level = 3;
  });
  it("stress test", async () => {
    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      await database.get("perf", {});
    }
    const end = performance.now();
    console.log("cost ", end - start);
  });
}
__name(PerformanceTests, "PerformanceTests");
var performance_default = PerformanceTests;

// src/setup.ts
import { config, use, util } from "chai";
import promised from "chai-as-promised";

// src/shape.ts
import { Binary, deepEqual as deepEqual3, isNullable as isNullable2 } from "cosmokit";
import { inspect } from "util";
function flag(obj, key, value) {
  var flags = obj.__flags || (obj.__flags = /* @__PURE__ */ Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
}
__name(flag, "flag");
function isSubsetOf(subset, superset, cmp, contains, ordered) {
  if (!contains) {
    if (subset.length !== superset.length) return false;
    superset = superset.slice();
  }
  return subset.every(function(elem, idx) {
    if (ordered) return cmp ? cmp(elem, superset[idx]) : elem === superset[idx];
    if (!cmp) {
      var matchIdx = superset.indexOf(elem);
      if (matchIdx === -1) return false;
      if (!contains) superset.splice(matchIdx, 1);
      return true;
    }
    return superset.some(function(elem2, matchIdx2) {
      if (!cmp(elem, elem2)) return false;
      if (!contains) superset.splice(matchIdx2, 1);
      return true;
    });
  });
}
__name(isSubsetOf, "isSubsetOf");
var shape_default = /* @__PURE__ */ __name(({ Assertion }) => {
  function checkShape(expect11, actual, path, ordered) {
    if (actual === expect11 || Number.isNaN(expect11) && Number.isNaN(actual)) return;
    function formatError(expect12, actual2) {
      return `expected to have ${expect12} but got ${actual2} at path ${path}`;
    }
    __name(formatError, "formatError");
    if (isNullable2(expect11) && isNullable2(actual)) return;
    if (!expect11 || ["string", "number", "boolean", "bigint"].includes(typeof expect11)) {
      return formatError(inspect(expect11), inspect(actual));
    }
    if (expect11 instanceof Date) {
      if (!(actual instanceof Date) || +expect11 !== +actual) {
        return formatError(inspect(expect11), inspect(actual));
      }
      return;
    }
    if (Binary.is(expect11)) {
      if (!Binary.is(actual) || !deepEqual3(actual, expect11)) {
        return formatError(inspect(expect11), inspect(actual));
      }
      return;
    }
    if (actual === null) {
      const type2 = Object.prototype.toString.call(expect11).slice(8, -1).toLowerCase();
      return formatError(`a ${type2}`, "null");
    }
    if (!ordered && Array.isArray(expect11) && Array.isArray(actual)) {
      if (!isSubsetOf(expect11, actual, (x, y) => !checkShape(x, y, `${path}/`, ordered), false, false)) {
        return `expected same shape of members`;
      }
      return;
    }
    for (const prop in expect11) {
      if (isNullable2(actual[prop]) && !isNullable2(expect11[prop])) {
        return `expected "${prop}" field to be defined at path ${path}`;
      }
      const message = checkShape(expect11[prop], actual[prop], `${path}${prop}/`, ordered);
      if (message) return message;
    }
  }
  __name(checkShape, "checkShape");
  Assertion.addMethod("shape", function(expect11) {
    var ordered = flag(this, "ordered");
    const message = checkShape(expect11, this._obj, "/", ordered);
    if (message) this.assert(false, message, "", expect11, this._obj);
  });
}, "default");

// src/setup.ts
import { isNullable as isNullable3 } from "cosmokit";
use(shape_default);
use(promised);
function type(obj) {
  if (typeof obj === "undefined") {
    return "undefined";
  }
  if (obj === null) {
    return "null";
  }
  const stringTag = obj[Symbol.toStringTag];
  if (typeof stringTag === "string") {
    return stringTag;
  }
  const sliceStart = 8;
  const sliceEnd = -1;
  return Object.prototype.toString.call(obj).slice(sliceStart, sliceEnd);
}
__name(type, "type");
function getEnumerableKeys(target) {
  const keys = [];
  for (const key in target) {
    keys.push(key);
  }
  return keys;
}
__name(getEnumerableKeys, "getEnumerableKeys");
function getEnumerableSymbols(target) {
  const keys = [];
  const allKeys = Object.getOwnPropertySymbols(target);
  for (let i = 0; i < allKeys.length; i += 1) {
    const key = allKeys[i];
    if (Object.getOwnPropertyDescriptor(target, key)?.enumerable) {
      keys.push(key);
    }
  }
  return keys;
}
__name(getEnumerableSymbols, "getEnumerableSymbols");
config.deepEqual = (expected, actual, options) => {
  return util.eql(expected, actual, {
    comparator: /* @__PURE__ */ __name((expected2, actual2) => {
      if (isNullable3(expected2) && isNullable3(actual2)) return true;
      if (type(expected2) === "Object" && type(actual2) === "Object") {
        const keys = /* @__PURE__ */ new Set([
          ...getEnumerableKeys(expected2),
          ...getEnumerableKeys(actual2),
          ...getEnumerableSymbols(expected2),
          ...getEnumerableSymbols(actual2)
        ]);
        return [...keys].every((key) => config.deepEqual(expected2[key], actual2[key], options));
      }
      return null;
    }, "comparator")
  });
};

// src/index.ts
import { expect as expect10 } from "chai";
var Keywords = ["name"];
function setValue(obj, path, value) {
  if (path.includes(".")) {
    const index = path.indexOf(".");
    setValue(obj[path.slice(0, index)] ??= {}, path.slice(index + 1), value);
  } else {
    obj[path] = value;
  }
}
__name(setValue, "setValue");
function createUnit(target, root = false) {
  const test = /* @__PURE__ */ __name((database, options = {}, overrideOptions) => {
    function callback() {
      if (typeof target === "function") {
        target(database, options);
      }
      for (const key in target) {
        if (overrideOptions && !overrideOptions[key]) continue;
        if (options[key] === false || Keywords.includes(key)) continue;
        test[key](database, options[key], overrideOptions?.[key] === true ? void 0 : overrideOptions?.[key]);
      }
    }
    __name(callback, "callback");
    if (root) {
      process.argv.filter((x) => x.startsWith("--+")).forEach((x) => setValue(options, x.slice(3), true));
      process.argv.filter((x) => x.startsWith("---")).forEach((x) => setValue(options, x.slice(3), false));
      if (process.argv.some((x) => x.startsWith("--!"))) {
        overrideOptions = {};
        process.argv.filter((x) => x.startsWith("--!")).forEach((x) => setValue(overrideOptions, x.slice(3), true));
      }
    }
    const title = target["name"];
    if (!root && title) {
      describe(title.replace(/(?=[A-Z])/g, " ").trimStart(), callback);
    } else {
      callback();
    }
  }, "test");
  for (const key in target) {
    if (Keywords.includes(key)) continue;
    test[key] = createUnit(target[key]);
  }
  return test;
}
__name(createUnit, "createUnit");
var Tests;
((Tests2) => {
  Tests2.model = model_default;
  Tests2.query = query_default;
  Tests2.update = update_default;
  Tests2.object = object_default;
  Tests2.selection = selection_default;
  Tests2.migration = migration_default;
  Tests2.json = json_default;
  Tests2.transaction = transaction_default;
  Tests2.relation = relation_default;
  Tests2.performance = performance_default;
})(Tests || (Tests = {}));
var src_default = createUnit(Tests, true);
export {
  src_default as default,
  expect10 as expect
};
//# sourceMappingURL=index.js.map
