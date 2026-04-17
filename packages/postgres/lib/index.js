var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/index.ts
import postgres from "postgres";
import { Binary as Binary2, difference, isNullable as isNullable4, makeArray, pick } from "cosmokit";
import { Driver as Driver2, executeUpdate, Field as Field2 } from "minato";

// ../../node_modules/cordis/lib/index.js
import { defineProperty as defineProperty2 } from "cosmokit";
import { defineProperty } from "cosmokit";
import { defineProperty as defineProperty4, isNullable as isNullable2 } from "cosmokit";
import { defineProperty as defineProperty3, isNullable } from "cosmokit";
import { defineProperty as defineProperty5 } from "cosmokit";
import { defineProperty as defineProperty6 } from "cosmokit";
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var DisposableList = class {
  static {
    __name(this, "DisposableList");
  }
  static {
    __name2(this, "DisposableList");
  }
  sn = 0;
  map = /* @__PURE__ */ new Map();
  weak = /* @__PURE__ */ new WeakMap();
  get length() {
    return this.map.size;
  }
  push(value) {
    const sn = ++this.sn;
    this.map.set(sn, value);
    this.weak.set(value, sn);
    return () => this.map.delete(sn);
  }
  delete(value) {
    const sn = this.weak.get(value);
    if (!sn) return false;
    return this.map.delete(sn);
  }
  clear() {
    const values = [...this.map.values()];
    this.map.clear();
    return values.reverse();
  }
  [Symbol.iterator]() {
    return this.map.values();
  }
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this];
  }
};
var symbols = {
  // internal symbols
  shadow: /* @__PURE__ */ Symbol.for("cordis.shadow"),
  receiver: /* @__PURE__ */ Symbol.for("cordis.receiver"),
  original: /* @__PURE__ */ Symbol.for("cordis.original"),
  metadata: /* @__PURE__ */ Symbol.for("cordis.metadata"),
  initHooks: /* @__PURE__ */ Symbol.for("cordis.initHooks"),
  checkProto: /* @__PURE__ */ Symbol.for("cordis.checkProto"),
  // context symbols
  effect: /* @__PURE__ */ Symbol.for("cordis.effect"),
  filter: /* @__PURE__ */ Symbol.for("cordis.filter"),
  isolate: /* @__PURE__ */ Symbol.for("cordis.isolate"),
  intercept: /* @__PURE__ */ Symbol.for("cordis.intercept"),
  // service symbols
  init: /* @__PURE__ */ Symbol.for("cordis.init"),
  check: /* @__PURE__ */ Symbol.for("cordis.check"),
  config: /* @__PURE__ */ Symbol.for("cordis.config"),
  invoke: /* @__PURE__ */ Symbol.for("cordis.invoke"),
  extend: /* @__PURE__ */ Symbol.for("cordis.extend"),
  tracker: /* @__PURE__ */ Symbol.for("cordis.tracker"),
  resolveConfig: /* @__PURE__ */ Symbol.for("cordis.resolveConfig")
};
var GeneratorFunction = function* () {
}.constructor;
var AsyncGeneratorFunction = async function* () {
}.constructor;
function isConstructor(func) {
  if (!func.prototype) return false;
  if (func instanceof GeneratorFunction) return false;
  if (AsyncGeneratorFunction !== Function && func instanceof AsyncGeneratorFunction) return false;
  return true;
}
__name(isConstructor, "isConstructor");
__name2(isConstructor, "isConstructor");
function joinPrototype(proto1, proto2) {
  if (proto1 === Object.prototype) return proto2;
  const result = Object.create(joinPrototype(Object.getPrototypeOf(proto1), proto2));
  for (const key of Reflect.ownKeys(proto1)) {
    Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(proto1, key));
  }
  return result;
}
__name(joinPrototype, "joinPrototype");
__name2(joinPrototype, "joinPrototype");
function isObject(value) {
  return value && (typeof value === "object" || typeof value === "function");
}
__name(isObject, "isObject");
__name2(isObject, "isObject");
function getPropertyDescriptor(target, prop) {
  let proto = target;
  while (proto) {
    const desc = Reflect.getOwnPropertyDescriptor(proto, prop);
    if (desc) return desc;
    proto = Object.getPrototypeOf(proto);
  }
}
__name(getPropertyDescriptor, "getPropertyDescriptor");
__name2(getPropertyDescriptor, "getPropertyDescriptor");
function getTraceable(ctx, value) {
  if (!isObject(value)) return value;
  if (Object.hasOwn(value, symbols.shadow)) {
    return Object.getPrototypeOf(value);
  }
  const tracker = value[symbols.tracker];
  if (!tracker) return value;
  return createTraceable(ctx, value, tracker);
}
__name(getTraceable, "getTraceable");
__name2(getTraceable, "getTraceable");
function withProps(target, props) {
  if (!props) return target;
  return new Proxy(target, {
    get: /* @__PURE__ */ __name2((target2, prop, receiver) => {
      if (prop in props && prop !== "constructor") return Reflect.get(props, prop, receiver);
      return Reflect.get(target2, prop, receiver);
    }, "get"),
    set: /* @__PURE__ */ __name2((target2, prop, value, receiver) => {
      if (prop in props && prop !== "constructor") return Reflect.set(props, prop, value, receiver);
      return Reflect.set(target2, prop, value, receiver);
    }, "set")
  });
}
__name(withProps, "withProps");
__name2(withProps, "withProps");
function withProp(target, prop, value) {
  return withProps(target, Object.defineProperty(/* @__PURE__ */ Object.create(null), prop, {
    value,
    writable: false
  }));
}
__name(withProp, "withProp");
__name2(withProp, "withProp");
function createShadow(ctx, target, property, receiver) {
  if (!property) return receiver;
  const origin = Reflect.getOwnPropertyDescriptor(target, property)?.value;
  if (!origin) return receiver;
  return withProp(receiver, property, ctx.extend({ [symbols.shadow]: origin }));
}
__name(createShadow, "createShadow");
__name2(createShadow, "createShadow");
function createShadowMethod(ctx, value, outer, shadow) {
  return new Proxy(value, {
    apply: /* @__PURE__ */ __name2((target, thisArg, args) => {
      if (thisArg === outer) thisArg = shadow;
      return getTraceable(ctx, Reflect.apply(target, thisArg, args));
    }, "apply")
  });
}
__name(createShadowMethod, "createShadowMethod");
__name2(createShadowMethod, "createShadowMethod");
function createTraceable(ctx, value, tracker) {
  if (ctx[symbols.shadow]) {
    ctx = Object.getPrototypeOf(ctx);
  }
  const proxy = new Proxy(value, {
    get: /* @__PURE__ */ __name2((target, prop, receiver) => {
      if (prop === symbols.original) return target;
      if (prop === tracker.property) return ctx;
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }
      if (tracker.associate && ctx.reflect.props[`${tracker.associate}.${prop}`]) {
        return Reflect.get(ctx, `${tracker.associate}.${prop}`, withProp(ctx, symbols.receiver, receiver));
      }
      let shadow, innerValue;
      const desc = getPropertyDescriptor(target, prop);
      if (desc && "value" in desc) {
        innerValue = desc.value;
      } else {
        shadow = createShadow(ctx, target, tracker.property, receiver);
        innerValue = Reflect.get(target, prop, shadow);
      }
      const innerTracker = innerValue?.[symbols.tracker];
      if (innerTracker) {
        return createTraceable(ctx, innerValue, innerTracker);
      } else if (!tracker.noShadow && typeof innerValue === "function") {
        shadow ??= createShadow(ctx, target, tracker.property, receiver);
        return createShadowMethod(ctx, innerValue, receiver, shadow);
      } else {
        return innerValue;
      }
    }, "get"),
    set: /* @__PURE__ */ __name2((target, prop, value2, receiver) => {
      if (prop === symbols.original) return false;
      if (prop === tracker.property) return false;
      if (typeof prop === "symbol") {
        return Reflect.set(target, prop, value2, receiver);
      }
      if (tracker.associate && ctx.reflect.props[`${tracker.associate}.${prop}`]) {
        return Reflect.set(ctx, `${tracker.associate}.${prop}`, value2, withProp(ctx, symbols.receiver, receiver));
      }
      const shadow = createShadow(ctx, target, tracker.property, receiver);
      return Reflect.set(target, prop, value2, shadow);
    }, "set"),
    apply: /* @__PURE__ */ __name2((target, thisArg, args) => {
      return applyTraceable(proxy, target, thisArg, args);
    }, "apply")
  });
  return proxy;
}
__name(createTraceable, "createTraceable");
__name2(createTraceable, "createTraceable");
function applyTraceable(proxy, value, thisArg, args) {
  if (!value[symbols.invoke]) return Reflect.apply(value, thisArg, args);
  return value[symbols.invoke].apply(proxy, args);
}
__name(applyTraceable, "applyTraceable");
__name2(applyTraceable, "applyTraceable");
function createCallable(name, proto, tracker) {
  const self = /* @__PURE__ */ __name2(function(...args) {
    const proxy = createTraceable(self["ctx"], self, tracker);
    return applyTraceable(proxy, self, this, args);
  }, "self");
  defineProperty(self, "name", name);
  return Object.setPrototypeOf(self, proto);
}
__name(createCallable, "createCallable");
__name2(createCallable, "createCallable");
function handleError(info, reason, getOuterStack) {
  const innerLines = info.error.stack.split("\n");
  if (typeof reason?.stack !== "string") {
    const outerError = new Error(reason);
    const lines2 = outerError.stack.split("\n");
    lines2.splice(1, Infinity, ...getOuterStack());
    outerError.stack = lines2.join("\n");
    throw outerError;
  }
  const lines = reason.stack.split("\n");
  let index = lines.indexOf(innerLines[2]);
  if (index === -1) throw reason;
  index -= info.offset;
  while (index > 0) {
    if (!lines[index - 1].endsWith(" (<anonymous>)")) break;
    index -= 1;
  }
  lines.splice(index, Infinity, ...getOuterStack());
  reason.stack = lines.join("\n");
  throw reason;
}
__name(handleError, "handleError");
__name2(handleError, "handleError");
function composeError(callback, getOuterStack = buildOuterStack()) {
  const info = { offset: 1, error: new Error() };
  try {
    const result = callback(info);
    if (isObject(result) && "then" in result) {
      return result.then(void 0, (reason) => handleError(info, reason, getOuterStack));
    } else {
      return result;
    }
  } catch (reason) {
    handleError(info, reason, getOuterStack);
  }
}
__name(composeError, "composeError");
__name2(composeError, "composeError");
function buildOuterStack(offset = 0) {
  const outerError = new Error();
  return () => outerError.stack.split("\n").slice(3 + offset);
}
__name(buildOuterStack, "buildOuterStack");
__name2(buildOuterStack, "buildOuterStack");
function isBailed(value) {
  return value !== null && value !== false && value !== void 0;
}
__name(isBailed, "isBailed");
__name2(isBailed, "isBailed");
var EventsService = class {
  static {
    __name(this, "EventsService");
  }
  constructor(ctx) {
    this.ctx = ctx;
    defineProperty2(this, symbols.tracker, {
      property: "ctx",
      noShadow: true
    });
    this.on("internal/listener", function(name, listener, options) {
      if (name === "internal/update" && !options.global) {
        const hooks = this.fiber._hooks["internal/update"] ??= new DisposableList();
        const method = options.prepend ? "unshift" : "push";
        return hooks[method](listener);
      }
    });
    for (const level of ["info", "error", "warn"]) {
      this.on(`internal/${level}`, (format, ...param) => {
        if (this._hooks[`internal/${level}`].length > 1) return;
        console[level](format, ...param);
      });
    }
    this.on("internal/update", function(config, noSave, next) {
      const cbs = [...this._hooks["internal/update"] || []];
      const _next = /* @__PURE__ */ __name2(() => {
        const cb = cbs.shift() ?? next;
        return cb.call(this, config, noSave, _next);
      }, "_next");
      return _next();
    }, { global: true, prepend: true });
  }
  ctx;
  static {
    __name2(this, "EventsService");
  }
  _hooks = {};
  dispatch(type, args) {
    const thisArg = typeof args[0] === "object" || typeof args[0] === "function" ? args.shift() : null;
    const name = args.shift();
    if (!name.startsWith("internal/")) {
      this.emit("internal/dispatch", type, name, args, thisArg);
    }
    const filter = thisArg?.[Context.filter];
    return (this._hooks[name] || []).filter((hook) => hook.global || !filter || filter.call(thisArg, hook.ctx)).map((hook) => hook.callback.bind(thisArg));
  }
  async parallel(...args) {
    await Promise.all(this.dispatch("emit", args).map((cb) => cb(...args)));
  }
  emit(...args) {
    this.dispatch("emit", args).map((cb) => cb(...args));
  }
  async serial(...args) {
    for (const cb of this.dispatch("serial", args)) {
      const result = await cb(...args);
      if (isBailed(result)) return result;
    }
  }
  bail(...args) {
    for (const cb of this.dispatch("bail", args)) {
      const result = cb(...args);
      if (isBailed(result)) return result;
    }
  }
  waterfall(...args) {
    const cbs = this.dispatch("waterfall", args);
    const inner = args.pop();
    const next = /* @__PURE__ */ __name2(() => {
      const cb = cbs.shift() ?? inner;
      return cb(...args);
    }, "next");
    args.push(next);
    return next();
  }
  register(label, hooks, callback, options) {
    const method = options.prepend ? "unshift" : "push";
    return this.ctx.fiber.effect(() => {
      hooks[method]({ ctx: this.ctx, callback, ...options });
      return () => this.unregister(hooks, callback);
    }, label);
  }
  unregister(hooks, callback) {
    const index = hooks.findIndex((hook) => hook.callback === callback);
    if (index >= 0) {
      hooks.splice(index, 1);
      return true;
    }
  }
  on(name, listener, options) {
    if (typeof options !== "object") {
      options = { prepend: options };
    }
    this.ctx.fiber.assertActive();
    listener = this.ctx.reflect.bind(listener);
    const result = this.bail(this.ctx, "internal/listener", name, listener, options);
    if (result) return result;
    const hooks = this._hooks[name] ||= [];
    const label = `ctx.on(${typeof name === "string" ? JSON.stringify(name) : name.toString()})`;
    return this.register(label, hooks, listener, options);
  }
  once(name, listener, options) {
    const dispose = this.on(name, function(...args) {
      dispose();
      return listener.apply(this, args);
    }, options);
    return dispose;
  }
};
var kValidationError = /* @__PURE__ */ Symbol.for("ValidationError");
var ValidationError = class extends TypeError {
  static {
    __name(this, "ValidationError");
  }
  static {
    __name2(this, "ValidationError");
  }
  name = "ValidationError";
  constructor(issues) {
    super(`invalid config:
` + issues.map((issue) => {
      if (issue.path) {
        return `  - ${issue.message} (at ${issue.path.join(".")})`;
      } else {
        return `  - ${issue.message}`;
      }
    }).join("\n"));
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, {
  value: true
});
function resolveConfig(runtime, config) {
  if (!runtime.Config) return config;
  const result = runtime.Config["~standard"].validate(config);
  if ("then" in result) {
    throw new TypeError("Async config validation is not supported");
  }
  if (result.issues) {
    throw new ValidationError(result.issues);
  } else {
    return result.value;
  }
}
__name(resolveConfig, "resolveConfig");
__name2(resolveConfig, "resolveConfig");
var CordisError = class _CordisError extends Error {
  static {
    __name(this, "_CordisError");
  }
  constructor(code, message) {
    super(message ?? _CordisError.Code[code]);
    this.code = code;
  }
  code;
  static {
    __name2(this, "CordisError");
  }
};
((CordisError2) => {
  CordisError2.Code = {
    INACTIVE_EFFECT: "cannot create effect on inactive context"
  };
})(CordisError || (CordisError = {}));
var INACTIVE = "__INACTIVE__";
var Fiber = class {
  static {
    __name(this, "Fiber");
  }
  constructor(parent, config, inject, runtime, getOuterStack) {
    this.parent = parent;
    this.inject = inject;
    this.runtime = runtime;
    const collect = /* @__PURE__ */ __name2((dispose) => {
      this._disposables.push(dispose);
    }, "collect");
    if (runtime) {
      this.uid = parent.registry.counter;
      this.ctx = this.context = parent.extend({ fiber: this });
      const injectEntries = Object.entries(this.inject);
      if (injectEntries.length) {
        this.ctx[Context.intercept] = Object.create(parent[Context.intercept]);
        for (const [name, inject2] of injectEntries) {
          if (isNullable(inject2.config)) continue;
          this.ctx[Context.intercept][name] = inject2.config;
        }
      }
      this._runner = {
        epoch: INACTIVE,
        getOuterStack,
        execute: /* @__PURE__ */ __name2(() => {
          if (isConstructor(runtime.callback)) {
            const instance = new runtime.callback(this.ctx, this.config);
            for (const hook of instance?.[symbols.initHooks] ?? []) {
              hook();
            }
            return instance?.[symbols.init]?.();
          } else {
            return runtime.callback(this.ctx, this.config);
          }
        }, "execute"),
        collect
      };
      this.context.emit("internal/plugin", this);
      for (const [name, inject2] of Object.entries(this.inject)) {
        if (!inject2.required) continue;
        this._checkImpl(name);
      }
      this.dispose = parent.fiber.effect(() => {
        const remove = runtime.fibers.push(this);
        try {
          this.config = resolveConfig(runtime, config);
          this._refresh();
        } catch (error) {
          this.context.emit("internal/error", error);
          this._error = error;
        }
        return async () => {
          this.uid = null;
          this.context.emit("internal/plugin", this);
          if (this.ctx.registry.has(runtime.callback)) {
            remove();
            if (!runtime.fibers.length) {
              this.ctx.registry.delete(runtime.callback);
            }
          }
          this._setEpoch(INACTIVE);
          await this.await();
        };
      }, "ctx.plugin()");
    } else {
      this.uid = 0;
      this.ctx = this.context = parent;
      this.state = 2;
      this.store = /* @__PURE__ */ Object.create(null);
      this._runner = {
        epoch: "",
        getOuterStack,
        execute: /* @__PURE__ */ __name2(() => {
        }, "execute"),
        collect
      };
      this.dispose = () => this.restart();
    }
  }
  parent;
  inject;
  runtime;
  static {
    __name2(this, "Fiber");
  }
  uid;
  ctx;
  config;
  state = 0;
  dispose;
  store;
  inertia;
  _hooks = /* @__PURE__ */ Object.create(null);
  _disposables = new DisposableList();
  // Same as `this.ctx`, but with a more specific type.
  context;
  _error;
  _runner;
  _store = /* @__PURE__ */ Object.create(null);
  get name() {
    let fiber = this;
    do {
      if (fiber.runtime?.name) return fiber.runtime.name;
      fiber = fiber.parent.fiber;
    } while (fiber !== fiber.parent.fiber);
    return "root";
  }
  assertActive() {
    if (this.uid !== null) return;
    throw new CordisError("INACTIVE_EFFECT");
  }
  _execute(runner) {
    const oldEpoch = runner.epoch;
    return composeError((info) => {
      const safeCollect = /* @__PURE__ */ __name2((dispose) => {
        if (typeof dispose === "function") {
          runner.collect(dispose);
        } else if (!isNullable(dispose)) {
          throw new TypeError("Invalid effect");
        }
      }, "safeCollect");
      const effect = runner.execute();
      if (typeof effect === "function") {
        return runner.collect(effect);
      } else if (isNullable(effect)) {
      } else if (!isObject(effect)) {
        throw new TypeError("Invalid effect");
      } else if ("then" in effect) {
        return effect.then(safeCollect);
      } else if (Symbol.iterator in effect) {
        info.error = new Error();
        const iter = effect[Symbol.iterator]();
        while (true) {
          const result = iter.next();
          safeCollect(result.value);
          if (result.done) return;
        }
      } else if (Symbol.asyncIterator in effect) {
        const iter = effect[Symbol.asyncIterator]();
        return (async () => {
          await Promise.resolve();
          info.error = new Error();
          while (true) {
            if (runner.epoch !== oldEpoch) return;
            const result = await iter.next();
            safeCollect(result.value);
            if (result.done) return;
          }
        })();
      } else {
        throw new TypeError("Invalid effect");
      }
    }, runner.getOuterStack);
  }
  effect(execute, label = "anonymous") {
    this.assertActive();
    const disposables = [];
    const dispose = /* @__PURE__ */ __name2(() => {
      let task2;
      for (const dispose2 of disposables.splice(0).reverse()) {
        if (task2) {
          task2 = task2.then(dispose2);
        } else {
          const result = dispose2();
          if (isObject(result) && "then" in result) {
            task2 = result;
          }
        }
      }
      return task2;
    }, "dispose");
    const meta = { label, children: [] };
    const runner = {
      execute,
      epoch: true,
      collect: /* @__PURE__ */ __name2((dispose2) => {
        disposables.push(dispose2);
        this._disposables.delete(dispose2);
        if (dispose2[symbols.effect]) {
          meta.children.push(dispose2[symbols.effect]);
        }
      }, "collect"),
      getOuterStack: buildOuterStack()
    };
    let task;
    try {
      task = this._execute(runner);
    } catch (reason) {
      dispose();
      throw reason;
    }
    task?.catch(dispose);
    const wrapper = defineProperty3(() => {
      if (!runner.epoch) return;
      runner.epoch = false;
      return task ? task.then(dispose) : dispose();
    }, symbols.effect, meta);
    const disposeAsync = /* @__PURE__ */ __name2(() => {
      if (!runner.epoch) return;
      runner.epoch = false;
      return dispose();
    }, "disposeAsync");
    wrapper.then = async (onFulfilled, onRejected) => {
      return Promise.resolve(task).then(() => disposeAsync).then(onFulfilled, onRejected);
    };
    disposables.push(this._disposables.push(wrapper));
    return wrapper;
  }
  getEffects() {
    return [...this._disposables].map((dispose) => dispose[symbols.effect]).filter(Boolean);
  }
  _getState() {
    if (this.uid === null) return 4;
    if (this._error) return 3;
    if (this._runner.epoch !== INACTIVE) return 2;
    return 0;
  }
  _updateState(callback) {
    const oldState = this.state;
    this.state = callback() ?? this._getState();
    if (oldState === this.state) return;
    this.context.emit("internal/status", this, oldState);
    if (oldState !== 2 && this.state !== 2) return;
    for (const key of Reflect.ownKeys(this.ctx.reflect.store)) {
      const impl = this.ctx.reflect.store[key];
      if (impl.fiber !== this) continue;
      this.ctx.reflect.notify([impl.name]);
    }
  }
  _checkImpl(name) {
    const impl = this.ctx.reflect._getImpl(name, true);
    if (!impl) return delete this._store[name];
    try {
      if (impl.check && !impl.check.call(getTraceable(this.ctx, impl.value))) {
        return delete this._store[name];
      }
    } catch (error) {
      this.context.emit(impl.fiber.ctx, "internal/error", error);
      return delete this._store[name];
    }
    this._store[name] = impl;
  }
  _refresh() {
    let epoch = false;
    epoch = "";
    for (const [name, inject] of Object.entries(this.inject)) {
      if (!inject.required) continue;
      const impl = this._store[name];
      if (!impl) {
        epoch = INACTIVE;
        break;
      }
      epoch += ":" + impl.fiber.uid;
    }
    this._setEpoch(epoch);
  }
  _setEpoch(epoch) {
    const oldEpoch = this._runner.epoch;
    if (epoch === oldEpoch) return;
    this._runner.epoch = epoch;
    if (this.inertia) return;
    this._updateState(() => {
      if (epoch !== INACTIVE && oldEpoch === INACTIVE) {
        this.inertia = this._reload();
        return 1;
      } else {
        this.inertia = this._unload();
        return 5;
      }
    });
  }
  async _reload() {
    this.store = { ...this._store };
    const oldEpoch = this._runner.epoch;
    try {
      await Promise.resolve();
      await this._execute(this._runner);
    } catch (reason) {
      this.context.emit(this.ctx, "internal/error", reason);
      this._error = reason;
      this._runner.epoch = INACTIVE;
    }
    this._updateState(() => {
      if (this._runner.epoch === oldEpoch) {
        this.inertia = void 0;
      } else {
        this.inertia = this._unload();
        return 5;
      }
    });
  }
  async _unload() {
    await Promise.all(this._disposables.clear().map(async (dispose) => {
      try {
        await composeError(async (info) => {
          await Promise.resolve();
          info.error = new Error();
          await dispose();
        }, this._runner.getOuterStack);
      } catch (reason) {
        this.context.emit(this.ctx, "internal/error", reason);
      }
    }));
    this.store = void 0;
    this._updateState(() => {
      if (this._runner.epoch === INACTIVE) {
        this.inertia = void 0;
      } else {
        this.inertia = this._reload();
        return 1;
      }
    });
  }
  async await() {
    while (this.inertia) {
      await this.inertia;
    }
    if (this._error) throw this._error;
    return this;
  }
  async restart() {
    this.assertActive();
    this._setEpoch(INACTIVE);
    this._refresh();
    await this.await();
  }
  update(config, noSave = false) {
    this.assertActive();
    config = resolveConfig(this.runtime, config);
    this.context.waterfall(this, "internal/update", config, noSave, () => {
      this.config = config;
      this._error = void 0;
      return this.restart();
    });
  }
};
function enhanceError(error) {
  const lines = error.stack.split("\n");
  lines.splice(0, 2, `Error: ${error.message}`);
  error.stack = lines.join("\n");
  return error;
}
__name(enhanceError, "enhanceError");
__name2(enhanceError, "enhanceError");
var RESERVED_WORDS = ["prototype", "then"];
function isSpecialProperty(prop) {
  return typeof prop === "symbol" || RESERVED_WORDS.includes(prop) || parseInt(prop).toString() === prop || prop.startsWith("_");
}
__name(isSpecialProperty, "isSpecialProperty");
__name2(isSpecialProperty, "isSpecialProperty");
var ReflectService = class {
  static {
    __name(this, "ReflectService");
  }
  constructor(ctx) {
    this.ctx = ctx;
    defineProperty4(this, symbols.tracker, {
      property: "ctx",
      noShadow: true
    });
    this.mixin("reflect", ["get", "set", "provide", "accessor", "mixin"]);
    this.mixin("fiber", ["runtime", "effect"]);
    this.mixin("registry", ["inject", "plugin"]);
    this.mixin("events", ["on", "once", "parallel", "emit", "serial", "bail", "waterfall"]);
  }
  ctx;
  static {
    __name2(this, "ReflectService");
  }
  static handler = {
    get: /* @__PURE__ */ __name2((target, prop, ctx) => {
      if (isSpecialProperty(prop)) {
        return Reflect.get(target, prop, ctx);
      }
      if (Reflect.has(target, prop)) {
        return getTraceable(ctx, Reflect.get(target, prop, ctx));
      }
      const error = new Error(`cannot get property "${prop}" without inject`);
      try {
        const def = target.reflect.props[prop];
        if (def?.type === "accessor") {
          return def.get.call(ctx, ctx[symbols.receiver], error);
        }
        if (!ctx.fiber.runtime) return ctx.reflect.get(prop, false);
        return ctx.events.waterfall("internal/get", ctx, prop, error, () => {
          const key = target[symbols.isolate][prop];
          let fiber = (ctx[symbols.shadow] ?? ctx).fiber;
          while (true) {
            const impl = fiber.store?.[prop];
            if (impl) return getTraceable(ctx, impl.value);
            const inject = fiber.inject[prop];
            if (inject) {
              if (!inject.required) return ctx.reflect.get(prop, true);
              error.message = `cannot get required service "${prop}" in inactive context`;
              throw error;
            }
            if (!fiber.runtime) throw error;
            if (fiber.parent[symbols.isolate][prop] !== key) throw error;
            fiber = fiber.parent.fiber;
          }
        });
      } catch (e) {
        throw e === error ? enhanceError(e) : e;
      }
    }, "get"),
    set: /* @__PURE__ */ __name2((target, prop, value, ctx) => {
      if (isSpecialProperty(prop)) {
        return Reflect.set(target, prop, value, ctx);
      }
      const error = new Error(`cannot set property "${prop}" without provide`);
      const def = target.reflect.props[prop];
      if (!def) {
        if (!ctx.fiber.runtime) return Reflect.set(target, prop, value, ctx);
        throw enhanceError(error);
      }
      try {
        if (def.type === "accessor") {
          if (!def.set) return false;
          return def.set.call(ctx, value, ctx[symbols.receiver], error);
        }
        return ctx.events.waterfall("internal/set", ctx, prop, value, error, () => {
          return ctx.reflect.set(prop, value, error);
        });
      } catch (e) {
        throw e === error ? enhanceError(e) : e;
      }
    }, "set"),
    has: /* @__PURE__ */ __name2((target, prop) => {
      if (isSpecialProperty(prop)) {
        return Reflect.has(target, prop);
      }
      if (Reflect.has(target, prop)) return true;
      return !!target.reflect.props[prop];
    }, "has")
  };
  store = /* @__PURE__ */ Object.create(null);
  props = /* @__PURE__ */ Object.create(null);
  get(name, strict = true) {
    return getTraceable(this.ctx, this._getImpl(name, strict)?.value);
  }
  _getImpl(name, strict = true) {
    const key = this.ctx[symbols.isolate][name];
    const impl = key && this.store[key];
    if (!impl) return;
    if (strict && impl.fiber.state !== 2) return;
    return impl;
  }
  set(name, value, error) {
    const key = this.ctx[symbols.isolate][name];
    const impl = this.store[key];
    if (!impl) {
      throw new Error(`cannot set property "${name}" without provide`);
    }
    if (impl.fiber !== this.ctx.fiber) {
      throw new Error(`cannot set property "${name}" in multiple fibers`);
    }
    impl.value = value;
    return true;
  }
  provide(name, value, check) {
    return this.ctx.fiber.effect(() => {
      if (!this.props[name]) {
        this.props[name] ??= { type: "service" };
      } else if (this.props[name].type !== "service") {
        throw new Error(`property "${name}" is already declared as ${this.props[name].type}`);
      }
      this.props[name] = { type: "service" };
      this.ctx.root[symbols.isolate][name] ??= Symbol(name);
      const key = this.ctx[symbols.isolate][name];
      const impl = { name, value, fiber: this.ctx.fiber, check };
      if (this.store[key]) {
        throw new Error(`service "${name}" has been registered at <${this.store[key].fiber.name}>`);
      }
      this.store[key] = impl;
      this.ctx.fiber.store[name] = impl;
      if (this.ctx.fiber.state === 2) {
        this.notify([name]);
      }
      return async () => {
        delete this.store[key];
        const fibers = this.notify([name]);
        await Promise.allSettled(fibers.map((fiber) => fiber.await()));
        delete this.ctx.fiber.store[name];
      };
    }, `ctx.provide(${JSON.stringify(name)})`);
  }
  notify(names, filter = (ctx, name) => ctx[symbols.isolate][name] === this.ctx[symbols.isolate][name]) {
    const fibers = [];
    for (const runtime of this.ctx.registry.values()) {
      for (const fiber of runtime.fibers) {
        let hasUpdate = false;
        for (const name of names) {
          if (!fiber.inject[name]?.required) continue;
          if (!filter(fiber.ctx, name)) continue;
          hasUpdate = true;
          fiber._checkImpl(name);
        }
        if (!hasUpdate) continue;
        fiber._refresh();
        fibers.push(fiber);
      }
    }
    return fibers;
  }
  accessor(name, options) {
    return this.ctx.fiber.effect(() => {
      if (name in this.props) {
        throw new Error(`property "${name}" is already declared as ${this.props[name].type}`);
      }
      this.props[name] = { type: "accessor", ...options };
      return () => delete this.props[name];
    }, `ctx.accessor(${JSON.stringify(name)})`);
  }
  mixin(source, mixins) {
    const self = this;
    return this.ctx.fiber.effect(function* () {
      const entries = Array.isArray(mixins) ? mixins.map((key) => [key, key]) : Object.entries(mixins);
      const getTarget = /* @__PURE__ */ __name2((ctx, error) => {
        return ctx[source];
      }, "getTarget");
      for (const [key, value] of entries) {
        yield self.accessor(value, {
          get(receiver, error) {
            const service = getTarget(this, error);
            if (isNullable2(service)) return service;
            const mixin = receiver ? withProps(receiver, service) : service;
            const value2 = Reflect.get(service, key, mixin);
            if (typeof value2 !== "function") return value2;
            return value2.bind(mixin ?? service);
          },
          set(value2, receiver, error) {
            const service = getTarget(this, error);
            const mixin = receiver ? withProps(receiver, service) : service;
            return Reflect.set(service, key, value2, mixin);
          }
        });
      }
    }, `ctx.mixin(${JSON.stringify(source)})`);
  }
  trace(value) {
    return getTraceable(this.ctx, value);
  }
  bind(callback) {
    return new Proxy(callback, {
      apply: /* @__PURE__ */ __name2((target, thisArg, args) => {
        return Reflect.apply(target, this.trace(thisArg), args.map((arg) => this.trace(arg)));
      }, "apply"),
      construct: /* @__PURE__ */ __name2((target, args, newTarget) => {
        return Reflect.construct(target, args.map((arg) => this.trace(arg)), newTarget);
      }, "construct")
    });
  }
};
function isApplicable(object) {
  return object && typeof object === "object" && typeof object.apply === "function";
}
__name(isApplicable, "isApplicable");
__name2(isApplicable, "isApplicable");
function Inject(name, required = true, config) {
  return function(value, decorator) {
    if (decorator.kind === "class") {
      if (!Object.hasOwn(value, "inject")) {
        defineProperty5(value, "inject", Object.create(Object.getPrototypeOf(value).inject ?? null));
        defineProperty5(value.inject, symbols.checkProto, true);
      }
      value.inject[name] = { required, config };
    } else if (decorator.kind === "method") {
      const inject = (value[symbols.metadata] ??= {}).inject ??= /* @__PURE__ */ Object.create(null);
      inject[name] = { required, config };
      decorator.addInitializer(function() {
        const property = this[symbols.tracker]?.property;
        (this[symbols.initHooks] ??= []).push(() => {
          this.ctx.inject(inject, (ctx) => {
            return value.call(property ? withProps(this, { [property]: ctx }) : this);
          });
        });
      });
    } else {
      throw new Error("@Inject() can only be used on class or class methods");
    }
  };
}
__name(Inject, "Inject");
__name2(Inject, "Inject");
((Inject2) => {
  function resolve(inject, result = /* @__PURE__ */ Object.create(null)) {
    if (!inject) return result;
    if (Array.isArray(inject)) {
      for (const name of inject) {
        result[name] = { required: true };
      }
    } else if (Reflect.has(inject, symbols.checkProto)) {
      Object.assign(result, resolve(Object.getPrototypeOf(inject)), inject);
    } else {
      for (const [name, value] of Object.entries(inject)) {
        result[name] = typeof value === "boolean" ? { required: value } : value;
      }
    }
    return result;
  }
  __name(resolve, "resolve");
  Inject2.resolve = resolve;
  __name2(resolve, "resolve");
})(Inject || (Inject = {}));
var RegistryService = class {
  static {
    __name(this, "RegistryService");
  }
  constructor(ctx) {
    this.ctx = ctx;
    defineProperty5(this, symbols.tracker, {
      property: "ctx",
      noShadow: true
    });
  }
  ctx;
  static {
    __name2(this, "RegistryService");
  }
  _counter = 0;
  _internal = /* @__PURE__ */ new Map();
  get counter() {
    return ++this._counter;
  }
  get size() {
    return this._internal.size;
  }
  resolve(plugin) {
    try {
      if (typeof plugin === "function") return plugin;
      if (isApplicable(plugin)) return plugin.apply;
    } catch {
    }
  }
  get(plugin) {
    const key = this.resolve(plugin);
    return key && this._internal.get(key);
  }
  has(plugin) {
    const key = this.resolve(plugin);
    return !!key && this._internal.has(key);
  }
  delete(plugin) {
    const key = this.resolve(plugin);
    const runtime = key && this._internal.get(key);
    if (!runtime) return;
    this._internal.delete(key);
    for (const fiber of runtime.fibers) {
      fiber.dispose();
    }
    return runtime;
  }
  keys() {
    return this._internal.keys();
  }
  values() {
    return this._internal.values();
  }
  entries() {
    return this._internal.entries();
  }
  forEach(callback) {
    return this._internal.forEach(callback);
  }
  inject(inject, callback) {
    return this.plugin({ inject, apply: callback, name: callback.name });
  }
  plugin(plugin, config, getOuterStack = buildOuterStack()) {
    const callback = this.resolve(plugin);
    if (!callback) throw new Error('invalid plugin, expect function or object with an "apply" method, received ' + typeof plugin);
    this.ctx.fiber.assertActive();
    let runtime = this._internal.get(callback);
    if (!runtime) {
      let name = plugin.name;
      if (name === "apply") name = void 0;
      runtime = { name, callback, fibers: new DisposableList(), Config: plugin.Config };
      this._internal.set(callback, runtime);
    }
    const fiber = new Fiber(this.ctx, config, Inject.resolve(plugin.inject), runtime, getOuterStack);
    const wrapped = Object.create(fiber);
    wrapped.then = (onFulfilled, onRejected) => {
      return fiber.await().then(onFulfilled, onRejected);
    };
    return wrapped;
  }
};
var Context = class _Context {
  static {
    __name(this, "_Context");
  }
  static {
    __name2(this, "Context");
  }
  static effect = symbols.effect;
  static filter = symbols.filter;
  static isolate = symbols.isolate;
  static intercept = symbols.intercept;
  static is(value) {
    return !!value?.[_Context.is];
  }
  static {
    _Context.is[Symbol.toPrimitive] = () => /* @__PURE__ */ Symbol.for("cordis.is");
    _Context.prototype[_Context.is] = true;
  }
  constructor() {
    this[symbols.isolate] = /* @__PURE__ */ Object.create(null);
    this[symbols.intercept] = /* @__PURE__ */ Object.create(null);
    const self = new Proxy(this, ReflectService.handler);
    this.root = self;
    this.baseUrl = void 0;
    this.fiber = new Fiber(self, {}, /* @__PURE__ */ Object.create(null), null, () => []);
    this.reflect = new ReflectService(self);
    this.registry = new RegistryService(self);
    this.events = new EventsService(self);
    this.fiber._disposables.clear();
    return self;
  }
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return `Context <${this.fiber.name}>`;
  }
  extend(meta = {}) {
    const shadow = Reflect.getOwnPropertyDescriptor(this, symbols.shadow)?.value;
    const self = Object.create(getTraceable(this, this));
    for (const prop of Reflect.ownKeys(meta)) {
      Object.defineProperty(self, prop, Reflect.getOwnPropertyDescriptor(meta, prop));
    }
    if (!shadow) return self;
    return Object.assign(Object.create(self), { [symbols.shadow]: shadow });
  }
  isolate(name, label) {
    const shadow = Object.create(this[symbols.isolate]);
    shadow[name] = label ?? Symbol(name);
    return this.extend({ [symbols.isolate]: shadow });
  }
  intercept(name, config) {
    const intercept = Object.create(this[symbols.intercept]);
    intercept[name] = config;
    return this.extend({ [symbols.intercept]: intercept });
  }
};
var Service = class _Service {
  static {
    __name(this, "_Service");
  }
  constructor(ctx, name) {
    this.ctx = ctx;
    name ??= this.constructor["provide"];
    let self = this;
    const tracker = {
      associate: name,
      property: "ctx"
    };
    if (self[symbols.invoke]) {
      self = createCallable(name, joinPrototype(Object.getPrototypeOf(this), Function.prototype), tracker);
    }
    self.ctx = ctx;
    self.name = name;
    defineProperty6(self, symbols.tracker, tracker);
    self.ctx.reflect.provide(name, self, this[symbols.check]);
    return self;
  }
  ctx;
  static {
    __name2(this, "Service");
  }
  static init = symbols.init;
  static check = symbols.check;
  static config = symbols.config;
  static invoke = symbols.invoke;
  static extend = symbols.extend;
  static tracker = symbols.tracker;
  static resolveConfig = symbols.resolveConfig;
  name;
  [symbols.filter](ctx) {
    return ctx[symbols.isolate][this.name] === this.ctx[symbols.isolate][this.name];
  }
  [symbols.extend](props) {
    let self;
    if (this[_Service.invoke]) {
      self = createCallable(this.name, this, this[symbols.tracker]);
    } else {
      self = Object.create(this);
    }
    return Object.assign(self, props);
  }
  [symbols.resolveConfig](base, head) {
    let intercept = this.ctx[Context.intercept];
    const configs = [];
    while (this.name in intercept) {
      if (Object.hasOwn(intercept, this.name)) {
        configs.unshift(intercept[this.name]);
      }
      intercept = Object.getPrototypeOf(intercept);
    }
    if (base) configs.unshift(base);
    if (head) configs.push(head);
    if (this["Config"]?.merge) {
      return this["Config"].merge(...configs);
    } else {
      return Object.assign({}, ...configs);
    }
  }
  static [Symbol.hasInstance](instance) {
    if (!instance) return false;
    let constructor = instance.constructor;
    while (constructor) {
      constructor = constructor.prototype?.constructor;
      if (constructor === this) return true;
      constructor &&= Object.getPrototypeOf(constructor);
    }
    return false;
  }
};

// src/index.ts
import { isBracketed as isBracketed2 } from "@minatojs/sql-utils";

// src/builder.ts
import { Builder, isBracketed } from "@minatojs/sql-utils";
import { Binary, isNullable as isNullable3, Time } from "cosmokit";
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
      $log: /* @__PURE__ */ __name(([left, right]) => isNullable3(right) ? `ln(${this.parseEval(left, "double precision")})` : `(ln(${this.parseEval(left, "double precision")}) / ln(${this.parseEval(right, "double precision")}))`, "$log"),
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
      load: /* @__PURE__ */ __name((value) => isNullable3(value) ? value : +value, "load")
    };
    this.transformers["bigint"] = {
      encode: /* @__PURE__ */ __name((value) => `cast(${value} as text)`, "encode"),
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as bigint)`, "decode"),
      load: /* @__PURE__ */ __name((value) => isNullable3(value) ? value : BigInt(value), "load"),
      dump: /* @__PURE__ */ __name((value) => isNullable3(value) ? value : `${value}`, "dump")
    };
    this.transformers["binary"] = {
      encode: /* @__PURE__ */ __name((value) => `encode(${value}, 'base64')`, "encode"),
      decode: /* @__PURE__ */ __name((value) => `decode(${value}, 'base64')`, "decode"),
      load: /* @__PURE__ */ __name((value) => isNullable3(value) || typeof value === "object" ? value : Binary.fromBase64(value), "load"),
      dump: /* @__PURE__ */ __name((value) => isNullable3(value) || typeof value === "string" ? value : Binary.toBase64(value), "dump")
    };
    this.transformers["date"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as date)`, "decode"),
      load: /* @__PURE__ */ __name((value) => {
        if (isNullable3(value) || typeof value === "object") return value;
        const parsed = new Date(value), date = /* @__PURE__ */ new Date();
        date.setFullYear(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        date.setHours(0, 0, 0, 0);
        return date;
      }, "load"),
      dump: /* @__PURE__ */ __name((value) => isNullable3(value) ? value : formatTime(value), "dump")
    };
    this.transformers["time"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as time)`, "decode"),
      load: /* @__PURE__ */ __name((value) => this.driver.types["time"].load(value), "load"),
      dump: /* @__PURE__ */ __name((value) => this.driver.types["time"].dump(value), "dump")
    };
    this.transformers["timestamp"] = {
      decode: /* @__PURE__ */ __name((value) => `cast(${value} as timestamp)`, "decode"),
      load: /* @__PURE__ */ __name((value) => {
        if (isNullable3(value) || typeof value === "object") return value;
        return new Date(value);
      }, "load"),
      dump: /* @__PURE__ */ __name((value) => isNullable3(value) ? value : formatTime(value), "dump")
    };
  }
  driver;
  tables;
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
import z from "schemastery";
var timeRegex = /(\d+):(\d+):(\d+)(\.(\d+))?/;
function createIndex(keys) {
  return makeArray(keys).map(escapeId).join(", ");
}
__name(createIndex, "createIndex");
var _PostgresDriver_decorators, _init, _a;
_PostgresDriver_decorators = [Inject("logger", false)];
var PostgresDriver = class extends (_a = Driver2) {
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
        this.ctx.logger?.debug(`> %s` + (parameters.length ? `
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
        if (isNullable4(str)) return str;
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
      load: /* @__PURE__ */ __name((value) => isNullable4(value) ? value : Binary2.fromSource(value), "load")
    });
    this.define({
      types: Field2.number,
      dump: /* @__PURE__ */ __name((value) => value, "dump"),
      load: /* @__PURE__ */ __name((value) => isNullable4(value) ? value : +value, "load")
    });
    this.define({
      types: ["bigint"],
      dump: /* @__PURE__ */ __name((value) => isNullable4(value) ? value : value.toString(), "dump"),
      load: /* @__PURE__ */ __name((value) => isNullable4(value) ? value : BigInt(value), "load")
    });
  }
  async stop() {
    await this.postgres.end();
  }
  async query(sql) {
    return await (this.session ?? this.postgres).unsafe(sql).catch((e) => {
      this.ctx.logger?.warn("> %s", sql);
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
        create.push(`${escapeId(key)} ${typedef} ${makeArray(primary).includes(key) || !nullable ? "not null" : "null"}` + (!primary.includes(key) && !isNullable4(initial) ? " DEFAULT " + this.sql.escape(initial, fields[key]) : ""));
      } else if (shouldUpdate) {
        if (column.column_name !== key) rename.push(`RENAME ${escapeId(column.column_name)} TO ${escapeId(key)}`);
        update.push(`ALTER ${escapeId(key)} TYPE ${typedef}`);
        update.push(`ALTER ${escapeId(key)} ${makeArray(primary).includes(key) || !nullable ? "SET" : "DROP"} NOT NULL`);
        if (!isNullable4(initial)) update.push(`ALTER ${escapeId(key)} SET DEFAULT ${this.sql.escape(initial, fields[key])}`);
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
      this.ctx.logger?.info("auto creating table %c", name);
      return this.query(`CREATE TABLE ${escapeId(name)} (${create.join(", ")}, _pg_mtime BIGINT)`);
    }
    const operations = [
      ...create.map((def) => "ADD " + def),
      ...update
    ];
    if (operations.length) {
      this.ctx.logger?.info("auto updating table %c", name);
      if (rename.length) {
        await Promise.all(rename.map((op) => this.query(`ALTER TABLE ${escapeId(name)} ${op}`)));
      }
      await this.query(`ALTER TABLE ${escapeId(name)} ${operations.join(", ")}`);
    }
    const dropKeys = [];
    await this.migrate(name, {
      error: this.ctx.logger?.warn,
      before: /* @__PURE__ */ __name((keys) => keys.every((key) => columns.some((info) => info.column_name === key)), "before"),
      after: /* @__PURE__ */ __name((keys) => dropKeys.push(...keys), "after"),
      finalize: /* @__PURE__ */ __name(async () => {
        if (!dropKeys.length) return;
        this.ctx.logger?.info("auto migrating table %c", name);
        await this.query(`ALTER TABLE ${escapeId(name)} ${dropKeys.map((key) => `DROP ${escapeId(key)}`).join(", ")}`);
      }, "finalize")
    });
  }
  async drop(table) {
    await this.query(`DROP TABLE IF EXISTS ${escapeId(table)} CASCADE`);
  }
  async dropAll() {
    const tables = [...this.tables];
    if (!tables.length) return;
    await this.query(`DROP TABLE IF EXISTS ${tables.map((t) => escapeId(t)).join(",")} CASCADE`);
  }
  async stats() {
    const tables = [...this.tables];
    if (!tables.length) return { size: 0, tables: {} };
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
      return builder.load(data, sel.model);
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
          if (length > 8) this.ctx.logger?.warn(`type ${type}(${length}) exceeds the max supported length`);
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
_init = __decoratorStart(_a);
PostgresDriver = __decorateElement(_init, 0, "PostgresDriver", _PostgresDriver_decorators, PostgresDriver);
__runInitializers(_init, 1, PostgresDriver);
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
var index_default = PostgresDriver;
export {
  PostgresDriver,
  index_default as default
};
