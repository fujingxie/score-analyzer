import cu, { app as Qe, ipcMain as ra, BrowserWindow as na, shell as Du, Menu as ga } from "electron";
import { fileURLToPath as Mu } from "node:url";
import ie from "node:path";
import me from "node:process";
import { promisify as _e, isDeepStrictEqual as wa } from "node:util";
import x from "node:fs";
import nt from "node:crypto";
import Ea from "node:assert";
import uu from "node:os";
import "node:events";
import "node:stream";
const lt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, lu = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), du = 1e6, Lu = (e) => e >= "0" && e <= "9";
function fu(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= du;
  }
  return !1;
}
function Mn(e, t) {
  return lu.has(e) ? !1 : (e && fu(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function Vu(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let s = "", r = "start", l = !1, n = 0;
  for (const i of e) {
    if (n++, l) {
      s += i, l = !1;
      continue;
    }
    if (i === "\\") {
      if (r === "index")
        throw new Error(`Invalid character '${i}' in an index at position ${n}`);
      if (r === "indexEnd")
        throw new Error(`Invalid character '${i}' after an index at position ${n}`);
      l = !0, r = r === "start" ? "property" : r;
      continue;
    }
    switch (i) {
      case ".": {
        if (r === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd") {
          r = "property";
          break;
        }
        if (!Mn(s, t))
          return [];
        s = "", r = "property";
        break;
      }
      case "[": {
        if (r === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd") {
          r = "index";
          break;
        }
        if (r === "property" || r === "start") {
          if ((s || r === "property") && !Mn(s, t))
            return [];
          s = "";
        }
        r = "index";
        break;
      }
      case "]": {
        if (r === "index") {
          if (s === "")
            s = (t.pop() || "") + "[]", r = "property";
          else {
            const a = Number.parseInt(s, 10);
            !Number.isNaN(a) && Number.isFinite(a) && a >= 0 && a <= Number.MAX_SAFE_INTEGER && a <= du && s === String(a) ? t.push(a) : t.push(s), s = "", r = "indexEnd";
          }
          break;
        }
        if (r === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${n}`);
        s += i;
        break;
      }
      default: {
        if (r === "index" && !Lu(i))
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${n}`);
        r === "start" && (r = "property"), s += i;
      }
    }
  }
  switch (l && (s += "\\"), r) {
    case "property": {
      if (!Mn(s, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function gn(e) {
  if (typeof e == "string")
    return Vu(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [s, r] of e.entries()) {
      if (typeof r != "string" && typeof r != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${s}, got ${typeof r}`);
      if (typeof r == "number" && !Number.isFinite(r))
        throw new TypeError(`Path segment at index ${s} must be a finite number, got ${r}`);
      if (lu.has(r))
        return [];
      typeof r == "string" && fu(r) ? t.push(Number.parseInt(r, 10)) : t.push(r);
    }
    return t;
  }
  return [];
}
function ba(e, t, s) {
  if (!lt(e) || typeof t != "string" && !Array.isArray(t))
    return s === void 0 ? e : s;
  const r = gn(t);
  if (r.length === 0)
    return s;
  for (let l = 0; l < r.length; l++) {
    const n = r[l];
    if (e = e[n], e == null) {
      if (l !== r.length - 1)
        return s;
      break;
    }
  }
  return e === void 0 ? s : e;
}
function It(e, t, s) {
  if (!lt(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const r = e, l = gn(t);
  if (l.length === 0)
    return e;
  for (let n = 0; n < l.length; n++) {
    const i = l[n];
    if (n === l.length - 1)
      e[i] = s;
    else if (!lt(e[i])) {
      const u = typeof l[n + 1] == "number";
      e[i] = u ? [] : {};
    }
    e = e[i];
  }
  return r;
}
function Fu(e, t) {
  if (!lt(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const s = gn(t);
  if (s.length === 0)
    return !1;
  for (let r = 0; r < s.length; r++) {
    const l = s[r];
    if (r === s.length - 1)
      return Object.hasOwn(e, l) ? (delete e[l], !0) : !1;
    if (e = e[l], !lt(e))
      return !1;
  }
}
function Ln(e, t) {
  if (!lt(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const s = gn(t);
  if (s.length === 0)
    return !1;
  for (const r of s) {
    if (!lt(e) || !(r in e))
      return !1;
    e = e[r];
  }
  return !0;
}
const Ze = uu.homedir(), sa = uu.tmpdir(), { env: _t } = me, Uu = (e) => {
  const t = ie.join(Ze, "Library");
  return {
    data: ie.join(t, "Application Support", e),
    config: ie.join(t, "Preferences", e),
    cache: ie.join(t, "Caches", e),
    log: ie.join(t, "Logs", e),
    temp: ie.join(sa, e)
  };
}, zu = (e) => {
  const t = _t.APPDATA || ie.join(Ze, "AppData", "Roaming"), s = _t.LOCALAPPDATA || ie.join(Ze, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ie.join(s, e, "Data"),
    config: ie.join(t, e, "Config"),
    cache: ie.join(s, e, "Cache"),
    log: ie.join(s, e, "Log"),
    temp: ie.join(sa, e)
  };
}, Ku = (e) => {
  const t = ie.basename(Ze);
  return {
    data: ie.join(_t.XDG_DATA_HOME || ie.join(Ze, ".local", "share"), e),
    config: ie.join(_t.XDG_CONFIG_HOME || ie.join(Ze, ".config"), e),
    cache: ie.join(_t.XDG_CACHE_HOME || ie.join(Ze, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ie.join(_t.XDG_STATE_HOME || ie.join(Ze, ".local", "state"), e),
    temp: ie.join(sa, t, e)
  };
};
function Gu(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), me.platform === "darwin" ? Uu(e) : me.platform === "win32" ? zu(e) : Ku(e);
}
const Ge = (e, t) => {
  const { onError: s } = t;
  return function(...l) {
    return e.apply(void 0, l).catch(s);
  };
}, Me = (e, t) => {
  const { onError: s } = t;
  return function(...l) {
    try {
      return e.apply(void 0, l);
    } catch (n) {
      return s(n);
    }
  };
}, Hu = 250, He = (e, t) => {
  const { isRetriable: s } = t;
  return function(l) {
    const { timeout: n } = l, i = l.interval ?? Hu, a = Date.now() + n;
    return function u(...d) {
      return e.apply(void 0, d).catch((c) => {
        if (!s(c) || Date.now() >= a)
          throw c;
        const g = Math.round(i * Math.random());
        return g > 0 ? new Promise(($) => setTimeout($, g)).then(() => u.apply(void 0, d)) : u.apply(void 0, d);
      });
    };
  };
}, Je = (e, t) => {
  const { isRetriable: s } = t;
  return function(l) {
    const { timeout: n } = l, i = Date.now() + n;
    return function(...u) {
      for (; ; )
        try {
          return e.apply(void 0, u);
        } catch (d) {
          if (!s(d) || Date.now() >= i)
            throw d;
          continue;
        }
    };
  };
}, $t = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!$t.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !Ju && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!$t.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!$t.isNodeError(e))
      throw e;
    if (!$t.isChangeErrorOk(e))
      throw e;
  }
}, Tt = {
  onError: $t.onChangeError
}, Pe = {
  onError: () => {
  }
}, Ju = me.getuid ? !me.getuid() : !1, $e = {
  isRetriable: $t.isRetriableError
}, ge = {
  attempt: {
    /* ASYNC */
    chmod: Ge(_e(x.chmod), Tt),
    chown: Ge(_e(x.chown), Tt),
    close: Ge(_e(x.close), Pe),
    fsync: Ge(_e(x.fsync), Pe),
    mkdir: Ge(_e(x.mkdir), Pe),
    realpath: Ge(_e(x.realpath), Pe),
    stat: Ge(_e(x.stat), Pe),
    unlink: Ge(_e(x.unlink), Pe),
    /* SYNC */
    chmodSync: Me(x.chmodSync, Tt),
    chownSync: Me(x.chownSync, Tt),
    closeSync: Me(x.closeSync, Pe),
    existsSync: Me(x.existsSync, Pe),
    fsyncSync: Me(x.fsync, Pe),
    mkdirSync: Me(x.mkdirSync, Pe),
    realpathSync: Me(x.realpathSync, Pe),
    statSync: Me(x.statSync, Pe),
    unlinkSync: Me(x.unlinkSync, Pe)
  },
  retry: {
    /* ASYNC */
    close: He(_e(x.close), $e),
    fsync: He(_e(x.fsync), $e),
    open: He(_e(x.open), $e),
    readFile: He(_e(x.readFile), $e),
    rename: He(_e(x.rename), $e),
    stat: He(_e(x.stat), $e),
    write: He(_e(x.write), $e),
    writeFile: He(_e(x.writeFile), $e),
    /* SYNC */
    closeSync: Je(x.closeSync, $e),
    fsyncSync: Je(x.fsyncSync, $e),
    openSync: Je(x.openSync, $e),
    readFileSync: Je(x.readFileSync, $e),
    renameSync: Je(x.renameSync, $e),
    statSync: Je(x.statSync, $e),
    writeSync: Je(x.writeSync, $e),
    writeFileSync: Je(x.writeFileSync, $e)
  }
}, Bu = "utf8", Sa = 438, Xu = 511, Wu = {}, Yu = me.geteuid ? me.geteuid() : -1, Zu = me.getegid ? me.getegid() : -1, Qu = 1e3, xu = !!me.getuid;
me.getuid && me.getuid();
const Ra = 128, el = (e) => e instanceof Error && "code" in e, Pa = (e) => typeof e == "string", Vn = (e) => e === void 0, tl = me.platform === "linux", hu = me.platform === "win32", aa = ["SIGHUP", "SIGINT", "SIGTERM"];
hu || aa.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
tl && aa.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class rl {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const s of this.callbacks)
          s();
        t && (hu && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? me.kill(me.pid, "SIGTERM") : me.kill(me.pid, t));
      }
    }, this.hook = () => {
      me.once("exit", () => this.exit());
      for (const t of aa)
        try {
          me.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const nl = new rl(), sl = nl.register, we = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), l = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${l}`;
  },
  get: (e, t, s = !0) => {
    const r = we.truncate(t(e));
    return r in we.store ? we.get(e, t, s) : (we.store[r] = s, [r, () => delete we.store[r]]);
  },
  purge: (e) => {
    we.store[e] && (delete we.store[e], ge.attempt.unlink(e));
  },
  purgeSync: (e) => {
    we.store[e] && (delete we.store[e], ge.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in we.store)
      we.purgeSync(e);
  },
  truncate: (e) => {
    const t = ie.basename(e);
    if (t.length <= Ra)
      return e;
    const s = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!s)
      return e;
    const r = t.length - Ra;
    return `${e.slice(0, -t.length)}${s[1]}${s[2].slice(0, -r)}${s[3]}`;
  }
};
sl(we.purgeSyncAll);
function mu(e, t, s = Wu) {
  if (Pa(s))
    return mu(e, t, { encoding: s });
  const l = { timeout: s.timeout ?? Qu };
  let n = null, i = null, a = null;
  try {
    const u = ge.attempt.realpathSync(e), d = !!u;
    e = u || e, [i, n] = we.get(e, s.tmpCreate || we.create, s.tmpPurge !== !1);
    const c = xu && Vn(s.chown), g = Vn(s.mode);
    if (d && (c || g)) {
      const _ = ge.attempt.statSync(e);
      _ && (s = { ...s }, c && (s.chown = { uid: _.uid, gid: _.gid }), g && (s.mode = _.mode));
    }
    if (!d) {
      const _ = ie.dirname(e);
      ge.attempt.mkdirSync(_, {
        mode: Xu,
        recursive: !0
      });
    }
    a = ge.retry.openSync(l)(i, "w", s.mode || Sa), s.tmpCreated && s.tmpCreated(i), Pa(t) ? ge.retry.writeSync(l)(a, t, 0, s.encoding || Bu) : Vn(t) || ge.retry.writeSync(l)(a, t, 0, t.length, 0), s.fsync !== !1 && (s.fsyncWait !== !1 ? ge.retry.fsyncSync(l)(a) : ge.attempt.fsync(a)), ge.retry.closeSync(l)(a), a = null, s.chown && (s.chown.uid !== Yu || s.chown.gid !== Zu) && ge.attempt.chownSync(i, s.chown.uid, s.chown.gid), s.mode && s.mode !== Sa && ge.attempt.chmodSync(i, s.mode);
    try {
      ge.retry.renameSync(l)(i, e);
    } catch (_) {
      if (!el(_) || _.code !== "ENAMETOOLONG")
        throw _;
      ge.retry.renameSync(l)(i, we.truncate(e));
    }
    n(), i = null;
  } finally {
    a && ge.attempt.closeSync(a), i && we.purge(i);
  }
}
function pu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var jt = { exports: {} }, Fn = {}, Le = {}, st = {}, Un = {}, zn = {}, Kn = {}, Na;
function yn() {
  return Na || (Na = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class s extends t {
      constructor(o) {
        if (super(), !e.IDENTIFIER.test(o))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = s;
    class r extends t {
      constructor(o) {
        super(), this._items = typeof o == "string" ? [o] : o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const o = this._items[0];
        return o === "" || o === '""';
      }
      get str() {
        var o;
        return (o = this._str) !== null && o !== void 0 ? o : this._str = this._items.reduce((p, w) => `${p}${w}`, "");
      }
      get names() {
        var o;
        return (o = this._names) !== null && o !== void 0 ? o : this._names = this._items.reduce((p, w) => (w instanceof s && (p[w.str] = (p[w.str] || 0) + 1), p), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function l(y, ...o) {
      const p = [y[0]];
      let w = 0;
      for (; w < o.length; )
        a(p, o[w]), p.push(y[++w]);
      return new r(p);
    }
    e._ = l;
    const n = new r("+");
    function i(y, ...o) {
      const p = [$(y[0])];
      let w = 0;
      for (; w < o.length; )
        p.push(n), a(p, o[w]), p.push(n, $(y[++w]));
      return u(p), new r(p);
    }
    e.str = i;
    function a(y, o) {
      o instanceof r ? y.push(...o._items) : o instanceof s ? y.push(o) : y.push(g(o));
    }
    e.addCodeArg = a;
    function u(y) {
      let o = 1;
      for (; o < y.length - 1; ) {
        if (y[o] === n) {
          const p = d(y[o - 1], y[o + 1]);
          if (p !== void 0) {
            y.splice(o - 1, 3, p);
            continue;
          }
          y[o++] = "+";
        }
        o++;
      }
    }
    function d(y, o) {
      if (o === '""')
        return y;
      if (y === '""')
        return o;
      if (typeof y == "string")
        return o instanceof s || y[y.length - 1] !== '"' ? void 0 : typeof o != "string" ? `${y.slice(0, -1)}${o}"` : o[0] === '"' ? y.slice(0, -1) + o.slice(1) : void 0;
      if (typeof o == "string" && o[0] === '"' && !(y instanceof s))
        return `"${y}${o.slice(1)}`;
    }
    function c(y, o) {
      return o.emptyStr() ? y : y.emptyStr() ? o : i`${y}${o}`;
    }
    e.strConcat = c;
    function g(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : $(Array.isArray(y) ? y.join(",") : y);
    }
    function _(y) {
      return new r($(y));
    }
    e.stringify = _;
    function $(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = $;
    function b(y) {
      return typeof y == "string" && e.IDENTIFIER.test(y) ? new r(`.${y}`) : l`[${y}]`;
    }
    e.getProperty = b;
    function E(y) {
      if (typeof y == "string" && e.IDENTIFIER.test(y))
        return new r(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    e.getEsmExportName = E;
    function f(y) {
      return new r(y.toString());
    }
    e.regexpCode = f;
  })(Kn)), Kn;
}
var Gn = {}, Oa;
function Ia() {
  return Oa || (Oa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = yn();
    class s extends Error {
      constructor(d) {
        super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
      }
    }
    var r;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class l {
      constructor({ prefixes: d, parent: c } = {}) {
        this._names = {}, this._prefixes = d, this._parent = c;
      }
      toName(d) {
        return d instanceof t.Name ? d : this.name(d);
      }
      name(d) {
        return new t.Name(this._newName(d));
      }
      _newName(d) {
        const c = this._names[d] || this._nameGroup(d);
        return `${d}${c.index++}`;
      }
      _nameGroup(d) {
        var c, g;
        if (!((g = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || g === void 0) && g.has(d) || this._prefixes && !this._prefixes.has(d))
          throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
        return this._names[d] = { prefix: d, index: 0 };
      }
    }
    e.Scope = l;
    class n extends t.Name {
      constructor(d, c) {
        super(c), this.prefix = d;
      }
      setValue(d, { property: c, itemIndex: g }) {
        this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${g}]`;
      }
    }
    e.ValueScopeName = n;
    const i = (0, t._)`\n`;
    class a extends l {
      constructor(d) {
        super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(d) {
        return new n(d, this._newName(d));
      }
      value(d, c) {
        var g;
        if (c.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const _ = this.toName(d), { prefix: $ } = _, b = (g = c.key) !== null && g !== void 0 ? g : c.ref;
        let E = this._values[$];
        if (E) {
          const o = E.get(b);
          if (o)
            return o;
        } else
          E = this._values[$] = /* @__PURE__ */ new Map();
        E.set(b, _);
        const f = this._scope[$] || (this._scope[$] = []), y = f.length;
        return f[y] = c.ref, _.setValue(c, { property: $, itemIndex: y }), _;
      }
      getValue(d, c) {
        const g = this._values[d];
        if (g)
          return g.get(c);
      }
      scopeRefs(d, c = this._values) {
        return this._reduceValues(c, (g) => {
          if (g.scopePath === void 0)
            throw new Error(`CodeGen: name "${g}" has no value`);
          return (0, t._)`${d}${g.scopePath}`;
        });
      }
      scopeCode(d = this._values, c, g) {
        return this._reduceValues(d, (_) => {
          if (_.value === void 0)
            throw new Error(`CodeGen: name "${_}" has no value`);
          return _.value.code;
        }, c, g);
      }
      _reduceValues(d, c, g = {}, _) {
        let $ = t.nil;
        for (const b in d) {
          const E = d[b];
          if (!E)
            continue;
          const f = g[b] = g[b] || /* @__PURE__ */ new Map();
          E.forEach((y) => {
            if (f.has(y))
              return;
            f.set(y, r.Started);
            let o = c(y);
            if (o) {
              const p = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              $ = (0, t._)`${$}${p} ${y} = ${o};${this.opts._n}`;
            } else if (o = _?.(y))
              $ = (0, t._)`${$}${o}${this.opts._n}`;
            else
              throw new s(y);
            f.set(y, r.Completed);
          });
        }
        return $;
      }
    }
    e.ValueScope = a;
  })(Gn)), Gn;
}
var Ta;
function ee() {
  return Ta || (Ta = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = yn(), s = Ia();
    var r = yn();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var l = Ia();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(h, S) {
        return this;
      }
    }
    class i extends n {
      constructor(h, S, j) {
        super(), this.varKind = h, this.name = S, this.rhs = j;
      }
      render({ es5: h, _n: S }) {
        const j = h ? s.varKinds.var : this.varKind, K = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${j} ${this.name}${K};` + S;
      }
      optimizeNames(h, S) {
        if (h[this.name.str])
          return this.rhs && (this.rhs = M(this.rhs, h, S)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class a extends n {
      constructor(h, S, j) {
        super(), this.lhs = h, this.rhs = S, this.sideEffects = j;
      }
      render({ _n: h }) {
        return `${this.lhs} = ${this.rhs};` + h;
      }
      optimizeNames(h, S) {
        if (!(this.lhs instanceof t.Name && !h[this.lhs.str] && !this.sideEffects))
          return this.rhs = M(this.rhs, h, S), this;
      }
      get names() {
        const h = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return z(h, this.rhs);
      }
    }
    class u extends a {
      constructor(h, S, j, K) {
        super(h, j, K), this.op = S;
      }
      render({ _n: h }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + h;
      }
    }
    class d extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `${this.label}:` + h;
      }
    }
    class c extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `break${this.label ? ` ${this.label}` : ""};` + h;
      }
    }
    class g extends n {
      constructor(h) {
        super(), this.error = h;
      }
      render({ _n: h }) {
        return `throw ${this.error};` + h;
      }
      get names() {
        return this.error.names;
      }
    }
    class _ extends n {
      constructor(h) {
        super(), this.code = h;
      }
      render({ _n: h }) {
        return `${this.code};` + h;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(h, S) {
        return this.code = M(this.code, h, S), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class $ extends n {
      constructor(h = []) {
        super(), this.nodes = h;
      }
      render(h) {
        return this.nodes.reduce((S, j) => S + j.render(h), "");
      }
      optimizeNodes() {
        const { nodes: h } = this;
        let S = h.length;
        for (; S--; ) {
          const j = h[S].optimizeNodes();
          Array.isArray(j) ? h.splice(S, 1, ...j) : j ? h[S] = j : h.splice(S, 1);
        }
        return h.length > 0 ? this : void 0;
      }
      optimizeNames(h, S) {
        const { nodes: j } = this;
        let K = j.length;
        for (; K--; ) {
          const H = j[K];
          H.optimizeNames(h, S) || (F(h, H.names), j.splice(K, 1));
        }
        return j.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((h, S) => U(h, S.names), {});
      }
    }
    class b extends $ {
      render(h) {
        return "{" + h._n + super.render(h) + "}" + h._n;
      }
    }
    class E extends $ {
    }
    class f extends b {
    }
    f.kind = "else";
    class y extends b {
      constructor(h, S) {
        super(S), this.condition = h;
      }
      render(h) {
        let S = `if(${this.condition})` + super.render(h);
        return this.else && (S += "else " + this.else.render(h)), S;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const h = this.condition;
        if (h === !0)
          return this.nodes;
        let S = this.else;
        if (S) {
          const j = S.optimizeNodes();
          S = this.else = Array.isArray(j) ? new f(j) : j;
        }
        if (S)
          return h === !1 ? S instanceof y ? S : S.nodes : this.nodes.length ? this : new y(X(h), S instanceof y ? [S] : S.nodes);
        if (!(h === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(h, S) {
        var j;
        if (this.else = (j = this.else) === null || j === void 0 ? void 0 : j.optimizeNames(h, S), !!(super.optimizeNames(h, S) || this.else))
          return this.condition = M(this.condition, h, S), this;
      }
      get names() {
        const h = super.names;
        return z(h, this.condition), this.else && U(h, this.else.names), h;
      }
    }
    y.kind = "if";
    class o extends b {
    }
    o.kind = "for";
    class p extends o {
      constructor(h) {
        super(), this.iteration = h;
      }
      render(h) {
        return `for(${this.iteration})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iteration = M(this.iteration, h, S), this;
      }
      get names() {
        return U(super.names, this.iteration.names);
      }
    }
    class w extends o {
      constructor(h, S, j, K) {
        super(), this.varKind = h, this.name = S, this.from = j, this.to = K;
      }
      render(h) {
        const S = h.es5 ? s.varKinds.var : this.varKind, { name: j, from: K, to: H } = this;
        return `for(${S} ${j}=${K}; ${j}<${H}; ${j}++)` + super.render(h);
      }
      get names() {
        const h = z(super.names, this.from);
        return z(h, this.to);
      }
    }
    class m extends o {
      constructor(h, S, j, K) {
        super(), this.loop = h, this.varKind = S, this.name = j, this.iterable = K;
      }
      render(h) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iterable = M(this.iterable, h, S), this;
      }
      get names() {
        return U(super.names, this.iterable.names);
      }
    }
    class v extends b {
      constructor(h, S, j) {
        super(), this.name = h, this.args = S, this.async = j;
      }
      render(h) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(h);
      }
    }
    v.kind = "func";
    class R extends $ {
      render(h) {
        return "return " + super.render(h);
      }
    }
    R.kind = "return";
    class T extends b {
      render(h) {
        let S = "try" + super.render(h);
        return this.catch && (S += this.catch.render(h)), this.finally && (S += this.finally.render(h)), S;
      }
      optimizeNodes() {
        var h, S;
        return super.optimizeNodes(), (h = this.catch) === null || h === void 0 || h.optimizeNodes(), (S = this.finally) === null || S === void 0 || S.optimizeNodes(), this;
      }
      optimizeNames(h, S) {
        var j, K;
        return super.optimizeNames(h, S), (j = this.catch) === null || j === void 0 || j.optimizeNames(h, S), (K = this.finally) === null || K === void 0 || K.optimizeNames(h, S), this;
      }
      get names() {
        const h = super.names;
        return this.catch && U(h, this.catch.names), this.finally && U(h, this.finally.names), h;
      }
    }
    class C extends b {
      constructor(h) {
        super(), this.error = h;
      }
      render(h) {
        return `catch(${this.error})` + super.render(h);
      }
    }
    C.kind = "catch";
    class V extends b {
      render(h) {
        return "finally" + super.render(h);
      }
    }
    V.kind = "finally";
    class D {
      constructor(h, S = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...S, _n: S.lines ? `
` : "" }, this._extScope = h, this._scope = new s.Scope({ parent: h }), this._nodes = [new E()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(h) {
        return this._scope.name(h);
      }
      // reserves unique name in the external scope
      scopeName(h) {
        return this._extScope.name(h);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(h, S) {
        const j = this._extScope.value(h, S);
        return (this._values[j.prefix] || (this._values[j.prefix] = /* @__PURE__ */ new Set())).add(j), j;
      }
      getScopeValue(h, S) {
        return this._extScope.getValue(h, S);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(h) {
        return this._extScope.scopeRefs(h, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(h, S, j, K) {
        const H = this._scope.toName(S);
        return j !== void 0 && K && (this._constants[H.str] = j), this._leafNode(new i(h, H, j)), H;
      }
      // `const` declaration (`var` in es5 mode)
      const(h, S, j) {
        return this._def(s.varKinds.const, h, S, j);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(h, S, j) {
        return this._def(s.varKinds.let, h, S, j);
      }
      // `var` declaration with optional assignment
      var(h, S, j) {
        return this._def(s.varKinds.var, h, S, j);
      }
      // assignment code
      assign(h, S, j) {
        return this._leafNode(new a(h, S, j));
      }
      // `+=` code
      add(h, S) {
        return this._leafNode(new u(h, e.operators.ADD, S));
      }
      // appends passed SafeExpr to code or executes Block
      code(h) {
        return typeof h == "function" ? h() : h !== t.nil && this._leafNode(new _(h)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...h) {
        const S = ["{"];
        for (const [j, K] of h)
          S.length > 1 && S.push(","), S.push(j), (j !== K || this.opts.es5) && (S.push(":"), (0, t.addCodeArg)(S, K));
        return S.push("}"), new t._Code(S);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(h, S, j) {
        if (this._blockNode(new y(h)), S && j)
          this.code(S).else().code(j).endIf();
        else if (S)
          this.code(S).endIf();
        else if (j)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(h) {
        return this._elseNode(new y(h));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new f());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, f);
      }
      _for(h, S) {
        return this._blockNode(h), S && this.code(S).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(h, S) {
        return this._for(new p(h), S);
      }
      // `for` statement for a range of values
      forRange(h, S, j, K, H = this.opts.es5 ? s.varKinds.var : s.varKinds.let) {
        const Q = this._scope.toName(h);
        return this._for(new w(H, Q, S, j), () => K(Q));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(h, S, j, K = s.varKinds.const) {
        const H = this._scope.toName(h);
        if (this.opts.es5) {
          const Q = S instanceof t.Name ? S : this.var("_arr", S);
          return this.forRange("_i", 0, (0, t._)`${Q}.length`, (Z) => {
            this.var(H, (0, t._)`${Q}[${Z}]`), j(H);
          });
        }
        return this._for(new m("of", K, H, S), () => j(H));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(h, S, j, K = this.opts.es5 ? s.varKinds.var : s.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(h, (0, t._)`Object.keys(${S})`, j);
        const H = this._scope.toName(h);
        return this._for(new m("in", K, H, S), () => j(H));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(o);
      }
      // `label` statement
      label(h) {
        return this._leafNode(new d(h));
      }
      // `break` statement
      break(h) {
        return this._leafNode(new c(h));
      }
      // `return` statement
      return(h) {
        const S = new R();
        if (this._blockNode(S), this.code(h), S.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(R);
      }
      // `try` statement
      try(h, S, j) {
        if (!S && !j)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const K = new T();
        if (this._blockNode(K), this.code(h), S) {
          const H = this.name("e");
          this._currNode = K.catch = new C(H), S(H);
        }
        return j && (this._currNode = K.finally = new V(), this.code(j)), this._endBlockNode(C, V);
      }
      // `throw` statement
      throw(h) {
        return this._leafNode(new g(h));
      }
      // start self-balancing block
      block(h, S) {
        return this._blockStarts.push(this._nodes.length), h && this.code(h).endBlock(S), this;
      }
      // end the current self-balancing block
      endBlock(h) {
        const S = this._blockStarts.pop();
        if (S === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const j = this._nodes.length - S;
        if (j < 0 || h !== void 0 && j !== h)
          throw new Error(`CodeGen: wrong number of nodes: ${j} vs ${h} expected`);
        return this._nodes.length = S, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(h, S = t.nil, j, K) {
        return this._blockNode(new v(h, S, j)), K && this.code(K).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(v);
      }
      optimize(h = 1) {
        for (; h-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(h) {
        return this._currNode.nodes.push(h), this;
      }
      _blockNode(h) {
        this._currNode.nodes.push(h), this._nodes.push(h);
      }
      _endBlockNode(h, S) {
        const j = this._currNode;
        if (j instanceof h || S && j instanceof S)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${S ? `${h.kind}/${S.kind}` : h.kind}"`);
      }
      _elseNode(h) {
        const S = this._currNode;
        if (!(S instanceof y))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = S.else = h, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const h = this._nodes;
        return h[h.length - 1];
      }
      set _currNode(h) {
        const S = this._nodes;
        S[S.length - 1] = h;
      }
    }
    e.CodeGen = D;
    function U(O, h) {
      for (const S in h)
        O[S] = (O[S] || 0) + (h[S] || 0);
      return O;
    }
    function z(O, h) {
      return h instanceof t._CodeOrName ? U(O, h.names) : O;
    }
    function M(O, h, S) {
      if (O instanceof t.Name)
        return j(O);
      if (!K(O))
        return O;
      return new t._Code(O._items.reduce((H, Q) => (Q instanceof t.Name && (Q = j(Q)), Q instanceof t._Code ? H.push(...Q._items) : H.push(Q), H), []));
      function j(H) {
        const Q = S[H.str];
        return Q === void 0 || h[H.str] !== 1 ? H : (delete h[H.str], Q);
      }
      function K(H) {
        return H instanceof t._Code && H._items.some((Q) => Q instanceof t.Name && h[Q.str] === 1 && S[Q.str] !== void 0);
      }
    }
    function F(O, h) {
      for (const S in h)
        O[S] = (O[S] || 0) - (h[S] || 0);
    }
    function X(O) {
      return typeof O == "boolean" || typeof O == "number" || O === null ? !O : (0, t._)`!${A(O)}`;
    }
    e.not = X;
    const B = N(e.operators.AND);
    function J(...O) {
      return O.reduce(B);
    }
    e.and = J;
    const Y = N(e.operators.OR);
    function k(...O) {
      return O.reduce(Y);
    }
    e.or = k;
    function N(O) {
      return (h, S) => h === t.nil ? S : S === t.nil ? h : (0, t._)`${A(h)} ${O} ${A(S)}`;
    }
    function A(O) {
      return O instanceof t.Name ? O : (0, t._)`(${O})`;
    }
  })(zn)), zn;
}
var te = {}, ja;
function se() {
  if (ja) return te;
  ja = 1, Object.defineProperty(te, "__esModule", { value: !0 }), te.checkStrictMode = te.getErrorPath = te.Type = te.useFunc = te.setEvaluated = te.evaluatedPropsToName = te.mergeEvaluated = te.eachItem = te.unescapeJsonPointer = te.escapeJsonPointer = te.escapeFragment = te.unescapeFragment = te.schemaRefOrVal = te.schemaHasRulesButRef = te.schemaHasRules = te.checkUnknownRules = te.alwaysValidSchema = te.toHash = void 0;
  const e = ee(), t = yn();
  function s(m) {
    const v = {};
    for (const R of m)
      v[R] = !0;
    return v;
  }
  te.toHash = s;
  function r(m, v) {
    return typeof v == "boolean" ? v : Object.keys(v).length === 0 ? !0 : (l(m, v), !n(v, m.self.RULES.all));
  }
  te.alwaysValidSchema = r;
  function l(m, v = m.schema) {
    const { opts: R, self: T } = m;
    if (!R.strictSchema || typeof v == "boolean")
      return;
    const C = T.RULES.keywords;
    for (const V in v)
      C[V] || w(m, `unknown keyword: "${V}"`);
  }
  te.checkUnknownRules = l;
  function n(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const R in m)
      if (v[R])
        return !0;
    return !1;
  }
  te.schemaHasRules = n;
  function i(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const R in m)
      if (R !== "$ref" && v.all[R])
        return !0;
    return !1;
  }
  te.schemaHasRulesButRef = i;
  function a({ topSchemaRef: m, schemaPath: v }, R, T, C) {
    if (!C) {
      if (typeof R == "number" || typeof R == "boolean")
        return R;
      if (typeof R == "string")
        return (0, e._)`${R}`;
    }
    return (0, e._)`${m}${v}${(0, e.getProperty)(T)}`;
  }
  te.schemaRefOrVal = a;
  function u(m) {
    return g(decodeURIComponent(m));
  }
  te.unescapeFragment = u;
  function d(m) {
    return encodeURIComponent(c(m));
  }
  te.escapeFragment = d;
  function c(m) {
    return typeof m == "number" ? `${m}` : m.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  te.escapeJsonPointer = c;
  function g(m) {
    return m.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  te.unescapeJsonPointer = g;
  function _(m, v) {
    if (Array.isArray(m))
      for (const R of m)
        v(R);
    else
      v(m);
  }
  te.eachItem = _;
  function $({ mergeNames: m, mergeToName: v, mergeValues: R, resultToName: T }) {
    return (C, V, D, U) => {
      const z = D === void 0 ? V : D instanceof e.Name ? (V instanceof e.Name ? m(C, V, D) : v(C, V, D), D) : V instanceof e.Name ? (v(C, D, V), V) : R(V, D);
      return U === e.Name && !(z instanceof e.Name) ? T(C, z) : z;
    };
  }
  te.mergeEvaluated = {
    props: $({
      mergeNames: (m, v, R) => m.if((0, e._)`${R} !== true && ${v} !== undefined`, () => {
        m.if((0, e._)`${v} === true`, () => m.assign(R, !0), () => m.assign(R, (0, e._)`${R} || {}`).code((0, e._)`Object.assign(${R}, ${v})`));
      }),
      mergeToName: (m, v, R) => m.if((0, e._)`${R} !== true`, () => {
        v === !0 ? m.assign(R, !0) : (m.assign(R, (0, e._)`${R} || {}`), E(m, R, v));
      }),
      mergeValues: (m, v) => m === !0 ? !0 : { ...m, ...v },
      resultToName: b
    }),
    items: $({
      mergeNames: (m, v, R) => m.if((0, e._)`${R} !== true && ${v} !== undefined`, () => m.assign(R, (0, e._)`${v} === true ? true : ${R} > ${v} ? ${R} : ${v}`)),
      mergeToName: (m, v, R) => m.if((0, e._)`${R} !== true`, () => m.assign(R, v === !0 ? !0 : (0, e._)`${R} > ${v} ? ${R} : ${v}`)),
      mergeValues: (m, v) => m === !0 ? !0 : Math.max(m, v),
      resultToName: (m, v) => m.var("items", v)
    })
  };
  function b(m, v) {
    if (v === !0)
      return m.var("props", !0);
    const R = m.var("props", (0, e._)`{}`);
    return v !== void 0 && E(m, R, v), R;
  }
  te.evaluatedPropsToName = b;
  function E(m, v, R) {
    Object.keys(R).forEach((T) => m.assign((0, e._)`${v}${(0, e.getProperty)(T)}`, !0));
  }
  te.setEvaluated = E;
  const f = {};
  function y(m, v) {
    return m.scopeValue("func", {
      ref: v,
      code: f[v.code] || (f[v.code] = new t._Code(v.code))
    });
  }
  te.useFunc = y;
  var o;
  (function(m) {
    m[m.Num = 0] = "Num", m[m.Str = 1] = "Str";
  })(o || (te.Type = o = {}));
  function p(m, v, R) {
    if (m instanceof e.Name) {
      const T = v === o.Num;
      return R ? T ? (0, e._)`"[" + ${m} + "]"` : (0, e._)`"['" + ${m} + "']"` : T ? (0, e._)`"/" + ${m}` : (0, e._)`"/" + ${m}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return R ? (0, e.getProperty)(m).toString() : "/" + c(m);
  }
  te.getErrorPath = p;
  function w(m, v, R = m.opts.strictSchema) {
    if (R) {
      if (v = `strict mode: ${v}`, R === !0)
        throw new Error(v);
      m.self.logger.warn(v);
    }
  }
  return te.checkStrictMode = w, te;
}
var At = {}, Aa;
function Ae() {
  if (Aa) return At;
  Aa = 1, Object.defineProperty(At, "__esModule", { value: !0 });
  const e = ee(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return At.default = t, At;
}
var ka;
function wn() {
  return ka || (ka = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = ee(), s = se(), r = Ae();
    e.keywordError = {
      message: ({ keyword: f }) => (0, t.str)`must pass "${f}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: f, schemaType: y }) => y ? (0, t.str)`"${f}" keyword must be ${y} ($data)` : (0, t.str)`"${f}" keyword is invalid ($data)`
    };
    function l(f, y = e.keywordError, o, p) {
      const { it: w } = f, { gen: m, compositeRule: v, allErrors: R } = w, T = g(f, y, o);
      p ?? (v || R) ? u(m, T) : d(w, (0, t._)`[${T}]`);
    }
    e.reportError = l;
    function n(f, y = e.keywordError, o) {
      const { it: p } = f, { gen: w, compositeRule: m, allErrors: v } = p, R = g(f, y, o);
      u(w, R), m || v || d(p, r.default.vErrors);
    }
    e.reportExtraError = n;
    function i(f, y) {
      f.assign(r.default.errors, y), f.if((0, t._)`${r.default.vErrors} !== null`, () => f.if(y, () => f.assign((0, t._)`${r.default.vErrors}.length`, y), () => f.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function a({ gen: f, keyword: y, schemaValue: o, data: p, errsCount: w, it: m }) {
      if (w === void 0)
        throw new Error("ajv implementation error");
      const v = f.name("err");
      f.forRange("i", w, r.default.errors, (R) => {
        f.const(v, (0, t._)`${r.default.vErrors}[${R}]`), f.if((0, t._)`${v}.instancePath === undefined`, () => f.assign((0, t._)`${v}.instancePath`, (0, t.strConcat)(r.default.instancePath, m.errorPath))), f.assign((0, t._)`${v}.schemaPath`, (0, t.str)`${m.errSchemaPath}/${y}`), m.opts.verbose && (f.assign((0, t._)`${v}.schema`, o), f.assign((0, t._)`${v}.data`, p));
      });
    }
    e.extendErrors = a;
    function u(f, y) {
      const o = f.const("err", y);
      f.if((0, t._)`${r.default.vErrors} === null`, () => f.assign(r.default.vErrors, (0, t._)`[${o}]`), (0, t._)`${r.default.vErrors}.push(${o})`), f.code((0, t._)`${r.default.errors}++`);
    }
    function d(f, y) {
      const { gen: o, validateName: p, schemaEnv: w } = f;
      w.$async ? o.throw((0, t._)`new ${f.ValidationError}(${y})`) : (o.assign((0, t._)`${p}.errors`, y), o.return(!1));
    }
    const c = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function g(f, y, o) {
      const { createErrors: p } = f.it;
      return p === !1 ? (0, t._)`{}` : _(f, y, o);
    }
    function _(f, y, o = {}) {
      const { gen: p, it: w } = f, m = [
        $(w, o),
        b(f, o)
      ];
      return E(f, y, m), p.object(...m);
    }
    function $({ errorPath: f }, { instancePath: y }) {
      const o = y ? (0, t.str)`${f}${(0, s.getErrorPath)(y, s.Type.Str)}` : f;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, o)];
    }
    function b({ keyword: f, it: { errSchemaPath: y } }, { schemaPath: o, parentSchema: p }) {
      let w = p ? y : (0, t.str)`${y}/${f}`;
      return o && (w = (0, t.str)`${w}${(0, s.getErrorPath)(o, s.Type.Str)}`), [c.schemaPath, w];
    }
    function E(f, { params: y, message: o }, p) {
      const { keyword: w, data: m, schemaValue: v, it: R } = f, { opts: T, propertyName: C, topSchemaRef: V, schemaPath: D } = R;
      p.push([c.keyword, w], [c.params, typeof y == "function" ? y(f) : y || (0, t._)`{}`]), T.messages && p.push([c.message, typeof o == "function" ? o(f) : o]), T.verbose && p.push([c.schema, v], [c.parentSchema, (0, t._)`${V}${D}`], [r.default.data, m]), C && p.push([c.propertyName, C]);
    }
  })(Un)), Un;
}
var qa;
function al() {
  if (qa) return st;
  qa = 1, Object.defineProperty(st, "__esModule", { value: !0 }), st.boolOrEmptySchema = st.topBoolOrEmptySchema = void 0;
  const e = wn(), t = ee(), s = Ae(), r = {
    message: "boolean schema is false"
  };
  function l(a) {
    const { gen: u, schema: d, validateName: c } = a;
    d === !1 ? i(a, !1) : typeof d == "object" && d.$async === !0 ? u.return(s.default.data) : (u.assign((0, t._)`${c}.errors`, null), u.return(!0));
  }
  st.topBoolOrEmptySchema = l;
  function n(a, u) {
    const { gen: d, schema: c } = a;
    c === !1 ? (d.var(u, !1), i(a)) : d.var(u, !0);
  }
  st.boolOrEmptySchema = n;
  function i(a, u) {
    const { gen: d, data: c } = a, g = {
      gen: d,
      keyword: "false schema",
      data: c,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: a
    };
    (0, e.reportError)(g, r, void 0, u);
  }
  return st;
}
var ye = {}, at = {}, Ca;
function yu() {
  if (Ca) return at;
  Ca = 1, Object.defineProperty(at, "__esModule", { value: !0 }), at.getRules = at.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function s(l) {
    return typeof l == "string" && t.has(l);
  }
  at.isJSONType = s;
  function r() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return at.getRules = r, at;
}
var Ve = {}, Da;
function vu() {
  if (Da) return Ve;
  Da = 1, Object.defineProperty(Ve, "__esModule", { value: !0 }), Ve.shouldUseRule = Ve.shouldUseGroup = Ve.schemaHasRulesForType = void 0;
  function e({ schema: r, self: l }, n) {
    const i = l.RULES.types[n];
    return i && i !== !0 && t(r, i);
  }
  Ve.schemaHasRulesForType = e;
  function t(r, l) {
    return l.rules.some((n) => s(r, n));
  }
  Ve.shouldUseGroup = t;
  function s(r, l) {
    var n;
    return r[l.keyword] !== void 0 || ((n = l.definition.implements) === null || n === void 0 ? void 0 : n.some((i) => r[i] !== void 0));
  }
  return Ve.shouldUseRule = s, Ve;
}
var Ma;
function vn() {
  if (Ma) return ye;
  Ma = 1, Object.defineProperty(ye, "__esModule", { value: !0 }), ye.reportTypeError = ye.checkDataTypes = ye.checkDataType = ye.coerceAndCheckDataType = ye.getJSONTypes = ye.getSchemaTypes = ye.DataType = void 0;
  const e = yu(), t = vu(), s = wn(), r = ee(), l = se();
  var n;
  (function(o) {
    o[o.Correct = 0] = "Correct", o[o.Wrong = 1] = "Wrong";
  })(n || (ye.DataType = n = {}));
  function i(o) {
    const p = a(o.type);
    if (p.includes("null")) {
      if (o.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!p.length && o.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      o.nullable === !0 && p.push("null");
    }
    return p;
  }
  ye.getSchemaTypes = i;
  function a(o) {
    const p = Array.isArray(o) ? o : o ? [o] : [];
    if (p.every(e.isJSONType))
      return p;
    throw new Error("type must be JSONType or JSONType[]: " + p.join(","));
  }
  ye.getJSONTypes = a;
  function u(o, p) {
    const { gen: w, data: m, opts: v } = o, R = c(p, v.coerceTypes), T = p.length > 0 && !(R.length === 0 && p.length === 1 && (0, t.schemaHasRulesForType)(o, p[0]));
    if (T) {
      const C = b(p, m, v.strictNumbers, n.Wrong);
      w.if(C, () => {
        R.length ? g(o, p, R) : f(o);
      });
    }
    return T;
  }
  ye.coerceAndCheckDataType = u;
  const d = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function c(o, p) {
    return p ? o.filter((w) => d.has(w) || p === "array" && w === "array") : [];
  }
  function g(o, p, w) {
    const { gen: m, data: v, opts: R } = o, T = m.let("dataType", (0, r._)`typeof ${v}`), C = m.let("coerced", (0, r._)`undefined`);
    R.coerceTypes === "array" && m.if((0, r._)`${T} == 'object' && Array.isArray(${v}) && ${v}.length == 1`, () => m.assign(v, (0, r._)`${v}[0]`).assign(T, (0, r._)`typeof ${v}`).if(b(p, v, R.strictNumbers), () => m.assign(C, v))), m.if((0, r._)`${C} !== undefined`);
    for (const D of w)
      (d.has(D) || D === "array" && R.coerceTypes === "array") && V(D);
    m.else(), f(o), m.endIf(), m.if((0, r._)`${C} !== undefined`, () => {
      m.assign(v, C), _(o, C);
    });
    function V(D) {
      switch (D) {
        case "string":
          m.elseIf((0, r._)`${T} == "number" || ${T} == "boolean"`).assign(C, (0, r._)`"" + ${v}`).elseIf((0, r._)`${v} === null`).assign(C, (0, r._)`""`);
          return;
        case "number":
          m.elseIf((0, r._)`${T} == "boolean" || ${v} === null
              || (${T} == "string" && ${v} && ${v} == +${v})`).assign(C, (0, r._)`+${v}`);
          return;
        case "integer":
          m.elseIf((0, r._)`${T} === "boolean" || ${v} === null
              || (${T} === "string" && ${v} && ${v} == +${v} && !(${v} % 1))`).assign(C, (0, r._)`+${v}`);
          return;
        case "boolean":
          m.elseIf((0, r._)`${v} === "false" || ${v} === 0 || ${v} === null`).assign(C, !1).elseIf((0, r._)`${v} === "true" || ${v} === 1`).assign(C, !0);
          return;
        case "null":
          m.elseIf((0, r._)`${v} === "" || ${v} === 0 || ${v} === false`), m.assign(C, null);
          return;
        case "array":
          m.elseIf((0, r._)`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${v} === null`).assign(C, (0, r._)`[${v}]`);
      }
    }
  }
  function _({ gen: o, parentData: p, parentDataProperty: w }, m) {
    o.if((0, r._)`${p} !== undefined`, () => o.assign((0, r._)`${p}[${w}]`, m));
  }
  function $(o, p, w, m = n.Correct) {
    const v = m === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let R;
    switch (o) {
      case "null":
        return (0, r._)`${p} ${v} null`;
      case "array":
        R = (0, r._)`Array.isArray(${p})`;
        break;
      case "object":
        R = (0, r._)`${p} && typeof ${p} == "object" && !Array.isArray(${p})`;
        break;
      case "integer":
        R = T((0, r._)`!(${p} % 1) && !isNaN(${p})`);
        break;
      case "number":
        R = T();
        break;
      default:
        return (0, r._)`typeof ${p} ${v} ${o}`;
    }
    return m === n.Correct ? R : (0, r.not)(R);
    function T(C = r.nil) {
      return (0, r.and)((0, r._)`typeof ${p} == "number"`, C, w ? (0, r._)`isFinite(${p})` : r.nil);
    }
  }
  ye.checkDataType = $;
  function b(o, p, w, m) {
    if (o.length === 1)
      return $(o[0], p, w, m);
    let v;
    const R = (0, l.toHash)(o);
    if (R.array && R.object) {
      const T = (0, r._)`typeof ${p} != "object"`;
      v = R.null ? T : (0, r._)`!${p} || ${T}`, delete R.null, delete R.array, delete R.object;
    } else
      v = r.nil;
    R.number && delete R.integer;
    for (const T in R)
      v = (0, r.and)(v, $(T, p, w, m));
    return v;
  }
  ye.checkDataTypes = b;
  const E = {
    message: ({ schema: o }) => `must be ${o}`,
    params: ({ schema: o, schemaValue: p }) => typeof o == "string" ? (0, r._)`{type: ${o}}` : (0, r._)`{type: ${p}}`
  };
  function f(o) {
    const p = y(o);
    (0, s.reportError)(p, E);
  }
  ye.reportTypeError = f;
  function y(o) {
    const { gen: p, data: w, schema: m } = o, v = (0, l.schemaRefOrVal)(o, m, "type");
    return {
      gen: p,
      keyword: "type",
      data: w,
      schema: m.type,
      schemaCode: v,
      schemaValue: v,
      parentSchema: m,
      params: {},
      it: o
    };
  }
  return ye;
}
var bt = {}, La;
function ol() {
  if (La) return bt;
  La = 1, Object.defineProperty(bt, "__esModule", { value: !0 }), bt.assignDefaults = void 0;
  const e = ee(), t = se();
  function s(l, n) {
    const { properties: i, items: a } = l.schema;
    if (n === "object" && i)
      for (const u in i)
        r(l, u, i[u].default);
    else n === "array" && Array.isArray(a) && a.forEach((u, d) => r(l, d, u.default));
  }
  bt.assignDefaults = s;
  function r(l, n, i) {
    const { gen: a, compositeRule: u, data: d, opts: c } = l;
    if (i === void 0)
      return;
    const g = (0, e._)`${d}${(0, e.getProperty)(n)}`;
    if (u) {
      (0, t.checkStrictMode)(l, `default is ignored for: ${g}`);
      return;
    }
    let _ = (0, e._)`${g} === undefined`;
    c.useDefaults === "empty" && (_ = (0, e._)`${_} || ${g} === null || ${g} === ""`), a.if(_, (0, e._)`${g} = ${(0, e.stringify)(i)}`);
  }
  return bt;
}
var Te = {}, de = {}, Va;
function ke() {
  if (Va) return de;
  Va = 1, Object.defineProperty(de, "__esModule", { value: !0 }), de.validateUnion = de.validateArray = de.usePattern = de.callValidateCode = de.schemaProperties = de.allSchemaProperties = de.noPropertyInData = de.propertyInData = de.isOwnProperty = de.hasPropFunc = de.reportMissingProp = de.checkMissingProp = de.checkReportMissingProp = void 0;
  const e = ee(), t = se(), s = Ae(), r = se();
  function l(o, p) {
    const { gen: w, data: m, it: v } = o;
    w.if(c(w, m, p, v.opts.ownProperties), () => {
      o.setParams({ missingProperty: (0, e._)`${p}` }, !0), o.error();
    });
  }
  de.checkReportMissingProp = l;
  function n({ gen: o, data: p, it: { opts: w } }, m, v) {
    return (0, e.or)(...m.map((R) => (0, e.and)(c(o, p, R, w.ownProperties), (0, e._)`${v} = ${R}`)));
  }
  de.checkMissingProp = n;
  function i(o, p) {
    o.setParams({ missingProperty: p }, !0), o.error();
  }
  de.reportMissingProp = i;
  function a(o) {
    return o.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  de.hasPropFunc = a;
  function u(o, p, w) {
    return (0, e._)`${a(o)}.call(${p}, ${w})`;
  }
  de.isOwnProperty = u;
  function d(o, p, w, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(w)} !== undefined`;
    return m ? (0, e._)`${v} && ${u(o, p, w)}` : v;
  }
  de.propertyInData = d;
  function c(o, p, w, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(w)} === undefined`;
    return m ? (0, e.or)(v, (0, e.not)(u(o, p, w))) : v;
  }
  de.noPropertyInData = c;
  function g(o) {
    return o ? Object.keys(o).filter((p) => p !== "__proto__") : [];
  }
  de.allSchemaProperties = g;
  function _(o, p) {
    return g(p).filter((w) => !(0, t.alwaysValidSchema)(o, p[w]));
  }
  de.schemaProperties = _;
  function $({ schemaCode: o, data: p, it: { gen: w, topSchemaRef: m, schemaPath: v, errorPath: R }, it: T }, C, V, D) {
    const U = D ? (0, e._)`${o}, ${p}, ${m}${v}` : p, z = [
      [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, R)],
      [s.default.parentData, T.parentData],
      [s.default.parentDataProperty, T.parentDataProperty],
      [s.default.rootData, s.default.rootData]
    ];
    T.opts.dynamicRef && z.push([s.default.dynamicAnchors, s.default.dynamicAnchors]);
    const M = (0, e._)`${U}, ${w.object(...z)}`;
    return V !== e.nil ? (0, e._)`${C}.call(${V}, ${M})` : (0, e._)`${C}(${M})`;
  }
  de.callValidateCode = $;
  const b = (0, e._)`new RegExp`;
  function E({ gen: o, it: { opts: p } }, w) {
    const m = p.unicodeRegExp ? "u" : "", { regExp: v } = p.code, R = v(w, m);
    return o.scopeValue("pattern", {
      key: R.toString(),
      ref: R,
      code: (0, e._)`${v.code === "new RegExp" ? b : (0, r.useFunc)(o, v)}(${w}, ${m})`
    });
  }
  de.usePattern = E;
  function f(o) {
    const { gen: p, data: w, keyword: m, it: v } = o, R = p.name("valid");
    if (v.allErrors) {
      const C = p.let("valid", !0);
      return T(() => p.assign(C, !1)), C;
    }
    return p.var(R, !0), T(() => p.break()), R;
    function T(C) {
      const V = p.const("len", (0, e._)`${w}.length`);
      p.forRange("i", 0, V, (D) => {
        o.subschema({
          keyword: m,
          dataProp: D,
          dataPropType: t.Type.Num
        }, R), p.if((0, e.not)(R), C);
      });
    }
  }
  de.validateArray = f;
  function y(o) {
    const { gen: p, schema: w, keyword: m, it: v } = o;
    if (!Array.isArray(w))
      throw new Error("ajv implementation error");
    if (w.some((V) => (0, t.alwaysValidSchema)(v, V)) && !v.opts.unevaluated)
      return;
    const T = p.let("valid", !1), C = p.name("_valid");
    p.block(() => w.forEach((V, D) => {
      const U = o.subschema({
        keyword: m,
        schemaProp: D,
        compositeRule: !0
      }, C);
      p.assign(T, (0, e._)`${T} || ${C}`), o.mergeValidEvaluated(U, C) || p.if((0, e.not)(T));
    })), o.result(T, () => o.reset(), () => o.error(!0));
  }
  return de.validateUnion = y, de;
}
var Fa;
function il() {
  if (Fa) return Te;
  Fa = 1, Object.defineProperty(Te, "__esModule", { value: !0 }), Te.validateKeywordUsage = Te.validSchemaType = Te.funcKeywordCode = Te.macroKeywordCode = void 0;
  const e = ee(), t = Ae(), s = ke(), r = wn();
  function l(_, $) {
    const { gen: b, keyword: E, schema: f, parentSchema: y, it: o } = _, p = $.macro.call(o.self, f, y, o), w = d(b, E, p);
    o.opts.validateSchema !== !1 && o.self.validateSchema(p, !0);
    const m = b.name("valid");
    _.subschema({
      schema: p,
      schemaPath: e.nil,
      errSchemaPath: `${o.errSchemaPath}/${E}`,
      topSchemaRef: w,
      compositeRule: !0
    }, m), _.pass(m, () => _.error(!0));
  }
  Te.macroKeywordCode = l;
  function n(_, $) {
    var b;
    const { gen: E, keyword: f, schema: y, parentSchema: o, $data: p, it: w } = _;
    u(w, $);
    const m = !p && $.compile ? $.compile.call(w.self, y, o, w) : $.validate, v = d(E, f, m), R = E.let("valid");
    _.block$data(R, T), _.ok((b = $.valid) !== null && b !== void 0 ? b : R);
    function T() {
      if ($.errors === !1)
        D(), $.modifying && i(_), U(() => _.error());
      else {
        const z = $.async ? C() : V();
        $.modifying && i(_), U(() => a(_, z));
      }
    }
    function C() {
      const z = E.let("ruleErrs", null);
      return E.try(() => D((0, e._)`await `), (M) => E.assign(R, !1).if((0, e._)`${M} instanceof ${w.ValidationError}`, () => E.assign(z, (0, e._)`${M}.errors`), () => E.throw(M))), z;
    }
    function V() {
      const z = (0, e._)`${v}.errors`;
      return E.assign(z, null), D(e.nil), z;
    }
    function D(z = $.async ? (0, e._)`await ` : e.nil) {
      const M = w.opts.passContext ? t.default.this : t.default.self, F = !("compile" in $ && !p || $.schema === !1);
      E.assign(R, (0, e._)`${z}${(0, s.callValidateCode)(_, v, M, F)}`, $.modifying);
    }
    function U(z) {
      var M;
      E.if((0, e.not)((M = $.valid) !== null && M !== void 0 ? M : R), z);
    }
  }
  Te.funcKeywordCode = n;
  function i(_) {
    const { gen: $, data: b, it: E } = _;
    $.if(E.parentData, () => $.assign(b, (0, e._)`${E.parentData}[${E.parentDataProperty}]`));
  }
  function a(_, $) {
    const { gen: b } = _;
    b.if((0, e._)`Array.isArray(${$})`, () => {
      b.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${$} : ${t.default.vErrors}.concat(${$})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(_);
    }, () => _.error());
  }
  function u({ schemaEnv: _ }, $) {
    if ($.async && !_.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(_, $, b) {
    if (b === void 0)
      throw new Error(`keyword "${$}" failed to compile`);
    return _.scopeValue("keyword", typeof b == "function" ? { ref: b } : { ref: b, code: (0, e.stringify)(b) });
  }
  function c(_, $, b = !1) {
    return !$.length || $.some((E) => E === "array" ? Array.isArray(_) : E === "object" ? _ && typeof _ == "object" && !Array.isArray(_) : typeof _ == E || b && typeof _ > "u");
  }
  Te.validSchemaType = c;
  function g({ schema: _, opts: $, self: b, errSchemaPath: E }, f, y) {
    if (Array.isArray(f.keyword) ? !f.keyword.includes(y) : f.keyword !== y)
      throw new Error("ajv implementation error");
    const o = f.dependencies;
    if (o?.some((p) => !Object.prototype.hasOwnProperty.call(_, p)))
      throw new Error(`parent schema must have dependencies of ${y}: ${o.join(",")}`);
    if (f.validateSchema && !f.validateSchema(_[y])) {
      const w = `keyword "${y}" value is invalid at path "${E}": ` + b.errorsText(f.validateSchema.errors);
      if ($.validateSchema === "log")
        b.logger.error(w);
      else
        throw new Error(w);
    }
  }
  return Te.validateKeywordUsage = g, Te;
}
var Fe = {}, Ua;
function cl() {
  if (Ua) return Fe;
  Ua = 1, Object.defineProperty(Fe, "__esModule", { value: !0 }), Fe.extendSubschemaMode = Fe.extendSubschemaData = Fe.getSubschema = void 0;
  const e = ee(), t = se();
  function s(n, { keyword: i, schemaProp: a, schema: u, schemaPath: d, errSchemaPath: c, topSchemaRef: g }) {
    if (i !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const _ = n.schema[i];
      return a === void 0 ? {
        schema: _,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}`
      } : {
        schema: _[a],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(a)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}/${(0, t.escapeFragment)(a)}`
      };
    }
    if (u !== void 0) {
      if (d === void 0 || c === void 0 || g === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: d,
        topSchemaRef: g,
        errSchemaPath: c
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Fe.getSubschema = s;
  function r(n, i, { dataProp: a, dataPropType: u, data: d, dataTypes: c, propertyName: g }) {
    if (d !== void 0 && a !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: _ } = i;
    if (a !== void 0) {
      const { errorPath: b, dataPathArr: E, opts: f } = i, y = _.let("data", (0, e._)`${i.data}${(0, e.getProperty)(a)}`, !0);
      $(y), n.errorPath = (0, e.str)`${b}${(0, t.getErrorPath)(a, u, f.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${a}`, n.dataPathArr = [...E, n.parentDataProperty];
    }
    if (d !== void 0) {
      const b = d instanceof e.Name ? d : _.let("data", d, !0);
      $(b), g !== void 0 && (n.propertyName = g);
    }
    c && (n.dataTypes = c);
    function $(b) {
      n.data = b, n.dataLevel = i.dataLevel + 1, n.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), n.parentData = i.data, n.dataNames = [...i.dataNames, b];
    }
  }
  Fe.extendSubschemaData = r;
  function l(n, { jtdDiscriminator: i, jtdMetadata: a, compositeRule: u, createErrors: d, allErrors: c }) {
    u !== void 0 && (n.compositeRule = u), d !== void 0 && (n.createErrors = d), c !== void 0 && (n.allErrors = c), n.jtdDiscriminator = i, n.jtdMetadata = a;
  }
  return Fe.extendSubschemaMode = l, Fe;
}
var Ee = {}, Hn, za;
function En() {
  return za || (za = 1, Hn = function e(t, s) {
    if (t === s) return !0;
    if (t && s && typeof t == "object" && typeof s == "object") {
      if (t.constructor !== s.constructor) return !1;
      var r, l, n;
      if (Array.isArray(t)) {
        if (r = t.length, r != s.length) return !1;
        for (l = r; l-- !== 0; )
          if (!e(t[l], s[l])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === s.source && t.flags === s.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === s.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === s.toString();
      if (n = Object.keys(t), r = n.length, r !== Object.keys(s).length) return !1;
      for (l = r; l-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(s, n[l])) return !1;
      for (l = r; l-- !== 0; ) {
        var i = n[l];
        if (!e(t[i], s[i])) return !1;
      }
      return !0;
    }
    return t !== t && s !== s;
  }), Hn;
}
var Jn = { exports: {} }, Ka;
function ul() {
  if (Ka) return Jn.exports;
  Ka = 1;
  var e = Jn.exports = function(r, l, n) {
    typeof l == "function" && (n = l, l = {}), n = l.cb || n;
    var i = typeof n == "function" ? n : n.pre || function() {
    }, a = n.post || function() {
    };
    t(l, i, a, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, l, n, i, a, u, d, c, g, _) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      l(i, a, u, d, c, g, _);
      for (var $ in i) {
        var b = i[$];
        if (Array.isArray(b)) {
          if ($ in e.arrayKeywords)
            for (var E = 0; E < b.length; E++)
              t(r, l, n, b[E], a + "/" + $ + "/" + E, u, a, $, i, E);
        } else if ($ in e.propsKeywords) {
          if (b && typeof b == "object")
            for (var f in b)
              t(r, l, n, b[f], a + "/" + $ + "/" + s(f), u, a, $, i, f);
        } else ($ in e.keywords || r.allKeys && !($ in e.skipKeywords)) && t(r, l, n, b, a + "/" + $, u, a, $, i);
      }
      n(i, a, u, d, c, g, _);
    }
  }
  function s(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Jn.exports;
}
var Ga;
function bn() {
  if (Ga) return Ee;
  Ga = 1, Object.defineProperty(Ee, "__esModule", { value: !0 }), Ee.getSchemaRefs = Ee.resolveUrl = Ee.normalizeId = Ee._getFullPath = Ee.getFullPath = Ee.inlineRef = void 0;
  const e = se(), t = En(), s = ul(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function l(E, f = !0) {
    return typeof E == "boolean" ? !0 : f === !0 ? !i(E) : f ? a(E) <= f : !1;
  }
  Ee.inlineRef = l;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(E) {
    for (const f in E) {
      if (n.has(f))
        return !0;
      const y = E[f];
      if (Array.isArray(y) && y.some(i) || typeof y == "object" && i(y))
        return !0;
    }
    return !1;
  }
  function a(E) {
    let f = 0;
    for (const y in E) {
      if (y === "$ref")
        return 1 / 0;
      if (f++, !r.has(y) && (typeof E[y] == "object" && (0, e.eachItem)(E[y], (o) => f += a(o)), f === 1 / 0))
        return 1 / 0;
    }
    return f;
  }
  function u(E, f = "", y) {
    y !== !1 && (f = g(f));
    const o = E.parse(f);
    return d(E, o);
  }
  Ee.getFullPath = u;
  function d(E, f) {
    return E.serialize(f).split("#")[0] + "#";
  }
  Ee._getFullPath = d;
  const c = /#\/?$/;
  function g(E) {
    return E ? E.replace(c, "") : "";
  }
  Ee.normalizeId = g;
  function _(E, f, y) {
    return y = g(y), E.resolve(f, y);
  }
  Ee.resolveUrl = _;
  const $ = /^[a-z_][-a-z0-9._]*$/i;
  function b(E, f) {
    if (typeof E == "boolean")
      return {};
    const { schemaId: y, uriResolver: o } = this.opts, p = g(E[y] || f), w = { "": p }, m = u(o, p, !1), v = {}, R = /* @__PURE__ */ new Set();
    return s(E, { allKeys: !0 }, (V, D, U, z) => {
      if (z === void 0)
        return;
      const M = m + D;
      let F = w[z];
      typeof V[y] == "string" && (F = X.call(this, V[y])), B.call(this, V.$anchor), B.call(this, V.$dynamicAnchor), w[D] = F;
      function X(J) {
        const Y = this.opts.uriResolver.resolve;
        if (J = g(F ? Y(F, J) : J), R.has(J))
          throw C(J);
        R.add(J);
        let k = this.refs[J];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? T(V, k.schema, J) : J !== g(M) && (J[0] === "#" ? (T(V, v[J], J), v[J] = V) : this.refs[J] = M), J;
      }
      function B(J) {
        if (typeof J == "string") {
          if (!$.test(J))
            throw new Error(`invalid anchor "${J}"`);
          X.call(this, `#${J}`);
        }
      }
    }), v;
    function T(V, D, U) {
      if (D !== void 0 && !t(V, D))
        throw C(U);
    }
    function C(V) {
      return new Error(`reference "${V}" resolves to more than one schema`);
    }
  }
  return Ee.getSchemaRefs = b, Ee;
}
var Ha;
function Sn() {
  if (Ha) return Le;
  Ha = 1, Object.defineProperty(Le, "__esModule", { value: !0 }), Le.getData = Le.KeywordCxt = Le.validateFunctionCode = void 0;
  const e = al(), t = vn(), s = vu(), r = vn(), l = ol(), n = il(), i = cl(), a = ee(), u = Ae(), d = bn(), c = se(), g = wn();
  function _(P) {
    if (m(P) && (R(P), w(P))) {
      f(P);
      return;
    }
    $(P, () => (0, e.topBoolOrEmptySchema)(P));
  }
  Le.validateFunctionCode = _;
  function $({ gen: P, validateName: I, schema: q, schemaEnv: L, opts: G }, W) {
    G.code.es5 ? P.func(I, (0, a._)`${u.default.data}, ${u.default.valCxt}`, L.$async, () => {
      P.code((0, a._)`"use strict"; ${o(q, G)}`), E(P, G), P.code(W);
    }) : P.func(I, (0, a._)`${u.default.data}, ${b(G)}`, L.$async, () => P.code(o(q, G)).code(W));
  }
  function b(P) {
    return (0, a._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${P.dynamicRef ? (0, a._)`, ${u.default.dynamicAnchors}={}` : a.nil}}={}`;
  }
  function E(P, I) {
    P.if(u.default.valCxt, () => {
      P.var(u.default.instancePath, (0, a._)`${u.default.valCxt}.${u.default.instancePath}`), P.var(u.default.parentData, (0, a._)`${u.default.valCxt}.${u.default.parentData}`), P.var(u.default.parentDataProperty, (0, a._)`${u.default.valCxt}.${u.default.parentDataProperty}`), P.var(u.default.rootData, (0, a._)`${u.default.valCxt}.${u.default.rootData}`), I.dynamicRef && P.var(u.default.dynamicAnchors, (0, a._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      P.var(u.default.instancePath, (0, a._)`""`), P.var(u.default.parentData, (0, a._)`undefined`), P.var(u.default.parentDataProperty, (0, a._)`undefined`), P.var(u.default.rootData, u.default.data), I.dynamicRef && P.var(u.default.dynamicAnchors, (0, a._)`{}`);
    });
  }
  function f(P) {
    const { schema: I, opts: q, gen: L } = P;
    $(P, () => {
      q.$comment && I.$comment && z(P), V(P), L.let(u.default.vErrors, null), L.let(u.default.errors, 0), q.unevaluated && y(P), T(P), M(P);
    });
  }
  function y(P) {
    const { gen: I, validateName: q } = P;
    P.evaluated = I.const("evaluated", (0, a._)`${q}.evaluated`), I.if((0, a._)`${P.evaluated}.dynamicProps`, () => I.assign((0, a._)`${P.evaluated}.props`, (0, a._)`undefined`)), I.if((0, a._)`${P.evaluated}.dynamicItems`, () => I.assign((0, a._)`${P.evaluated}.items`, (0, a._)`undefined`));
  }
  function o(P, I) {
    const q = typeof P == "object" && P[I.schemaId];
    return q && (I.code.source || I.code.process) ? (0, a._)`/*# sourceURL=${q} */` : a.nil;
  }
  function p(P, I) {
    if (m(P) && (R(P), w(P))) {
      v(P, I);
      return;
    }
    (0, e.boolOrEmptySchema)(P, I);
  }
  function w({ schema: P, self: I }) {
    if (typeof P == "boolean")
      return !P;
    for (const q in P)
      if (I.RULES.all[q])
        return !0;
    return !1;
  }
  function m(P) {
    return typeof P.schema != "boolean";
  }
  function v(P, I) {
    const { schema: q, gen: L, opts: G } = P;
    G.$comment && q.$comment && z(P), D(P), U(P);
    const W = L.const("_errs", u.default.errors);
    T(P, W), L.var(I, (0, a._)`${W} === ${u.default.errors}`);
  }
  function R(P) {
    (0, c.checkUnknownRules)(P), C(P);
  }
  function T(P, I) {
    if (P.opts.jtd)
      return X(P, [], !1, I);
    const q = (0, t.getSchemaTypes)(P.schema), L = (0, t.coerceAndCheckDataType)(P, q);
    X(P, q, !L, I);
  }
  function C(P) {
    const { schema: I, errSchemaPath: q, opts: L, self: G } = P;
    I.$ref && L.ignoreKeywordsWithRef && (0, c.schemaHasRulesButRef)(I, G.RULES) && G.logger.warn(`$ref: keywords ignored in schema at path "${q}"`);
  }
  function V(P) {
    const { schema: I, opts: q } = P;
    I.default !== void 0 && q.useDefaults && q.strictSchema && (0, c.checkStrictMode)(P, "default is ignored in the schema root");
  }
  function D(P) {
    const I = P.schema[P.opts.schemaId];
    I && (P.baseId = (0, d.resolveUrl)(P.opts.uriResolver, P.baseId, I));
  }
  function U(P) {
    if (P.schema.$async && !P.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function z({ gen: P, schemaEnv: I, schema: q, errSchemaPath: L, opts: G }) {
    const W = q.$comment;
    if (G.$comment === !0)
      P.code((0, a._)`${u.default.self}.logger.log(${W})`);
    else if (typeof G.$comment == "function") {
      const ae = (0, a.str)`${L}/$comment`, pe = P.scopeValue("root", { ref: I.root });
      P.code((0, a._)`${u.default.self}.opts.$comment(${W}, ${ae}, ${pe}.schema)`);
    }
  }
  function M(P) {
    const { gen: I, schemaEnv: q, validateName: L, ValidationError: G, opts: W } = P;
    q.$async ? I.if((0, a._)`${u.default.errors} === 0`, () => I.return(u.default.data), () => I.throw((0, a._)`new ${G}(${u.default.vErrors})`)) : (I.assign((0, a._)`${L}.errors`, u.default.vErrors), W.unevaluated && F(P), I.return((0, a._)`${u.default.errors} === 0`));
  }
  function F({ gen: P, evaluated: I, props: q, items: L }) {
    q instanceof a.Name && P.assign((0, a._)`${I}.props`, q), L instanceof a.Name && P.assign((0, a._)`${I}.items`, L);
  }
  function X(P, I, q, L) {
    const { gen: G, schema: W, data: ae, allErrors: pe, opts: ue, self: le } = P, { RULES: oe } = le;
    if (W.$ref && (ue.ignoreKeywordsWithRef || !(0, c.schemaHasRulesButRef)(W, oe))) {
      G.block(() => K(P, "$ref", oe.all.$ref.definition));
      return;
    }
    ue.jtd || J(P, I), G.block(() => {
      for (const he of oe.rules)
        Re(he);
      Re(oe.post);
    });
    function Re(he) {
      (0, s.shouldUseGroup)(W, he) && (he.type ? (G.if((0, r.checkDataType)(he.type, ae, ue.strictNumbers)), B(P, he), I.length === 1 && I[0] === he.type && q && (G.else(), (0, r.reportTypeError)(P)), G.endIf()) : B(P, he), pe || G.if((0, a._)`${u.default.errors} === ${L || 0}`));
    }
  }
  function B(P, I) {
    const { gen: q, schema: L, opts: { useDefaults: G } } = P;
    G && (0, l.assignDefaults)(P, I.type), q.block(() => {
      for (const W of I.rules)
        (0, s.shouldUseRule)(L, W) && K(P, W.keyword, W.definition, I.type);
    });
  }
  function J(P, I) {
    P.schemaEnv.meta || !P.opts.strictTypes || (Y(P, I), P.opts.allowUnionTypes || k(P, I), N(P, P.dataTypes));
  }
  function Y(P, I) {
    if (I.length) {
      if (!P.dataTypes.length) {
        P.dataTypes = I;
        return;
      }
      I.forEach((q) => {
        O(P.dataTypes, q) || S(P, `type "${q}" not allowed by context "${P.dataTypes.join(",")}"`);
      }), h(P, I);
    }
  }
  function k(P, I) {
    I.length > 1 && !(I.length === 2 && I.includes("null")) && S(P, "use allowUnionTypes to allow union type keyword");
  }
  function N(P, I) {
    const q = P.self.RULES.all;
    for (const L in q) {
      const G = q[L];
      if (typeof G == "object" && (0, s.shouldUseRule)(P.schema, G)) {
        const { type: W } = G.definition;
        W.length && !W.some((ae) => A(I, ae)) && S(P, `missing type "${W.join(",")}" for keyword "${L}"`);
      }
    }
  }
  function A(P, I) {
    return P.includes(I) || I === "number" && P.includes("integer");
  }
  function O(P, I) {
    return P.includes(I) || I === "integer" && P.includes("number");
  }
  function h(P, I) {
    const q = [];
    for (const L of P.dataTypes)
      O(I, L) ? q.push(L) : I.includes("integer") && L === "number" && q.push("integer");
    P.dataTypes = q;
  }
  function S(P, I) {
    const q = P.schemaEnv.baseId + P.errSchemaPath;
    I += ` at "${q}" (strictTypes)`, (0, c.checkStrictMode)(P, I, P.opts.strictTypes);
  }
  class j {
    constructor(I, q, L) {
      if ((0, n.validateKeywordUsage)(I, q, L), this.gen = I.gen, this.allErrors = I.allErrors, this.keyword = L, this.data = I.data, this.schema = I.schema[L], this.$data = q.$data && I.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, c.schemaRefOrVal)(I, this.schema, L, this.$data), this.schemaType = q.schemaType, this.parentSchema = I.schema, this.params = {}, this.it = I, this.def = q, this.$data)
        this.schemaCode = I.gen.const("vSchema", Z(this.$data, I));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, q.schemaType, q.allowUndefined))
        throw new Error(`${L} value must be ${JSON.stringify(q.schemaType)}`);
      ("code" in q ? q.trackErrors : q.errors !== !1) && (this.errsCount = I.gen.const("_errs", u.default.errors));
    }
    result(I, q, L) {
      this.failResult((0, a.not)(I), q, L);
    }
    failResult(I, q, L) {
      this.gen.if(I), L ? L() : this.error(), q ? (this.gen.else(), q(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(I, q) {
      this.failResult((0, a.not)(I), void 0, q);
    }
    fail(I) {
      if (I === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(I), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(I) {
      if (!this.$data)
        return this.fail(I);
      const { schemaCode: q } = this;
      this.fail((0, a._)`${q} !== undefined && (${(0, a.or)(this.invalid$data(), I)})`);
    }
    error(I, q, L) {
      if (q) {
        this.setParams(q), this._error(I, L), this.setParams({});
        return;
      }
      this._error(I, L);
    }
    _error(I, q) {
      (I ? g.reportExtraError : g.reportError)(this, this.def.error, q);
    }
    $dataError() {
      (0, g.reportError)(this, this.def.$dataError || g.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, g.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(I) {
      this.allErrors || this.gen.if(I);
    }
    setParams(I, q) {
      q ? Object.assign(this.params, I) : this.params = I;
    }
    block$data(I, q, L = a.nil) {
      this.gen.block(() => {
        this.check$data(I, L), q();
      });
    }
    check$data(I = a.nil, q = a.nil) {
      if (!this.$data)
        return;
      const { gen: L, schemaCode: G, schemaType: W, def: ae } = this;
      L.if((0, a.or)((0, a._)`${G} === undefined`, q)), I !== a.nil && L.assign(I, !0), (W.length || ae.validateSchema) && (L.elseIf(this.invalid$data()), this.$dataError(), I !== a.nil && L.assign(I, !1)), L.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: q, schemaType: L, def: G, it: W } = this;
      return (0, a.or)(ae(), pe());
      function ae() {
        if (L.length) {
          if (!(q instanceof a.Name))
            throw new Error("ajv implementation error");
          const ue = Array.isArray(L) ? L : [L];
          return (0, a._)`${(0, r.checkDataTypes)(ue, q, W.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return a.nil;
      }
      function pe() {
        if (G.validateSchema) {
          const ue = I.scopeValue("validate$data", { ref: G.validateSchema });
          return (0, a._)`!${ue}(${q})`;
        }
        return a.nil;
      }
    }
    subschema(I, q) {
      const L = (0, i.getSubschema)(this.it, I);
      (0, i.extendSubschemaData)(L, this.it, I), (0, i.extendSubschemaMode)(L, I);
      const G = { ...this.it, ...L, items: void 0, props: void 0 };
      return p(G, q), G;
    }
    mergeEvaluated(I, q) {
      const { it: L, gen: G } = this;
      L.opts.unevaluated && (L.props !== !0 && I.props !== void 0 && (L.props = c.mergeEvaluated.props(G, I.props, L.props, q)), L.items !== !0 && I.items !== void 0 && (L.items = c.mergeEvaluated.items(G, I.items, L.items, q)));
    }
    mergeValidEvaluated(I, q) {
      const { it: L, gen: G } = this;
      if (L.opts.unevaluated && (L.props !== !0 || L.items !== !0))
        return G.if(q, () => this.mergeEvaluated(I, a.Name)), !0;
    }
  }
  Le.KeywordCxt = j;
  function K(P, I, q, L) {
    const G = new j(P, q, I);
    "code" in q ? q.code(G, L) : G.$data && q.validate ? (0, n.funcKeywordCode)(G, q) : "macro" in q ? (0, n.macroKeywordCode)(G, q) : (q.compile || q.validate) && (0, n.funcKeywordCode)(G, q);
  }
  const H = /^\/(?:[^~]|~0|~1)*$/, Q = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Z(P, { dataLevel: I, dataNames: q, dataPathArr: L }) {
    let G, W;
    if (P === "")
      return u.default.rootData;
    if (P[0] === "/") {
      if (!H.test(P))
        throw new Error(`Invalid JSON-pointer: ${P}`);
      G = P, W = u.default.rootData;
    } else {
      const le = Q.exec(P);
      if (!le)
        throw new Error(`Invalid JSON-pointer: ${P}`);
      const oe = +le[1];
      if (G = le[2], G === "#") {
        if (oe >= I)
          throw new Error(ue("property/index", oe));
        return L[I - oe];
      }
      if (oe > I)
        throw new Error(ue("data", oe));
      if (W = q[I - oe], !G)
        return W;
    }
    let ae = W;
    const pe = G.split("/");
    for (const le of pe)
      le && (W = (0, a._)`${W}${(0, a.getProperty)((0, c.unescapeJsonPointer)(le))}`, ae = (0, a._)`${ae} && ${W}`);
    return ae;
    function ue(le, oe) {
      return `Cannot access ${le} ${oe} levels up, current level is ${I}`;
    }
  }
  return Le.getData = Z, Le;
}
var kt = {}, Ja;
function oa() {
  if (Ja) return kt;
  Ja = 1, Object.defineProperty(kt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(s) {
      super("validation failed"), this.errors = s, this.ajv = this.validation = !0;
    }
  }
  return kt.default = e, kt;
}
var qt = {}, Ba;
function Rn() {
  if (Ba) return qt;
  Ba = 1, Object.defineProperty(qt, "__esModule", { value: !0 });
  const e = bn();
  class t extends Error {
    constructor(r, l, n, i) {
      super(i || `can't resolve reference ${n} from id ${l}`), this.missingRef = (0, e.resolveUrl)(r, l, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return qt.default = t, qt;
}
var Ne = {}, Xa;
function Pn() {
  if (Xa) return Ne;
  Xa = 1, Object.defineProperty(Ne, "__esModule", { value: !0 }), Ne.resolveSchema = Ne.getCompilingSchema = Ne.resolveRef = Ne.compileSchema = Ne.SchemaEnv = void 0;
  const e = ee(), t = oa(), s = Ae(), r = bn(), l = se(), n = Sn();
  class i {
    constructor(y) {
      var o;
      this.refs = {}, this.dynamicAnchors = {};
      let p;
      typeof y.schema == "object" && (p = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (o = y.baseId) !== null && o !== void 0 ? o : (0, r.normalizeId)(p?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = p?.$async, this.refs = {};
    }
  }
  Ne.SchemaEnv = i;
  function a(f) {
    const y = c.call(this, f);
    if (y)
      return y;
    const o = (0, r.getFullPath)(this.opts.uriResolver, f.root.baseId), { es5: p, lines: w } = this.opts.code, { ownProperties: m } = this.opts, v = new e.CodeGen(this.scope, { es5: p, lines: w, ownProperties: m });
    let R;
    f.$async && (R = v.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const T = v.scopeName("validate");
    f.validateName = T;
    const C = {
      gen: v,
      allErrors: this.opts.allErrors,
      data: s.default.data,
      parentData: s.default.parentData,
      parentDataProperty: s.default.parentDataProperty,
      dataNames: [s.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: v.scopeValue("schema", this.opts.code.source === !0 ? { ref: f.schema, code: (0, e.stringify)(f.schema) } : { ref: f.schema }),
      validateName: T,
      ValidationError: R,
      schema: f.schema,
      schemaEnv: f,
      rootId: o,
      baseId: f.baseId || o,
      schemaPath: e.nil,
      errSchemaPath: f.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let V;
    try {
      this._compilations.add(f), (0, n.validateFunctionCode)(C), v.optimize(this.opts.code.optimize);
      const D = v.toString();
      V = `${v.scopeRefs(s.default.scope)}return ${D}`, this.opts.code.process && (V = this.opts.code.process(V, f));
      const z = new Function(`${s.default.self}`, `${s.default.scope}`, V)(this, this.scope.get());
      if (this.scope.value(T, { ref: z }), z.errors = null, z.schema = f.schema, z.schemaEnv = f, f.$async && (z.$async = !0), this.opts.code.source === !0 && (z.source = { validateName: T, validateCode: D, scopeValues: v._values }), this.opts.unevaluated) {
        const { props: M, items: F } = C;
        z.evaluated = {
          props: M instanceof e.Name ? void 0 : M,
          items: F instanceof e.Name ? void 0 : F,
          dynamicProps: M instanceof e.Name,
          dynamicItems: F instanceof e.Name
        }, z.source && (z.source.evaluated = (0, e.stringify)(z.evaluated));
      }
      return f.validate = z, f;
    } catch (D) {
      throw delete f.validate, delete f.validateName, V && this.logger.error("Error compiling schema, function code:", V), D;
    } finally {
      this._compilations.delete(f);
    }
  }
  Ne.compileSchema = a;
  function u(f, y, o) {
    var p;
    o = (0, r.resolveUrl)(this.opts.uriResolver, y, o);
    const w = f.refs[o];
    if (w)
      return w;
    let m = _.call(this, f, o);
    if (m === void 0) {
      const v = (p = f.localRefs) === null || p === void 0 ? void 0 : p[o], { schemaId: R } = this.opts;
      v && (m = new i({ schema: v, schemaId: R, root: f, baseId: y }));
    }
    if (m !== void 0)
      return f.refs[o] = d.call(this, m);
  }
  Ne.resolveRef = u;
  function d(f) {
    return (0, r.inlineRef)(f.schema, this.opts.inlineRefs) ? f.schema : f.validate ? f : a.call(this, f);
  }
  function c(f) {
    for (const y of this._compilations)
      if (g(y, f))
        return y;
  }
  Ne.getCompilingSchema = c;
  function g(f, y) {
    return f.schema === y.schema && f.root === y.root && f.baseId === y.baseId;
  }
  function _(f, y) {
    let o;
    for (; typeof (o = this.refs[y]) == "string"; )
      y = o;
    return o || this.schemas[y] || $.call(this, f, y);
  }
  function $(f, y) {
    const o = this.opts.uriResolver.parse(y), p = (0, r._getFullPath)(this.opts.uriResolver, o);
    let w = (0, r.getFullPath)(this.opts.uriResolver, f.baseId, void 0);
    if (Object.keys(f.schema).length > 0 && p === w)
      return E.call(this, o, f);
    const m = (0, r.normalizeId)(p), v = this.refs[m] || this.schemas[m];
    if (typeof v == "string") {
      const R = $.call(this, f, v);
      return typeof R?.schema != "object" ? void 0 : E.call(this, o, R);
    }
    if (typeof v?.schema == "object") {
      if (v.validate || a.call(this, v), m === (0, r.normalizeId)(y)) {
        const { schema: R } = v, { schemaId: T } = this.opts, C = R[T];
        return C && (w = (0, r.resolveUrl)(this.opts.uriResolver, w, C)), new i({ schema: R, schemaId: T, root: f, baseId: w });
      }
      return E.call(this, o, v);
    }
  }
  Ne.resolveSchema = $;
  const b = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function E(f, { baseId: y, schema: o, root: p }) {
    var w;
    if (((w = f.fragment) === null || w === void 0 ? void 0 : w[0]) !== "/")
      return;
    for (const R of f.fragment.slice(1).split("/")) {
      if (typeof o == "boolean")
        return;
      const T = o[(0, l.unescapeFragment)(R)];
      if (T === void 0)
        return;
      o = T;
      const C = typeof o == "object" && o[this.opts.schemaId];
      !b.has(R) && C && (y = (0, r.resolveUrl)(this.opts.uriResolver, y, C));
    }
    let m;
    if (typeof o != "boolean" && o.$ref && !(0, l.schemaHasRulesButRef)(o, this.RULES)) {
      const R = (0, r.resolveUrl)(this.opts.uriResolver, y, o.$ref);
      m = $.call(this, p, R);
    }
    const { schemaId: v } = this.opts;
    if (m = m || new i({ schema: o, schemaId: v, root: p, baseId: y }), m.schema !== m.root.schema)
      return m;
  }
  return Ne;
}
const ll = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", dl = "Meta-schema for $data reference (JSON AnySchema extension proposal)", fl = "object", hl = ["$data"], ml = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, pl = !1, yl = {
  $id: ll,
  description: dl,
  type: fl,
  required: hl,
  properties: ml,
  additionalProperties: pl
};
var Ct = {}, St = { exports: {} }, Bn, Wa;
function _u() {
  if (Wa) return Bn;
  Wa = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function s(_) {
    let $ = "", b = 0, E = 0;
    for (E = 0; E < _.length; E++)
      if (b = _[E].charCodeAt(0), b !== 48) {
        if (!(b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102))
          return "";
        $ += _[E];
        break;
      }
    for (E += 1; E < _.length; E++) {
      if (b = _[E].charCodeAt(0), !(b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102))
        return "";
      $ += _[E];
    }
    return $;
  }
  const r = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function l(_) {
    return _.length = 0, !0;
  }
  function n(_, $, b) {
    if (_.length) {
      const E = s(_);
      if (E !== "")
        $.push(E);
      else
        return b.error = !0, !1;
      _.length = 0;
    }
    return !0;
  }
  function i(_) {
    let $ = 0;
    const b = { error: !1, address: "", zone: "" }, E = [], f = [];
    let y = !1, o = !1, p = n;
    for (let w = 0; w < _.length; w++) {
      const m = _[w];
      if (!(m === "[" || m === "]"))
        if (m === ":") {
          if (y === !0 && (o = !0), !p(f, E, b))
            break;
          if (++$ > 7) {
            b.error = !0;
            break;
          }
          w > 0 && _[w - 1] === ":" && (y = !0), E.push(":");
          continue;
        } else if (m === "%") {
          if (!p(f, E, b))
            break;
          p = l;
        } else {
          f.push(m);
          continue;
        }
    }
    return f.length && (p === l ? b.zone = f.join("") : o ? E.push(f.join("")) : E.push(s(f))), b.address = E.join(""), b;
  }
  function a(_) {
    if (u(_, ":") < 2)
      return { host: _, isIPV6: !1 };
    const $ = i(_);
    if ($.error)
      return { host: _, isIPV6: !1 };
    {
      let b = $.address, E = $.address;
      return $.zone && (b += "%" + $.zone, E += "%25" + $.zone), { host: b, isIPV6: !0, escapedHost: E };
    }
  }
  function u(_, $) {
    let b = 0;
    for (let E = 0; E < _.length; E++)
      _[E] === $ && b++;
    return b;
  }
  function d(_) {
    let $ = _;
    const b = [];
    let E = -1, f = 0;
    for (; f = $.length; ) {
      if (f === 1) {
        if ($ === ".")
          break;
        if ($ === "/") {
          b.push("/");
          break;
        } else {
          b.push($);
          break;
        }
      } else if (f === 2) {
        if ($[0] === ".") {
          if ($[1] === ".")
            break;
          if ($[1] === "/") {
            $ = $.slice(2);
            continue;
          }
        } else if ($[0] === "/" && ($[1] === "." || $[1] === "/")) {
          b.push("/");
          break;
        }
      } else if (f === 3 && $ === "/..") {
        b.length !== 0 && b.pop(), b.push("/");
        break;
      }
      if ($[0] === ".") {
        if ($[1] === ".") {
          if ($[2] === "/") {
            $ = $.slice(3);
            continue;
          }
        } else if ($[1] === "/") {
          $ = $.slice(2);
          continue;
        }
      } else if ($[0] === "/" && $[1] === ".") {
        if ($[2] === "/") {
          $ = $.slice(2);
          continue;
        } else if ($[2] === "." && $[3] === "/") {
          $ = $.slice(3), b.length !== 0 && b.pop();
          continue;
        }
      }
      if ((E = $.indexOf("/", 1)) === -1) {
        b.push($);
        break;
      } else
        b.push($.slice(0, E)), $ = $.slice(E);
    }
    return b.join("");
  }
  function c(_, $) {
    const b = $ !== !0 ? escape : unescape;
    return _.scheme !== void 0 && (_.scheme = b(_.scheme)), _.userinfo !== void 0 && (_.userinfo = b(_.userinfo)), _.host !== void 0 && (_.host = b(_.host)), _.path !== void 0 && (_.path = b(_.path)), _.query !== void 0 && (_.query = b(_.query)), _.fragment !== void 0 && (_.fragment = b(_.fragment)), _;
  }
  function g(_) {
    const $ = [];
    if (_.userinfo !== void 0 && ($.push(_.userinfo), $.push("@")), _.host !== void 0) {
      let b = unescape(_.host);
      if (!t(b)) {
        const E = a(b);
        E.isIPV6 === !0 ? b = `[${E.escapedHost}]` : b = _.host;
      }
      $.push(b);
    }
    return (typeof _.port == "number" || typeof _.port == "string") && ($.push(":"), $.push(String(_.port))), $.length ? $.join("") : void 0;
  }
  return Bn = {
    nonSimpleDomain: r,
    recomposeAuthority: g,
    normalizeComponentEncoding: c,
    removeDotSegments: d,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: a,
    stringArrayToHexStripped: s
  }, Bn;
}
var Xn, Ya;
function vl() {
  if (Ya) return Xn;
  Ya = 1;
  const { isUUID: e } = _u(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, s = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function r(m) {
    return s.indexOf(
      /** @type {*} */
      m
    ) !== -1;
  }
  function l(m) {
    return m.secure === !0 ? !0 : m.secure === !1 ? !1 : m.scheme ? m.scheme.length === 3 && (m.scheme[0] === "w" || m.scheme[0] === "W") && (m.scheme[1] === "s" || m.scheme[1] === "S") && (m.scheme[2] === "s" || m.scheme[2] === "S") : !1;
  }
  function n(m) {
    return m.host || (m.error = m.error || "HTTP URIs must have a host."), m;
  }
  function i(m) {
    const v = String(m.scheme).toLowerCase() === "https";
    return (m.port === (v ? 443 : 80) || m.port === "") && (m.port = void 0), m.path || (m.path = "/"), m;
  }
  function a(m) {
    return m.secure = l(m), m.resourceName = (m.path || "/") + (m.query ? "?" + m.query : ""), m.path = void 0, m.query = void 0, m;
  }
  function u(m) {
    if ((m.port === (l(m) ? 443 : 80) || m.port === "") && (m.port = void 0), typeof m.secure == "boolean" && (m.scheme = m.secure ? "wss" : "ws", m.secure = void 0), m.resourceName) {
      const [v, R] = m.resourceName.split("?");
      m.path = v && v !== "/" ? v : void 0, m.query = R, m.resourceName = void 0;
    }
    return m.fragment = void 0, m;
  }
  function d(m, v) {
    if (!m.path)
      return m.error = "URN can not be parsed", m;
    const R = m.path.match(t);
    if (R) {
      const T = v.scheme || m.scheme || "urn";
      m.nid = R[1].toLowerCase(), m.nss = R[2];
      const C = `${T}:${v.nid || m.nid}`, V = w(C);
      m.path = void 0, V && (m = V.parse(m, v));
    } else
      m.error = m.error || "URN can not be parsed.";
    return m;
  }
  function c(m, v) {
    if (m.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const R = v.scheme || m.scheme || "urn", T = m.nid.toLowerCase(), C = `${R}:${v.nid || T}`, V = w(C);
    V && (m = V.serialize(m, v));
    const D = m, U = m.nss;
    return D.path = `${T || v.nid}:${U}`, v.skipEscape = !0, D;
  }
  function g(m, v) {
    const R = m;
    return R.uuid = R.nss, R.nss = void 0, !v.tolerant && (!R.uuid || !e(R.uuid)) && (R.error = R.error || "UUID is not valid."), R;
  }
  function _(m) {
    const v = m;
    return v.nss = (m.uuid || "").toLowerCase(), v;
  }
  const $ = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: n,
      serialize: i
    }
  ), b = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: $.domainHost,
      parse: n,
      serialize: i
    }
  ), E = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: a,
      serialize: u
    }
  ), f = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: E.domainHost,
      parse: E.parse,
      serialize: E.serialize
    }
  ), p = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: $,
      https: b,
      ws: E,
      wss: f,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: d,
          serialize: c,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: g,
          serialize: _,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(p, null);
  function w(m) {
    return m && (p[
      /** @type {SchemeName} */
      m
    ] || p[
      /** @type {SchemeName} */
      m.toLowerCase()
    ]) || void 0;
  }
  return Xn = {
    wsIsSecure: l,
    SCHEMES: p,
    isValidSchemeName: r,
    getSchemeHandler: w
  }, Xn;
}
var Za;
function $u() {
  if (Za) return St.exports;
  Za = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: s, normalizeComponentEncoding: r, isIPv4: l, nonSimpleDomain: n } = _u(), { SCHEMES: i, getSchemeHandler: a } = vl();
  function u(f, y) {
    return typeof f == "string" ? f = /** @type {T} */
    _(b(f, y), y) : typeof f == "object" && (f = /** @type {T} */
    b(_(f, y), y)), f;
  }
  function d(f, y, o) {
    const p = o ? Object.assign({ scheme: "null" }, o) : { scheme: "null" }, w = c(b(f, p), b(y, p), p, !0);
    return p.skipEscape = !0, _(w, p);
  }
  function c(f, y, o, p) {
    const w = {};
    return p || (f = b(_(f, o), o), y = b(_(y, o), o)), o = o || {}, !o.tolerant && y.scheme ? (w.scheme = y.scheme, w.userinfo = y.userinfo, w.host = y.host, w.port = y.port, w.path = t(y.path || ""), w.query = y.query) : (y.userinfo !== void 0 || y.host !== void 0 || y.port !== void 0 ? (w.userinfo = y.userinfo, w.host = y.host, w.port = y.port, w.path = t(y.path || ""), w.query = y.query) : (y.path ? (y.path[0] === "/" ? w.path = t(y.path) : ((f.userinfo !== void 0 || f.host !== void 0 || f.port !== void 0) && !f.path ? w.path = "/" + y.path : f.path ? w.path = f.path.slice(0, f.path.lastIndexOf("/") + 1) + y.path : w.path = y.path, w.path = t(w.path)), w.query = y.query) : (w.path = f.path, y.query !== void 0 ? w.query = y.query : w.query = f.query), w.userinfo = f.userinfo, w.host = f.host, w.port = f.port), w.scheme = f.scheme), w.fragment = y.fragment, w;
  }
  function g(f, y, o) {
    return typeof f == "string" ? (f = unescape(f), f = _(r(b(f, o), !0), { ...o, skipEscape: !0 })) : typeof f == "object" && (f = _(r(f, !0), { ...o, skipEscape: !0 })), typeof y == "string" ? (y = unescape(y), y = _(r(b(y, o), !0), { ...o, skipEscape: !0 })) : typeof y == "object" && (y = _(r(y, !0), { ...o, skipEscape: !0 })), f.toLowerCase() === y.toLowerCase();
  }
  function _(f, y) {
    const o = {
      host: f.host,
      scheme: f.scheme,
      userinfo: f.userinfo,
      port: f.port,
      path: f.path,
      query: f.query,
      nid: f.nid,
      nss: f.nss,
      uuid: f.uuid,
      fragment: f.fragment,
      reference: f.reference,
      resourceName: f.resourceName,
      secure: f.secure,
      error: ""
    }, p = Object.assign({}, y), w = [], m = a(p.scheme || o.scheme);
    m && m.serialize && m.serialize(o, p), o.path !== void 0 && (p.skipEscape ? o.path = unescape(o.path) : (o.path = escape(o.path), o.scheme !== void 0 && (o.path = o.path.split("%3A").join(":")))), p.reference !== "suffix" && o.scheme && w.push(o.scheme, ":");
    const v = s(o);
    if (v !== void 0 && (p.reference !== "suffix" && w.push("//"), w.push(v), o.path && o.path[0] !== "/" && w.push("/")), o.path !== void 0) {
      let R = o.path;
      !p.absolutePath && (!m || !m.absolutePath) && (R = t(R)), v === void 0 && R[0] === "/" && R[1] === "/" && (R = "/%2F" + R.slice(2)), w.push(R);
    }
    return o.query !== void 0 && w.push("?", o.query), o.fragment !== void 0 && w.push("#", o.fragment), w.join("");
  }
  const $ = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function b(f, y) {
    const o = Object.assign({}, y), p = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let w = !1;
    o.reference === "suffix" && (o.scheme ? f = o.scheme + ":" + f : f = "//" + f);
    const m = f.match($);
    if (m) {
      if (p.scheme = m[1], p.userinfo = m[3], p.host = m[4], p.port = parseInt(m[5], 10), p.path = m[6] || "", p.query = m[7], p.fragment = m[8], isNaN(p.port) && (p.port = m[5]), p.host)
        if (l(p.host) === !1) {
          const T = e(p.host);
          p.host = T.host.toLowerCase(), w = T.isIPV6;
        } else
          w = !0;
      p.scheme === void 0 && p.userinfo === void 0 && p.host === void 0 && p.port === void 0 && p.query === void 0 && !p.path ? p.reference = "same-document" : p.scheme === void 0 ? p.reference = "relative" : p.fragment === void 0 ? p.reference = "absolute" : p.reference = "uri", o.reference && o.reference !== "suffix" && o.reference !== p.reference && (p.error = p.error || "URI is not a " + o.reference + " reference.");
      const v = a(o.scheme || p.scheme);
      if (!o.unicodeSupport && (!v || !v.unicodeSupport) && p.host && (o.domainHost || v && v.domainHost) && w === !1 && n(p.host))
        try {
          p.host = URL.domainToASCII(p.host.toLowerCase());
        } catch (R) {
          p.error = p.error || "Host's domain name can not be converted to ASCII: " + R;
        }
      (!v || v && !v.skipNormalize) && (f.indexOf("%") !== -1 && (p.scheme !== void 0 && (p.scheme = unescape(p.scheme)), p.host !== void 0 && (p.host = unescape(p.host))), p.path && (p.path = escape(unescape(p.path))), p.fragment && (p.fragment = encodeURI(decodeURIComponent(p.fragment)))), v && v.parse && v.parse(p, o);
    } else
      p.error = p.error || "URI can not be parsed.";
    return p;
  }
  const E = {
    SCHEMES: i,
    normalize: u,
    resolve: d,
    resolveComponent: c,
    equal: g,
    serialize: _,
    parse: b
  };
  return St.exports = E, St.exports.default = E, St.exports.fastUri = E, St.exports;
}
var Qa;
function _l() {
  if (Qa) return Ct;
  Qa = 1, Object.defineProperty(Ct, "__esModule", { value: !0 });
  const e = $u();
  return e.code = 'require("ajv/dist/runtime/uri").default', Ct.default = e, Ct;
}
var xa;
function $l() {
  return xa || (xa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = Sn();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var s = ee();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    const r = oa(), l = Rn(), n = yu(), i = Pn(), a = ee(), u = bn(), d = vn(), c = se(), g = yl, _ = _l(), $ = (k, N) => new RegExp(k, N);
    $.code = "new RegExp";
    const b = ["removeAdditional", "useDefaults", "coerceTypes"], E = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), f = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, o = 200;
    function p(k) {
      var N, A, O, h, S, j, K, H, Q, Z, P, I, q, L, G, W, ae, pe, ue, le, oe, Re, he, et, tt;
      const Ie = k.strict, rt = (N = k.code) === null || N === void 0 ? void 0 : N.optimize, wt = rt === !0 || rt === void 0 ? 1 : rt || 0, Et = (O = (A = k.code) === null || A === void 0 ? void 0 : A.regExp) !== null && O !== void 0 ? O : $, Dn = (h = k.uriResolver) !== null && h !== void 0 ? h : _.default;
      return {
        strictSchema: (j = (S = k.strictSchema) !== null && S !== void 0 ? S : Ie) !== null && j !== void 0 ? j : !0,
        strictNumbers: (H = (K = k.strictNumbers) !== null && K !== void 0 ? K : Ie) !== null && H !== void 0 ? H : !0,
        strictTypes: (Z = (Q = k.strictTypes) !== null && Q !== void 0 ? Q : Ie) !== null && Z !== void 0 ? Z : "log",
        strictTuples: (I = (P = k.strictTuples) !== null && P !== void 0 ? P : Ie) !== null && I !== void 0 ? I : "log",
        strictRequired: (L = (q = k.strictRequired) !== null && q !== void 0 ? q : Ie) !== null && L !== void 0 ? L : !1,
        code: k.code ? { ...k.code, optimize: wt, regExp: Et } : { optimize: wt, regExp: Et },
        loopRequired: (G = k.loopRequired) !== null && G !== void 0 ? G : o,
        loopEnum: (W = k.loopEnum) !== null && W !== void 0 ? W : o,
        meta: (ae = k.meta) !== null && ae !== void 0 ? ae : !0,
        messages: (pe = k.messages) !== null && pe !== void 0 ? pe : !0,
        inlineRefs: (ue = k.inlineRefs) !== null && ue !== void 0 ? ue : !0,
        schemaId: (le = k.schemaId) !== null && le !== void 0 ? le : "$id",
        addUsedSchema: (oe = k.addUsedSchema) !== null && oe !== void 0 ? oe : !0,
        validateSchema: (Re = k.validateSchema) !== null && Re !== void 0 ? Re : !0,
        validateFormats: (he = k.validateFormats) !== null && he !== void 0 ? he : !0,
        unicodeRegExp: (et = k.unicodeRegExp) !== null && et !== void 0 ? et : !0,
        int32range: (tt = k.int32range) !== null && tt !== void 0 ? tt : !0,
        uriResolver: Dn
      };
    }
    class w {
      constructor(N = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), N = this.opts = { ...N, ...p(N) };
        const { es5: A, lines: O } = this.opts.code;
        this.scope = new a.ValueScope({ scope: {}, prefixes: E, es5: A, lines: O }), this.logger = U(N.logger);
        const h = N.validateFormats;
        N.validateFormats = !1, this.RULES = (0, n.getRules)(), m.call(this, f, N, "NOT SUPPORTED"), m.call(this, y, N, "DEPRECATED", "warn"), this._metaOpts = V.call(this), N.formats && T.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), N.keywords && C.call(this, N.keywords), typeof N.meta == "object" && this.addMetaSchema(N.meta), R.call(this), N.validateFormats = h;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: N, meta: A, schemaId: O } = this.opts;
        let h = g;
        O === "id" && (h = { ...g }, h.id = h.$id, delete h.$id), A && N && this.addMetaSchema(h, h[O], !1);
      }
      defaultMeta() {
        const { meta: N, schemaId: A } = this.opts;
        return this.opts.defaultMeta = typeof N == "object" ? N[A] || N : void 0;
      }
      validate(N, A) {
        let O;
        if (typeof N == "string") {
          if (O = this.getSchema(N), !O)
            throw new Error(`no schema with key or ref "${N}"`);
        } else
          O = this.compile(N);
        const h = O(A);
        return "$async" in O || (this.errors = O.errors), h;
      }
      compile(N, A) {
        const O = this._addSchema(N, A);
        return O.validate || this._compileSchemaEnv(O);
      }
      compileAsync(N, A) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: O } = this.opts;
        return h.call(this, N, A);
        async function h(Z, P) {
          await S.call(this, Z.$schema);
          const I = this._addSchema(Z, P);
          return I.validate || j.call(this, I);
        }
        async function S(Z) {
          Z && !this.getSchema(Z) && await h.call(this, { $ref: Z }, !0);
        }
        async function j(Z) {
          try {
            return this._compileSchemaEnv(Z);
          } catch (P) {
            if (!(P instanceof l.default))
              throw P;
            return K.call(this, P), await H.call(this, P.missingSchema), j.call(this, Z);
          }
        }
        function K({ missingSchema: Z, missingRef: P }) {
          if (this.refs[Z])
            throw new Error(`AnySchema ${Z} is loaded but ${P} cannot be resolved`);
        }
        async function H(Z) {
          const P = await Q.call(this, Z);
          this.refs[Z] || await S.call(this, P.$schema), this.refs[Z] || this.addSchema(P, Z, A);
        }
        async function Q(Z) {
          const P = this._loading[Z];
          if (P)
            return P;
          try {
            return await (this._loading[Z] = O(Z));
          } finally {
            delete this._loading[Z];
          }
        }
      }
      // Adds schema to the instance
      addSchema(N, A, O, h = this.opts.validateSchema) {
        if (Array.isArray(N)) {
          for (const j of N)
            this.addSchema(j, void 0, O, h);
          return this;
        }
        let S;
        if (typeof N == "object") {
          const { schemaId: j } = this.opts;
          if (S = N[j], S !== void 0 && typeof S != "string")
            throw new Error(`schema ${j} must be string`);
        }
        return A = (0, u.normalizeId)(A || S), this._checkUnique(A), this.schemas[A] = this._addSchema(N, O, A, h, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(N, A, O = this.opts.validateSchema) {
        return this.addSchema(N, A, !0, O), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(N, A) {
        if (typeof N == "boolean")
          return !0;
        let O;
        if (O = N.$schema, O !== void 0 && typeof O != "string")
          throw new Error("$schema must be a string");
        if (O = O || this.opts.defaultMeta || this.defaultMeta(), !O)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const h = this.validate(O, N);
        if (!h && A) {
          const S = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(S);
          else
            throw new Error(S);
        }
        return h;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(N) {
        let A;
        for (; typeof (A = v.call(this, N)) == "string"; )
          N = A;
        if (A === void 0) {
          const { schemaId: O } = this.opts, h = new i.SchemaEnv({ schema: {}, schemaId: O });
          if (A = i.resolveSchema.call(this, h, N), !A)
            return;
          this.refs[N] = A;
        }
        return A.validate || this._compileSchemaEnv(A);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(N) {
        if (N instanceof RegExp)
          return this._removeAllSchemas(this.schemas, N), this._removeAllSchemas(this.refs, N), this;
        switch (typeof N) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const A = v.call(this, N);
            return typeof A == "object" && this._cache.delete(A.schema), delete this.schemas[N], delete this.refs[N], this;
          }
          case "object": {
            const A = N;
            this._cache.delete(A);
            let O = N[this.opts.schemaId];
            return O && (O = (0, u.normalizeId)(O), delete this.schemas[O], delete this.refs[O]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(N) {
        for (const A of N)
          this.addKeyword(A);
        return this;
      }
      addKeyword(N, A) {
        let O;
        if (typeof N == "string")
          O = N, typeof A == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), A.keyword = O);
        else if (typeof N == "object" && A === void 0) {
          if (A = N, O = A.keyword, Array.isArray(O) && !O.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (M.call(this, O, A), !A)
          return (0, c.eachItem)(O, (S) => F.call(this, S)), this;
        B.call(this, A);
        const h = {
          ...A,
          type: (0, d.getJSONTypes)(A.type),
          schemaType: (0, d.getJSONTypes)(A.schemaType)
        };
        return (0, c.eachItem)(O, h.type.length === 0 ? (S) => F.call(this, S, h) : (S) => h.type.forEach((j) => F.call(this, S, h, j))), this;
      }
      getKeyword(N) {
        const A = this.RULES.all[N];
        return typeof A == "object" ? A.definition : !!A;
      }
      // Remove keyword
      removeKeyword(N) {
        const { RULES: A } = this;
        delete A.keywords[N], delete A.all[N];
        for (const O of A.rules) {
          const h = O.rules.findIndex((S) => S.keyword === N);
          h >= 0 && O.rules.splice(h, 1);
        }
        return this;
      }
      // Add format
      addFormat(N, A) {
        return typeof A == "string" && (A = new RegExp(A)), this.formats[N] = A, this;
      }
      errorsText(N = this.errors, { separator: A = ", ", dataVar: O = "data" } = {}) {
        return !N || N.length === 0 ? "No errors" : N.map((h) => `${O}${h.instancePath} ${h.message}`).reduce((h, S) => h + A + S);
      }
      $dataMetaSchema(N, A) {
        const O = this.RULES.all;
        N = JSON.parse(JSON.stringify(N));
        for (const h of A) {
          const S = h.split("/").slice(1);
          let j = N;
          for (const K of S)
            j = j[K];
          for (const K in O) {
            const H = O[K];
            if (typeof H != "object")
              continue;
            const { $data: Q } = H.definition, Z = j[K];
            Q && Z && (j[K] = Y(Z));
          }
        }
        return N;
      }
      _removeAllSchemas(N, A) {
        for (const O in N) {
          const h = N[O];
          (!A || A.test(O)) && (typeof h == "string" ? delete N[O] : h && !h.meta && (this._cache.delete(h.schema), delete N[O]));
        }
      }
      _addSchema(N, A, O, h = this.opts.validateSchema, S = this.opts.addUsedSchema) {
        let j;
        const { schemaId: K } = this.opts;
        if (typeof N == "object")
          j = N[K];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof N != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let H = this._cache.get(N);
        if (H !== void 0)
          return H;
        O = (0, u.normalizeId)(j || O);
        const Q = u.getSchemaRefs.call(this, N, O);
        return H = new i.SchemaEnv({ schema: N, schemaId: K, meta: A, baseId: O, localRefs: Q }), this._cache.set(H.schema, H), S && !O.startsWith("#") && (O && this._checkUnique(O), this.refs[O] = H), h && this.validateSchema(N, !0), H;
      }
      _checkUnique(N) {
        if (this.schemas[N] || this.refs[N])
          throw new Error(`schema with key or id "${N}" already exists`);
      }
      _compileSchemaEnv(N) {
        if (N.meta ? this._compileMetaSchema(N) : i.compileSchema.call(this, N), !N.validate)
          throw new Error("ajv implementation error");
        return N.validate;
      }
      _compileMetaSchema(N) {
        const A = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, N);
        } finally {
          this.opts = A;
        }
      }
    }
    w.ValidationError = r.default, w.MissingRefError = l.default, e.default = w;
    function m(k, N, A, O = "error") {
      for (const h in k) {
        const S = h;
        S in N && this.logger[O](`${A}: option ${h}. ${k[S]}`);
      }
    }
    function v(k) {
      return k = (0, u.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function R() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const N in k)
            this.addSchema(k[N], N);
    }
    function T() {
      for (const k in this.opts.formats) {
        const N = this.opts.formats[k];
        N && this.addFormat(k, N);
      }
    }
    function C(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const N in k) {
        const A = k[N];
        A.keyword || (A.keyword = N), this.addKeyword(A);
      }
    }
    function V() {
      const k = { ...this.opts };
      for (const N of b)
        delete k[N];
      return k;
    }
    const D = { log() {
    }, warn() {
    }, error() {
    } };
    function U(k) {
      if (k === !1)
        return D;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const z = /^[a-z_$][a-z0-9_$:-]*$/i;
    function M(k, N) {
      const { RULES: A } = this;
      if ((0, c.eachItem)(k, (O) => {
        if (A.keywords[O])
          throw new Error(`Keyword ${O} is already defined`);
        if (!z.test(O))
          throw new Error(`Keyword ${O} has invalid name`);
      }), !!N && N.$data && !("code" in N || "validate" in N))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function F(k, N, A) {
      var O;
      const h = N?.post;
      if (A && h)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: S } = this;
      let j = h ? S.post : S.rules.find(({ type: H }) => H === A);
      if (j || (j = { type: A, rules: [] }, S.rules.push(j)), S.keywords[k] = !0, !N)
        return;
      const K = {
        keyword: k,
        definition: {
          ...N,
          type: (0, d.getJSONTypes)(N.type),
          schemaType: (0, d.getJSONTypes)(N.schemaType)
        }
      };
      N.before ? X.call(this, j, K, N.before) : j.rules.push(K), S.all[k] = K, (O = N.implements) === null || O === void 0 || O.forEach((H) => this.addKeyword(H));
    }
    function X(k, N, A) {
      const O = k.rules.findIndex((h) => h.keyword === A);
      O >= 0 ? k.rules.splice(O, 0, N) : (k.rules.push(N), this.logger.warn(`rule ${A} is not defined`));
    }
    function B(k) {
      let { metaSchema: N } = k;
      N !== void 0 && (k.$data && this.opts.$data && (N = Y(N)), k.validateSchema = this.compile(N, !0));
    }
    const J = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(k) {
      return { anyOf: [k, J] };
    }
  })(Fn)), Fn;
}
var Dt = {}, Mt = {}, Lt = {}, eo;
function gl() {
  if (eo) return Lt;
  eo = 1, Object.defineProperty(Lt, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Lt.default = e, Lt;
}
var Be = {}, to;
function ia() {
  if (to) return Be;
  to = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.callRef = Be.getValidate = void 0;
  const e = Rn(), t = ke(), s = ee(), r = Ae(), l = Pn(), n = se(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(d) {
      const { gen: c, schema: g, it: _ } = d, { baseId: $, schemaEnv: b, validateName: E, opts: f, self: y } = _, { root: o } = b;
      if ((g === "#" || g === "#/") && $ === o.baseId)
        return w();
      const p = l.resolveRef.call(y, o, $, g);
      if (p === void 0)
        throw new e.default(_.opts.uriResolver, $, g);
      if (p instanceof l.SchemaEnv)
        return m(p);
      return v(p);
      function w() {
        if (b === o)
          return u(d, E, b, b.$async);
        const R = c.scopeValue("root", { ref: o });
        return u(d, (0, s._)`${R}.validate`, o, o.$async);
      }
      function m(R) {
        const T = a(d, R);
        u(d, T, R, R.$async);
      }
      function v(R) {
        const T = c.scopeValue("schema", f.code.source === !0 ? { ref: R, code: (0, s.stringify)(R) } : { ref: R }), C = c.name("valid"), V = d.subschema({
          schema: R,
          dataTypes: [],
          schemaPath: s.nil,
          topSchemaRef: T,
          errSchemaPath: g
        }, C);
        d.mergeEvaluated(V), d.ok(C);
      }
    }
  };
  function a(d, c) {
    const { gen: g } = d;
    return c.validate ? g.scopeValue("validate", { ref: c.validate }) : (0, s._)`${g.scopeValue("wrapper", { ref: c })}.validate`;
  }
  Be.getValidate = a;
  function u(d, c, g, _) {
    const { gen: $, it: b } = d, { allErrors: E, schemaEnv: f, opts: y } = b, o = y.passContext ? r.default.this : s.nil;
    _ ? p() : w();
    function p() {
      if (!f.$async)
        throw new Error("async schema referenced by sync schema");
      const R = $.let("valid");
      $.try(() => {
        $.code((0, s._)`await ${(0, t.callValidateCode)(d, c, o)}`), v(c), E || $.assign(R, !0);
      }, (T) => {
        $.if((0, s._)`!(${T} instanceof ${b.ValidationError})`, () => $.throw(T)), m(T), E || $.assign(R, !1);
      }), d.ok(R);
    }
    function w() {
      d.result((0, t.callValidateCode)(d, c, o), () => v(c), () => m(c));
    }
    function m(R) {
      const T = (0, s._)`${R}.errors`;
      $.assign(r.default.vErrors, (0, s._)`${r.default.vErrors} === null ? ${T} : ${r.default.vErrors}.concat(${T})`), $.assign(r.default.errors, (0, s._)`${r.default.vErrors}.length`);
    }
    function v(R) {
      var T;
      if (!b.opts.unevaluated)
        return;
      const C = (T = g?.validate) === null || T === void 0 ? void 0 : T.evaluated;
      if (b.props !== !0)
        if (C && !C.dynamicProps)
          C.props !== void 0 && (b.props = n.mergeEvaluated.props($, C.props, b.props));
        else {
          const V = $.var("props", (0, s._)`${R}.evaluated.props`);
          b.props = n.mergeEvaluated.props($, V, b.props, s.Name);
        }
      if (b.items !== !0)
        if (C && !C.dynamicItems)
          C.items !== void 0 && (b.items = n.mergeEvaluated.items($, C.items, b.items));
        else {
          const V = $.var("items", (0, s._)`${R}.evaluated.items`);
          b.items = n.mergeEvaluated.items($, V, b.items, s.Name);
        }
    }
  }
  return Be.callRef = u, Be.default = i, Be;
}
var ro;
function wl() {
  if (ro) return Mt;
  ro = 1, Object.defineProperty(Mt, "__esModule", { value: !0 });
  const e = gl(), t = ia(), s = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return Mt.default = s, Mt;
}
var Vt = {}, Ft = {}, no;
function El() {
  if (no) return Ft;
  no = 1, Object.defineProperty(Ft, "__esModule", { value: !0 });
  const e = ee(), t = e.operators, s = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: i }) => (0, e.str)`must be ${s[n].okStr} ${i}`,
    params: ({ keyword: n, schemaCode: i }) => (0, e._)`{comparison: ${s[n].okStr}, limit: ${i}}`
  }, l = {
    keyword: Object.keys(s),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: i, data: a, schemaCode: u } = n;
      n.fail$data((0, e._)`${a} ${s[i].fail} ${u} || isNaN(${a})`);
    }
  };
  return Ft.default = l, Ft;
}
var Ut = {}, so;
function bl() {
  if (so) return Ut;
  so = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: l, data: n, schemaCode: i, it: a } = r, u = a.opts.multipleOfPrecision, d = l.let("res"), c = u ? (0, e._)`Math.abs(Math.round(${d}) - ${d}) > 1e-${u}` : (0, e._)`${d} !== parseInt(${d})`;
      r.fail$data((0, e._)`(${i} === 0 || (${d} = ${n}/${i}, ${c}))`);
    }
  };
  return Ut.default = s, Ut;
}
var zt = {}, Kt = {}, ao;
function Sl() {
  if (ao) return Kt;
  ao = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  function e(t) {
    const s = t.length;
    let r = 0, l = 0, n;
    for (; l < s; )
      r++, n = t.charCodeAt(l++), n >= 55296 && n <= 56319 && l < s && (n = t.charCodeAt(l), (n & 64512) === 56320 && l++);
    return r;
  }
  return Kt.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Kt;
}
var oo;
function Rl() {
  if (oo) return zt;
  oo = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = Sl(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const a = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${a} than ${i} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: a, schemaCode: u, it: d } = n, c = i === "maxLength" ? e.operators.GT : e.operators.LT, g = d.opts.unicode === !1 ? (0, e._)`${a}.length` : (0, e._)`${(0, t.useFunc)(n.gen, s.default)}(${a})`;
      n.fail$data((0, e._)`${g} ${c} ${u}`);
    }
  };
  return zt.default = l, zt;
}
var Gt = {}, io;
function Pl() {
  if (io) return Gt;
  io = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const e = ke(), t = ee(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, t.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, t._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: n, $data: i, schema: a, schemaCode: u, it: d } = l, c = d.opts.unicodeRegExp ? "u" : "", g = i ? (0, t._)`(new RegExp(${u}, ${c}))` : (0, e.usePattern)(l, a);
      l.fail$data((0, t._)`!${g}.test(${n})`);
    }
  };
  return Gt.default = r, Gt;
}
var Ht = {}, co;
function Nl() {
  if (co) return Ht;
  co = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, a = l === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${a} ${i}`);
    }
  };
  return Ht.default = s, Ht;
}
var Jt = {}, uo;
function Ol() {
  if (uo) return Jt;
  uo = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = ke(), t = ee(), s = se(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: i, schema: a, schemaCode: u, data: d, $data: c, it: g } = n, { opts: _ } = g;
      if (!c && a.length === 0)
        return;
      const $ = a.length >= _.loopRequired;
      if (g.allErrors ? b() : E(), _.strictRequired) {
        const o = n.parentSchema.properties, { definedProperties: p } = n.it;
        for (const w of a)
          if (o?.[w] === void 0 && !p.has(w)) {
            const m = g.schemaEnv.baseId + g.errSchemaPath, v = `required property "${w}" is not defined at "${m}" (strictRequired)`;
            (0, s.checkStrictMode)(g, v, g.opts.strictRequired);
          }
      }
      function b() {
        if ($ || c)
          n.block$data(t.nil, f);
        else
          for (const o of a)
            (0, e.checkReportMissingProp)(n, o);
      }
      function E() {
        const o = i.let("missing");
        if ($ || c) {
          const p = i.let("valid", !0);
          n.block$data(p, () => y(o, p)), n.ok(p);
        } else
          i.if((0, e.checkMissingProp)(n, a, o)), (0, e.reportMissingProp)(n, o), i.else();
      }
      function f() {
        i.forOf("prop", u, (o) => {
          n.setParams({ missingProperty: o }), i.if((0, e.noPropertyInData)(i, d, o, _.ownProperties), () => n.error());
        });
      }
      function y(o, p) {
        n.setParams({ missingProperty: o }), i.forOf(o, u, () => {
          i.assign(p, (0, e.propertyInData)(i, d, o, _.ownProperties)), i.if((0, t.not)(p), () => {
            n.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return Jt.default = l, Jt;
}
var Bt = {}, lo;
function Il() {
  if (lo) return Bt;
  lo = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, a = l === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${a} ${i}`);
    }
  };
  return Bt.default = s, Bt;
}
var Xt = {}, Wt = {}, fo;
function ca() {
  if (fo) return Wt;
  fo = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = En();
  return e.code = 'require("ajv/dist/runtime/equal").default', Wt.default = e, Wt;
}
var ho;
function Tl() {
  if (ho) return Xt;
  ho = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = vn(), t = ee(), s = se(), r = ca(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: a } }) => (0, t.str)`must NOT have duplicate items (items ## ${a} and ${i} are identical)`,
      params: ({ params: { i, j: a } }) => (0, t._)`{i: ${i}, j: ${a}}`
    },
    code(i) {
      const { gen: a, data: u, $data: d, schema: c, parentSchema: g, schemaCode: _, it: $ } = i;
      if (!d && !c)
        return;
      const b = a.let("valid"), E = g.items ? (0, e.getSchemaTypes)(g.items) : [];
      i.block$data(b, f, (0, t._)`${_} === false`), i.ok(b);
      function f() {
        const w = a.let("i", (0, t._)`${u}.length`), m = a.let("j");
        i.setParams({ i: w, j: m }), a.assign(b, !0), a.if((0, t._)`${w} > 1`, () => (y() ? o : p)(w, m));
      }
      function y() {
        return E.length > 0 && !E.some((w) => w === "object" || w === "array");
      }
      function o(w, m) {
        const v = a.name("item"), R = (0, e.checkDataTypes)(E, v, $.opts.strictNumbers, e.DataType.Wrong), T = a.const("indices", (0, t._)`{}`);
        a.for((0, t._)`;${w}--;`, () => {
          a.let(v, (0, t._)`${u}[${w}]`), a.if(R, (0, t._)`continue`), E.length > 1 && a.if((0, t._)`typeof ${v} == "string"`, (0, t._)`${v} += "_"`), a.if((0, t._)`typeof ${T}[${v}] == "number"`, () => {
            a.assign(m, (0, t._)`${T}[${v}]`), i.error(), a.assign(b, !1).break();
          }).code((0, t._)`${T}[${v}] = ${w}`);
        });
      }
      function p(w, m) {
        const v = (0, s.useFunc)(a, r.default), R = a.name("outer");
        a.label(R).for((0, t._)`;${w}--;`, () => a.for((0, t._)`${m} = ${w}; ${m}--;`, () => a.if((0, t._)`${v}(${u}[${w}], ${u}[${m}])`, () => {
          i.error(), a.assign(b, !1).break(R);
        })));
      }
    }
  };
  return Xt.default = n, Xt;
}
var Yt = {}, mo;
function jl() {
  if (mo) return Yt;
  mo = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = ca(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: u, schemaCode: d, schema: c } = n;
      u || c && typeof c == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(i, s.default)}(${a}, ${d})`) : n.fail((0, e._)`${c} !== ${a}`);
    }
  };
  return Yt.default = l, Yt;
}
var Zt = {}, po;
function Al() {
  if (po) return Zt;
  po = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = ca(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: u, schema: d, schemaCode: c, it: g } = n;
      if (!u && d.length === 0)
        throw new Error("enum must have non-empty array");
      const _ = d.length >= g.opts.loopEnum;
      let $;
      const b = () => $ ?? ($ = (0, t.useFunc)(i, s.default));
      let E;
      if (_ || u)
        E = i.let("valid"), n.block$data(E, f);
      else {
        if (!Array.isArray(d))
          throw new Error("ajv implementation error");
        const o = i.const("vSchema", c);
        E = (0, e.or)(...d.map((p, w) => y(o, w)));
      }
      n.pass(E);
      function f() {
        i.assign(E, !1), i.forOf("v", c, (o) => i.if((0, e._)`${b()}(${a}, ${o})`, () => i.assign(E, !0).break()));
      }
      function y(o, p) {
        const w = d[p];
        return typeof w == "object" && w !== null ? (0, e._)`${b()}(${a}, ${o}[${p}])` : (0, e._)`${a} === ${w}`;
      }
    }
  };
  return Zt.default = l, Zt;
}
var yo;
function kl() {
  if (yo) return Vt;
  yo = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = El(), t = bl(), s = Rl(), r = Pl(), l = Nl(), n = Ol(), i = Il(), a = Tl(), u = jl(), d = Al(), c = [
    // number
    e.default,
    t.default,
    // string
    s.default,
    r.default,
    // object
    l.default,
    n.default,
    // array
    i.default,
    a.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    d.default
  ];
  return Vt.default = c, Vt;
}
var Qt = {}, dt = {}, vo;
function gu() {
  if (vo) return dt;
  vo = 1, Object.defineProperty(dt, "__esModule", { value: !0 }), dt.validateAdditionalItems = void 0;
  const e = ee(), t = se(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: i, it: a } = n, { items: u } = i;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(a, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(n, u);
    }
  };
  function l(n, i) {
    const { gen: a, schema: u, data: d, keyword: c, it: g } = n;
    g.items = !0;
    const _ = a.const("len", (0, e._)`${d}.length`);
    if (u === !1)
      n.setParams({ len: i.length }), n.pass((0, e._)`${_} <= ${i.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)(g, u)) {
      const b = a.var("valid", (0, e._)`${_} <= ${i.length}`);
      a.if((0, e.not)(b), () => $(b)), n.ok(b);
    }
    function $(b) {
      a.forRange("i", i.length, _, (E) => {
        n.subschema({ keyword: c, dataProp: E, dataPropType: t.Type.Num }, b), g.allErrors || a.if((0, e.not)(b), () => a.break());
      });
    }
  }
  return dt.validateAdditionalItems = l, dt.default = r, dt;
}
var xt = {}, ft = {}, _o;
function wu() {
  if (_o) return ft;
  _o = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.validateTuple = void 0;
  const e = ee(), t = se(), s = ke(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: i, it: a } = n;
      if (Array.isArray(i))
        return l(n, "additionalItems", i);
      a.items = !0, !(0, t.alwaysValidSchema)(a, i) && n.ok((0, s.validateArray)(n));
    }
  };
  function l(n, i, a = n.schema) {
    const { gen: u, parentSchema: d, data: c, keyword: g, it: _ } = n;
    E(d), _.opts.unevaluated && a.length && _.items !== !0 && (_.items = t.mergeEvaluated.items(u, a.length, _.items));
    const $ = u.name("valid"), b = u.const("len", (0, e._)`${c}.length`);
    a.forEach((f, y) => {
      (0, t.alwaysValidSchema)(_, f) || (u.if((0, e._)`${b} > ${y}`, () => n.subschema({
        keyword: g,
        schemaProp: y,
        dataProp: y
      }, $)), n.ok($));
    });
    function E(f) {
      const { opts: y, errSchemaPath: o } = _, p = a.length, w = p === f.minItems && (p === f.maxItems || f[i] === !1);
      if (y.strictTuples && !w) {
        const m = `"${g}" is ${p}-tuple, but minItems or maxItems/${i} are not specified or different at path "${o}"`;
        (0, t.checkStrictMode)(_, m, y.strictTuples);
      }
    }
  }
  return ft.validateTuple = l, ft.default = r, ft;
}
var $o;
function ql() {
  if ($o) return xt;
  $o = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const e = wu(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (s) => (0, e.validateTuple)(s, "items")
  };
  return xt.default = t, xt;
}
var er = {}, go;
function Cl() {
  if (go) return er;
  go = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = ke(), r = gu(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: a, parentSchema: u, it: d } = i, { prefixItems: c } = u;
      d.items = !0, !(0, t.alwaysValidSchema)(d, a) && (c ? (0, r.validateAdditionalItems)(i, c) : i.ok((0, s.validateArray)(i)));
    }
  };
  return er.default = n, er;
}
var tr = {}, wo;
function Dl() {
  if (wo) return tr;
  wo = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${l} valid item(s)` : (0, e.str)`must contain at least ${l} and no more than ${n} valid item(s)`,
      params: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${l}}` : (0, e._)`{minContains: ${l}, maxContains: ${n}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: a, data: u, it: d } = l;
      let c, g;
      const { minContains: _, maxContains: $ } = a;
      d.opts.next ? (c = _ === void 0 ? 1 : _, g = $) : c = 1;
      const b = n.const("len", (0, e._)`${u}.length`);
      if (l.setParams({ min: c, max: g }), g === void 0 && c === 0) {
        (0, t.checkStrictMode)(d, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (g !== void 0 && c > g) {
        (0, t.checkStrictMode)(d, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(d, i)) {
        let p = (0, e._)`${b} >= ${c}`;
        g !== void 0 && (p = (0, e._)`${p} && ${b} <= ${g}`), l.pass(p);
        return;
      }
      d.items = !0;
      const E = n.name("valid");
      g === void 0 && c === 1 ? y(E, () => n.if(E, () => n.break())) : c === 0 ? (n.let(E, !0), g !== void 0 && n.if((0, e._)`${u}.length > 0`, f)) : (n.let(E, !1), f()), l.result(E, () => l.reset());
      function f() {
        const p = n.name("_valid"), w = n.let("count", 0);
        y(p, () => n.if(p, () => o(w)));
      }
      function y(p, w) {
        n.forRange("i", 0, b, (m) => {
          l.subschema({
            keyword: "contains",
            dataProp: m,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, p), w();
        });
      }
      function o(p) {
        n.code((0, e._)`${p}++`), g === void 0 ? n.if((0, e._)`${p} >= ${c}`, () => n.assign(E, !0).break()) : (n.if((0, e._)`${p} > ${g}`, () => n.assign(E, !1).break()), c === 1 ? n.assign(E, !0) : n.if((0, e._)`${p} >= ${c}`, () => n.assign(E, !0)));
      }
    }
  };
  return tr.default = r, tr;
}
var Wn = {}, Eo;
function ua() {
  return Eo || (Eo = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = ee(), s = se(), r = ke();
    e.error = {
      message: ({ params: { property: u, depsCount: d, deps: c } }) => {
        const g = d === 1 ? "property" : "properties";
        return (0, t.str)`must have ${g} ${c} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: d, deps: c, missingProperty: g } }) => (0, t._)`{property: ${u},
    missingProperty: ${g},
    depsCount: ${d},
    deps: ${c}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [d, c] = n(u);
        i(u, d), a(u, c);
      }
    };
    function n({ schema: u }) {
      const d = {}, c = {};
      for (const g in u) {
        if (g === "__proto__")
          continue;
        const _ = Array.isArray(u[g]) ? d : c;
        _[g] = u[g];
      }
      return [d, c];
    }
    function i(u, d = u.schema) {
      const { gen: c, data: g, it: _ } = u;
      if (Object.keys(d).length === 0)
        return;
      const $ = c.let("missing");
      for (const b in d) {
        const E = d[b];
        if (E.length === 0)
          continue;
        const f = (0, r.propertyInData)(c, g, b, _.opts.ownProperties);
        u.setParams({
          property: b,
          depsCount: E.length,
          deps: E.join(", ")
        }), _.allErrors ? c.if(f, () => {
          for (const y of E)
            (0, r.checkReportMissingProp)(u, y);
        }) : (c.if((0, t._)`${f} && (${(0, r.checkMissingProp)(u, E, $)})`), (0, r.reportMissingProp)(u, $), c.else());
      }
    }
    e.validatePropertyDeps = i;
    function a(u, d = u.schema) {
      const { gen: c, data: g, keyword: _, it: $ } = u, b = c.name("valid");
      for (const E in d)
        (0, s.alwaysValidSchema)($, d[E]) || (c.if(
          (0, r.propertyInData)(c, g, E, $.opts.ownProperties),
          () => {
            const f = u.subschema({ keyword: _, schemaProp: E }, b);
            u.mergeValidEvaluated(f, b);
          },
          () => c.var(b, !0)
          // TODO var
        ), u.ok(b));
    }
    e.validateSchemaDeps = a, e.default = l;
  })(Wn)), Wn;
}
var rr = {}, bo;
function Ml() {
  if (bo) return rr;
  bo = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, e._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: n, schema: i, data: a, it: u } = l;
      if ((0, t.alwaysValidSchema)(u, i))
        return;
      const d = n.name("valid");
      n.forIn("key", a, (c) => {
        l.setParams({ propertyName: c }), l.subschema({
          keyword: "propertyNames",
          data: c,
          dataTypes: ["string"],
          propertyName: c,
          compositeRule: !0
        }, d), n.if((0, e.not)(d), () => {
          l.error(!0), u.allErrors || n.break();
        });
      }), l.ok(d);
    }
  };
  return rr.default = r, rr;
}
var nr = {}, So;
function Eu() {
  if (So) return nr;
  So = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = ke(), t = ee(), s = Ae(), r = se(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: i }) => (0, t._)`{additionalProperty: ${i.additionalProperty}}`
    },
    code(i) {
      const { gen: a, schema: u, parentSchema: d, data: c, errsCount: g, it: _ } = i;
      if (!g)
        throw new Error("ajv implementation error");
      const { allErrors: $, opts: b } = _;
      if (_.props = !0, b.removeAdditional !== "all" && (0, r.alwaysValidSchema)(_, u))
        return;
      const E = (0, e.allSchemaProperties)(d.properties), f = (0, e.allSchemaProperties)(d.patternProperties);
      y(), i.ok((0, t._)`${g} === ${s.default.errors}`);
      function y() {
        a.forIn("key", c, (v) => {
          !E.length && !f.length ? w(v) : a.if(o(v), () => w(v));
        });
      }
      function o(v) {
        let R;
        if (E.length > 8) {
          const T = (0, r.schemaRefOrVal)(_, d.properties, "properties");
          R = (0, e.isOwnProperty)(a, T, v);
        } else E.length ? R = (0, t.or)(...E.map((T) => (0, t._)`${v} === ${T}`)) : R = t.nil;
        return f.length && (R = (0, t.or)(R, ...f.map((T) => (0, t._)`${(0, e.usePattern)(i, T)}.test(${v})`))), (0, t.not)(R);
      }
      function p(v) {
        a.code((0, t._)`delete ${c}[${v}]`);
      }
      function w(v) {
        if (b.removeAdditional === "all" || b.removeAdditional && u === !1) {
          p(v);
          return;
        }
        if (u === !1) {
          i.setParams({ additionalProperty: v }), i.error(), $ || a.break();
          return;
        }
        if (typeof u == "object" && !(0, r.alwaysValidSchema)(_, u)) {
          const R = a.name("valid");
          b.removeAdditional === "failing" ? (m(v, R, !1), a.if((0, t.not)(R), () => {
            i.reset(), p(v);
          })) : (m(v, R), $ || a.if((0, t.not)(R), () => a.break()));
        }
      }
      function m(v, R, T) {
        const C = {
          keyword: "additionalProperties",
          dataProp: v,
          dataPropType: r.Type.Str
        };
        T === !1 && Object.assign(C, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(C, R);
      }
    }
  };
  return nr.default = n, nr;
}
var sr = {}, Ro;
function Ll() {
  if (Ro) return sr;
  Ro = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = Sn(), t = ke(), s = se(), r = Eu(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, parentSchema: u, data: d, it: c } = n;
      c.opts.removeAdditional === "all" && u.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(c, r.default, "additionalProperties"));
      const g = (0, t.allSchemaProperties)(a);
      for (const f of g)
        c.definedProperties.add(f);
      c.opts.unevaluated && g.length && c.props !== !0 && (c.props = s.mergeEvaluated.props(i, (0, s.toHash)(g), c.props));
      const _ = g.filter((f) => !(0, s.alwaysValidSchema)(c, a[f]));
      if (_.length === 0)
        return;
      const $ = i.name("valid");
      for (const f of _)
        b(f) ? E(f) : (i.if((0, t.propertyInData)(i, d, f, c.opts.ownProperties)), E(f), c.allErrors || i.else().var($, !0), i.endIf()), n.it.definedProperties.add(f), n.ok($);
      function b(f) {
        return c.opts.useDefaults && !c.compositeRule && a[f].default !== void 0;
      }
      function E(f) {
        n.subschema({
          keyword: "properties",
          schemaProp: f,
          dataProp: f
        }, $);
      }
    }
  };
  return sr.default = l, sr;
}
var ar = {}, Po;
function Vl() {
  if (Po) return ar;
  Po = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = ke(), t = ee(), s = se(), r = se(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, data: u, parentSchema: d, it: c } = n, { opts: g } = c, _ = (0, e.allSchemaProperties)(a), $ = _.filter((w) => (0, s.alwaysValidSchema)(c, a[w]));
      if (_.length === 0 || $.length === _.length && (!c.opts.unevaluated || c.props === !0))
        return;
      const b = g.strictSchema && !g.allowMatchingProperties && d.properties, E = i.name("valid");
      c.props !== !0 && !(c.props instanceof t.Name) && (c.props = (0, r.evaluatedPropsToName)(i, c.props));
      const { props: f } = c;
      y();
      function y() {
        for (const w of _)
          b && o(w), c.allErrors ? p(w) : (i.var(E, !0), p(w), i.if(E));
      }
      function o(w) {
        for (const m in b)
          new RegExp(w).test(m) && (0, s.checkStrictMode)(c, `property ${m} matches pattern ${w} (use allowMatchingProperties)`);
      }
      function p(w) {
        i.forIn("key", u, (m) => {
          i.if((0, t._)`${(0, e.usePattern)(n, w)}.test(${m})`, () => {
            const v = $.includes(w);
            v || n.subschema({
              keyword: "patternProperties",
              schemaProp: w,
              dataProp: m,
              dataPropType: r.Type.Str
            }, E), c.opts.unevaluated && f !== !0 ? i.assign((0, t._)`${f}[${m}]`, !0) : !v && !c.allErrors && i.if((0, t.not)(E), () => i.break());
          });
        });
      }
    }
  };
  return ar.default = l, ar;
}
var or = {}, No;
function Fl() {
  if (No) return or;
  No = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if ((0, e.alwaysValidSchema)(n, l)) {
        s.fail();
        return;
      }
      const i = r.name("valid");
      s.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), s.failResult(i, () => s.reset(), () => s.error());
    },
    error: { message: "must NOT be valid" }
  };
  return or.default = t, or;
}
var ir = {}, Oo;
function Ul() {
  if (Oo) return ir;
  Oo = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: ke().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return ir.default = t, ir;
}
var cr = {}, Io;
function zl() {
  if (Io) return cr;
  Io = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, e._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: a, it: u } = l;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && a.discriminator)
        return;
      const d = i, c = n.let("valid", !1), g = n.let("passing", null), _ = n.name("_valid");
      l.setParams({ passing: g }), n.block($), l.result(c, () => l.reset(), () => l.error(!0));
      function $() {
        d.forEach((b, E) => {
          let f;
          (0, t.alwaysValidSchema)(u, b) ? n.var(_, !0) : f = l.subschema({
            keyword: "oneOf",
            schemaProp: E,
            compositeRule: !0
          }, _), E > 0 && n.if((0, e._)`${_} && ${c}`).assign(c, !1).assign(g, (0, e._)`[${g}, ${E}]`).else(), n.if(_, () => {
            n.assign(c, !0), n.assign(g, E), f && l.mergeEvaluated(f, e.Name);
          });
        });
      }
    }
  };
  return cr.default = r, cr;
}
var ur = {}, To;
function Kl() {
  if (To) return ur;
  To = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const i = r.name("valid");
      l.forEach((a, u) => {
        if ((0, e.alwaysValidSchema)(n, a))
          return;
        const d = s.subschema({ keyword: "allOf", schemaProp: u }, i);
        s.ok(i), s.mergeEvaluated(d);
      });
    }
  };
  return ur.default = t, ur;
}
var lr = {}, jo;
function Gl() {
  if (jo) return lr;
  jo = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: i, parentSchema: a, it: u } = n;
      a.then === void 0 && a.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const d = l(u, "then"), c = l(u, "else");
      if (!d && !c)
        return;
      const g = i.let("valid", !0), _ = i.name("_valid");
      if ($(), n.reset(), d && c) {
        const E = i.let("ifClause");
        n.setParams({ ifClause: E }), i.if(_, b("then", E), b("else", E));
      } else d ? i.if(_, b("then")) : i.if((0, e.not)(_), b("else"));
      n.pass(g, () => n.error(!0));
      function $() {
        const E = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, _);
        n.mergeEvaluated(E);
      }
      function b(E, f) {
        return () => {
          const y = n.subschema({ keyword: E }, _);
          i.assign(g, _), n.mergeValidEvaluated(y, g), f ? i.assign(f, (0, e._)`${E}`) : n.setParams({ ifClause: E });
        };
      }
    }
  };
  function l(n, i) {
    const a = n.schema[i];
    return a !== void 0 && !(0, t.alwaysValidSchema)(n, a);
  }
  return lr.default = r, lr;
}
var dr = {}, Ao;
function Hl() {
  if (Ao) return dr;
  Ao = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: s, parentSchema: r, it: l }) {
      r.if === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "if" is ignored`);
    }
  };
  return dr.default = t, dr;
}
var ko;
function Jl() {
  if (ko) return Qt;
  ko = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = gu(), t = ql(), s = wu(), r = Cl(), l = Dl(), n = ua(), i = Ml(), a = Eu(), u = Ll(), d = Vl(), c = Fl(), g = Ul(), _ = zl(), $ = Kl(), b = Gl(), E = Hl();
  function f(y = !1) {
    const o = [
      // any
      c.default,
      g.default,
      _.default,
      $.default,
      b.default,
      E.default,
      // object
      i.default,
      a.default,
      n.default,
      u.default,
      d.default
    ];
    return y ? o.push(t.default, r.default) : o.push(e.default, s.default), o.push(l.default), o;
  }
  return Qt.default = f, Qt;
}
var fr = {}, ht = {}, qo;
function bu() {
  if (qo) return ht;
  qo = 1, Object.defineProperty(ht, "__esModule", { value: !0 }), ht.dynamicAnchor = void 0;
  const e = ee(), t = Ae(), s = Pn(), r = ia(), l = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (a) => n(a, a.schema)
  };
  function n(a, u) {
    const { gen: d, it: c } = a;
    c.schemaEnv.root.dynamicAnchors[u] = !0;
    const g = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(u)}`, _ = c.errSchemaPath === "#" ? c.validateName : i(a);
    d.if((0, e._)`!${g}`, () => d.assign(g, _));
  }
  ht.dynamicAnchor = n;
  function i(a) {
    const { schemaEnv: u, schema: d, self: c } = a.it, { root: g, baseId: _, localRefs: $, meta: b } = u.root, { schemaId: E } = c.opts, f = new s.SchemaEnv({ schema: d, schemaId: E, root: g, baseId: _, localRefs: $, meta: b });
    return s.compileSchema.call(c, f), (0, r.getValidate)(a, f);
  }
  return ht.default = l, ht;
}
var mt = {}, Co;
function Su() {
  if (Co) return mt;
  Co = 1, Object.defineProperty(mt, "__esModule", { value: !0 }), mt.dynamicRef = void 0;
  const e = ee(), t = Ae(), s = ia(), r = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (n) => l(n, n.schema)
  };
  function l(n, i) {
    const { gen: a, keyword: u, it: d } = n;
    if (i[0] !== "#")
      throw new Error(`"${u}" only supports hash fragment reference`);
    const c = i.slice(1);
    if (d.allErrors)
      g();
    else {
      const $ = a.let("valid", !1);
      g($), n.ok($);
    }
    function g($) {
      if (d.schemaEnv.root.dynamicAnchors[c]) {
        const b = a.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(c)}`);
        a.if(b, _(b, $), _(d.validateName, $));
      } else
        _(d.validateName, $)();
    }
    function _($, b) {
      return b ? () => a.block(() => {
        (0, s.callRef)(n, $), a.let(b, !0);
      }) : () => (0, s.callRef)(n, $);
    }
  }
  return mt.dynamicRef = l, mt.default = r, mt;
}
var hr = {}, Do;
function Bl() {
  if (Do) return hr;
  Do = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const e = bu(), t = se(), s = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(r) {
      r.schema ? (0, e.dynamicAnchor)(r, "") : (0, t.checkStrictMode)(r.it, "$recursiveAnchor: false is ignored");
    }
  };
  return hr.default = s, hr;
}
var mr = {}, Mo;
function Xl() {
  if (Mo) return mr;
  Mo = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const e = Su(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (s) => (0, e.dynamicRef)(s, s.schema)
  };
  return mr.default = t, mr;
}
var Lo;
function Wl() {
  if (Lo) return fr;
  Lo = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = bu(), t = Su(), s = Bl(), r = Xl(), l = [e.default, t.default, s.default, r.default];
  return fr.default = l, fr;
}
var pr = {}, yr = {}, Vo;
function Yl() {
  if (Vo) return yr;
  Vo = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const e = ua(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (s) => (0, e.validatePropertyDeps)(s)
  };
  return yr.default = t, yr;
}
var vr = {}, Fo;
function Zl() {
  if (Fo) return vr;
  Fo = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const e = ua(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (s) => (0, e.validateSchemaDeps)(s)
  };
  return vr.default = t, vr;
}
var _r = {}, Uo;
function Ql() {
  if (Uo) return _r;
  Uo = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: s, parentSchema: r, it: l }) {
      r.contains === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "contains" is ignored`);
    }
  };
  return _r.default = t, _r;
}
var zo;
function xl() {
  if (zo) return pr;
  zo = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = Yl(), t = Zl(), s = Ql(), r = [e.default, t.default, s.default];
  return pr.default = r, pr;
}
var $r = {}, gr = {}, Ko;
function ed() {
  if (Ko) return gr;
  Ko = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = Ae(), l = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: n }) => (0, e._)`{unevaluatedProperty: ${n.unevaluatedProperty}}`
    },
    code(n) {
      const { gen: i, schema: a, data: u, errsCount: d, it: c } = n;
      if (!d)
        throw new Error("ajv implementation error");
      const { allErrors: g, props: _ } = c;
      _ instanceof e.Name ? i.if((0, e._)`${_} !== true`, () => i.forIn("key", u, (f) => i.if(b(_, f), () => $(f)))) : _ !== !0 && i.forIn("key", u, (f) => _ === void 0 ? $(f) : i.if(E(_, f), () => $(f))), c.props = !0, n.ok((0, e._)`${d} === ${s.default.errors}`);
      function $(f) {
        if (a === !1) {
          n.setParams({ unevaluatedProperty: f }), n.error(), g || i.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(c, a)) {
          const y = i.name("valid");
          n.subschema({
            keyword: "unevaluatedProperties",
            dataProp: f,
            dataPropType: t.Type.Str
          }, y), g || i.if((0, e.not)(y), () => i.break());
        }
      }
      function b(f, y) {
        return (0, e._)`!${f} || !${f}[${y}]`;
      }
      function E(f, y) {
        const o = [];
        for (const p in f)
          f[p] === !0 && o.push((0, e._)`${y} !== ${p}`);
        return (0, e.and)(...o);
      }
    }
  };
  return gr.default = l, gr;
}
var wr = {}, Go;
function td() {
  if (Go) return wr;
  Go = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: l } }) => (0, e.str)`must NOT have more than ${l} items`,
      params: ({ params: { len: l } }) => (0, e._)`{limit: ${l}}`
    },
    code(l) {
      const { gen: n, schema: i, data: a, it: u } = l, d = u.items || 0;
      if (d === !0)
        return;
      const c = n.const("len", (0, e._)`${a}.length`);
      if (i === !1)
        l.setParams({ len: d }), l.fail((0, e._)`${c} > ${d}`);
      else if (typeof i == "object" && !(0, t.alwaysValidSchema)(u, i)) {
        const _ = n.var("valid", (0, e._)`${c} <= ${d}`);
        n.if((0, e.not)(_), () => g(_, d)), l.ok(_);
      }
      u.items = !0;
      function g(_, $) {
        n.forRange("i", $, c, (b) => {
          l.subschema({ keyword: "unevaluatedItems", dataProp: b, dataPropType: t.Type.Num }, _), u.allErrors || n.if((0, e.not)(_), () => n.break());
        });
      }
    }
  };
  return wr.default = r, wr;
}
var Ho;
function rd() {
  if (Ho) return $r;
  Ho = 1, Object.defineProperty($r, "__esModule", { value: !0 });
  const e = ed(), t = td(), s = [e.default, t.default];
  return $r.default = s, $r;
}
var Er = {}, br = {}, Jo;
function nd() {
  if (Jo) return br;
  Jo = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, l) {
      const { gen: n, data: i, $data: a, schema: u, schemaCode: d, it: c } = r, { opts: g, errSchemaPath: _, schemaEnv: $, self: b } = c;
      if (!g.validateFormats)
        return;
      a ? E() : f();
      function E() {
        const y = n.scopeValue("formats", {
          ref: b.formats,
          code: g.code.formats
        }), o = n.const("fDef", (0, e._)`${y}[${d}]`), p = n.let("fType"), w = n.let("format");
        n.if((0, e._)`typeof ${o} == "object" && !(${o} instanceof RegExp)`, () => n.assign(p, (0, e._)`${o}.type || "string"`).assign(w, (0, e._)`${o}.validate`), () => n.assign(p, (0, e._)`"string"`).assign(w, o)), r.fail$data((0, e.or)(m(), v()));
        function m() {
          return g.strictSchema === !1 ? e.nil : (0, e._)`${d} && !${w}`;
        }
        function v() {
          const R = $.$async ? (0, e._)`(${o}.async ? await ${w}(${i}) : ${w}(${i}))` : (0, e._)`${w}(${i})`, T = (0, e._)`(typeof ${w} == "function" ? ${R} : ${w}.test(${i}))`;
          return (0, e._)`${w} && ${w} !== true && ${p} === ${l} && !${T}`;
        }
      }
      function f() {
        const y = b.formats[u];
        if (!y) {
          m();
          return;
        }
        if (y === !0)
          return;
        const [o, p, w] = v(y);
        o === l && r.pass(R());
        function m() {
          if (g.strictSchema === !1) {
            b.logger.warn(T());
            return;
          }
          throw new Error(T());
          function T() {
            return `unknown format "${u}" ignored in schema at path "${_}"`;
          }
        }
        function v(T) {
          const C = T instanceof RegExp ? (0, e.regexpCode)(T) : g.code.formats ? (0, e._)`${g.code.formats}${(0, e.getProperty)(u)}` : void 0, V = n.scopeValue("formats", { key: u, ref: T, code: C });
          return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, e._)`${V}.validate`] : ["string", T, V];
        }
        function R() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!$.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${w}(${i})`;
          }
          return typeof p == "function" ? (0, e._)`${w}(${i})` : (0, e._)`${w}.test(${i})`;
        }
      }
    }
  };
  return br.default = s, br;
}
var Bo;
function sd() {
  if (Bo) return Er;
  Bo = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const t = [nd().default];
  return Er.default = t, Er;
}
var ot = {}, Xo;
function ad() {
  return Xo || (Xo = 1, Object.defineProperty(ot, "__esModule", { value: !0 }), ot.contentVocabulary = ot.metadataVocabulary = void 0, ot.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], ot.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), ot;
}
var Wo;
function od() {
  if (Wo) return Dt;
  Wo = 1, Object.defineProperty(Dt, "__esModule", { value: !0 });
  const e = wl(), t = kl(), s = Jl(), r = Wl(), l = xl(), n = rd(), i = sd(), a = ad(), u = [
    r.default,
    e.default,
    t.default,
    (0, s.default)(!0),
    i.default,
    a.metadataVocabulary,
    a.contentVocabulary,
    l.default,
    n.default
  ];
  return Dt.default = u, Dt;
}
var Sr = {}, Rt = {}, Yo;
function id() {
  if (Yo) return Rt;
  Yo = 1, Object.defineProperty(Rt, "__esModule", { value: !0 }), Rt.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (Rt.DiscrError = e = {})), Rt;
}
var Zo;
function cd() {
  if (Zo) return Sr;
  Zo = 1, Object.defineProperty(Sr, "__esModule", { value: !0 });
  const e = ee(), t = id(), s = Pn(), r = Rn(), l = se(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: a, tagName: u } }) => a === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: a, tag: u, tagName: d } }) => (0, e._)`{error: ${a}, tag: ${d}, tagValue: ${u}}`
    },
    code(a) {
      const { gen: u, data: d, schema: c, parentSchema: g, it: _ } = a, { oneOf: $ } = g;
      if (!_.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const b = c.propertyName;
      if (typeof b != "string")
        throw new Error("discriminator: requires propertyName");
      if (c.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!$)
        throw new Error("discriminator: requires oneOf keyword");
      const E = u.let("valid", !1), f = u.const("tag", (0, e._)`${d}${(0, e.getProperty)(b)}`);
      u.if((0, e._)`typeof ${f} == "string"`, () => y(), () => a.error(!1, { discrError: t.DiscrError.Tag, tag: f, tagName: b })), a.ok(E);
      function y() {
        const w = p();
        u.if(!1);
        for (const m in w)
          u.elseIf((0, e._)`${f} === ${m}`), u.assign(E, o(w[m]));
        u.else(), a.error(!1, { discrError: t.DiscrError.Mapping, tag: f, tagName: b }), u.endIf();
      }
      function o(w) {
        const m = u.name("valid"), v = a.subschema({ keyword: "oneOf", schemaProp: w }, m);
        return a.mergeEvaluated(v, e.Name), m;
      }
      function p() {
        var w;
        const m = {}, v = T(g);
        let R = !0;
        for (let D = 0; D < $.length; D++) {
          let U = $[D];
          if (U?.$ref && !(0, l.schemaHasRulesButRef)(U, _.self.RULES)) {
            const M = U.$ref;
            if (U = s.resolveRef.call(_.self, _.schemaEnv.root, _.baseId, M), U instanceof s.SchemaEnv && (U = U.schema), U === void 0)
              throw new r.default(_.opts.uriResolver, _.baseId, M);
          }
          const z = (w = U?.properties) === null || w === void 0 ? void 0 : w[b];
          if (typeof z != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${b}"`);
          R = R && (v || T(U)), C(z, D);
        }
        if (!R)
          throw new Error(`discriminator: "${b}" must be required`);
        return m;
        function T({ required: D }) {
          return Array.isArray(D) && D.includes(b);
        }
        function C(D, U) {
          if (D.const)
            V(D.const, U);
          else if (D.enum)
            for (const z of D.enum)
              V(z, U);
          else
            throw new Error(`discriminator: "properties/${b}" must have "const" or "enum"`);
        }
        function V(D, U) {
          if (typeof D != "string" || D in m)
            throw new Error(`discriminator: "${b}" values must be unique strings`);
          m[D] = U;
        }
      }
    }
  };
  return Sr.default = i, Sr;
}
var Rr = {};
const ud = "https://json-schema.org/draft/2020-12/schema", ld = "https://json-schema.org/draft/2020-12/schema", dd = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, fd = "meta", hd = "Core and Validation specifications meta-schema", md = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], pd = ["object", "boolean"], yd = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", vd = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, _d = {
  $schema: ud,
  $id: ld,
  $vocabulary: dd,
  $dynamicAnchor: fd,
  title: hd,
  allOf: md,
  type: pd,
  $comment: yd,
  properties: vd
}, $d = "https://json-schema.org/draft/2020-12/schema", gd = "https://json-schema.org/draft/2020-12/meta/applicator", wd = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, Ed = "meta", bd = "Applicator vocabulary meta-schema", Sd = ["object", "boolean"], Rd = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Pd = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, Nd = {
  $schema: $d,
  $id: gd,
  $vocabulary: wd,
  $dynamicAnchor: Ed,
  title: bd,
  type: Sd,
  properties: Rd,
  $defs: Pd
}, Od = "https://json-schema.org/draft/2020-12/schema", Id = "https://json-schema.org/draft/2020-12/meta/unevaluated", Td = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, jd = "meta", Ad = "Unevaluated applicator vocabulary meta-schema", kd = ["object", "boolean"], qd = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, Cd = {
  $schema: Od,
  $id: Id,
  $vocabulary: Td,
  $dynamicAnchor: jd,
  title: Ad,
  type: kd,
  properties: qd
}, Dd = "https://json-schema.org/draft/2020-12/schema", Md = "https://json-schema.org/draft/2020-12/meta/content", Ld = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Vd = "meta", Fd = "Content vocabulary meta-schema", Ud = ["object", "boolean"], zd = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, Kd = {
  $schema: Dd,
  $id: Md,
  $vocabulary: Ld,
  $dynamicAnchor: Vd,
  title: Fd,
  type: Ud,
  properties: zd
}, Gd = "https://json-schema.org/draft/2020-12/schema", Hd = "https://json-schema.org/draft/2020-12/meta/core", Jd = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, Bd = "meta", Xd = "Core vocabulary meta-schema", Wd = ["object", "boolean"], Yd = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, Zd = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, Qd = {
  $schema: Gd,
  $id: Hd,
  $vocabulary: Jd,
  $dynamicAnchor: Bd,
  title: Xd,
  type: Wd,
  properties: Yd,
  $defs: Zd
}, xd = "https://json-schema.org/draft/2020-12/schema", ef = "https://json-schema.org/draft/2020-12/meta/format-annotation", tf = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, rf = "meta", nf = "Format vocabulary meta-schema for annotation results", sf = ["object", "boolean"], af = { format: { type: "string" } }, of = {
  $schema: xd,
  $id: ef,
  $vocabulary: tf,
  $dynamicAnchor: rf,
  title: nf,
  type: sf,
  properties: af
}, cf = "https://json-schema.org/draft/2020-12/schema", uf = "https://json-schema.org/draft/2020-12/meta/meta-data", lf = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, df = "meta", ff = "Meta-data vocabulary meta-schema", hf = ["object", "boolean"], mf = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, pf = {
  $schema: cf,
  $id: uf,
  $vocabulary: lf,
  $dynamicAnchor: df,
  title: ff,
  type: hf,
  properties: mf
}, yf = "https://json-schema.org/draft/2020-12/schema", vf = "https://json-schema.org/draft/2020-12/meta/validation", _f = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, $f = "meta", gf = "Validation vocabulary meta-schema", wf = ["object", "boolean"], Ef = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, bf = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Sf = {
  $schema: yf,
  $id: vf,
  $vocabulary: _f,
  $dynamicAnchor: $f,
  title: gf,
  type: wf,
  properties: Ef,
  $defs: bf
};
var Qo;
function Rf() {
  if (Qo) return Rr;
  Qo = 1, Object.defineProperty(Rr, "__esModule", { value: !0 });
  const e = _d, t = Nd, s = Cd, r = Kd, l = Qd, n = of, i = pf, a = Sf, u = ["/properties"];
  function d(c) {
    return [
      e,
      t,
      s,
      r,
      l,
      g(this, n),
      i,
      g(this, a)
    ].forEach((_) => this.addMetaSchema(_, void 0, !1)), this;
    function g(_, $) {
      return c ? _.$dataMetaSchema($, u) : $;
    }
  }
  return Rr.default = d, Rr;
}
var xo;
function Pf() {
  return xo || (xo = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const s = $l(), r = od(), l = cd(), n = Rf(), i = "https://json-schema.org/draft/2020-12/schema";
    class a extends s.default {
      constructor($ = {}) {
        super({
          ...$,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach(($) => this.addVocabulary($)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: $, meta: b } = this.opts;
        b && (n.default.call(this, $), this.refs["http://json-schema.org/schema"] = i);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
      }
    }
    t.Ajv2020 = a, e.exports = t = a, e.exports.Ajv2020 = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
    var u = Sn();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var d = ee();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return d._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return d.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return d.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return d.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return d.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return d.CodeGen;
    } });
    var c = oa();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return c.default;
    } });
    var g = Rn();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return g.default;
    } });
  })(jt, jt.exports)), jt.exports;
}
var Nf = Pf(), Pr = { exports: {} }, Yn = {}, ei;
function Of() {
  return ei || (ei = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(D, U) {
      return { validate: D, compare: U };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(n, i),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(u(!0), d),
      "date-time": t(_(!0), $),
      "iso-time": t(u(), c),
      "iso-date-time": t(_(), b),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: y,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: V,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: p,
      // signed 32 bit integer
      int32: { type: "number", validate: v },
      // signed 64 bit integer
      int64: { type: "number", validate: R },
      // C-type float
      float: { type: "number", validate: T },
      // C-type double
      double: { type: "number", validate: T },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, i),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, $),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, c),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, b),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function s(D) {
      return D % 4 === 0 && (D % 100 !== 0 || D % 400 === 0);
    }
    const r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, l = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function n(D) {
      const U = r.exec(D);
      if (!U)
        return !1;
      const z = +U[1], M = +U[2], F = +U[3];
      return M >= 1 && M <= 12 && F >= 1 && F <= (M === 2 && s(z) ? 29 : l[M]);
    }
    function i(D, U) {
      if (D && U)
        return D > U ? 1 : D < U ? -1 : 0;
    }
    const a = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function u(D) {
      return function(z) {
        const M = a.exec(z);
        if (!M)
          return !1;
        const F = +M[1], X = +M[2], B = +M[3], J = M[4], Y = M[5] === "-" ? -1 : 1, k = +(M[6] || 0), N = +(M[7] || 0);
        if (k > 23 || N > 59 || D && !J)
          return !1;
        if (F <= 23 && X <= 59 && B < 60)
          return !0;
        const A = X - N * Y, O = F - k * Y - (A < 0 ? 1 : 0);
        return (O === 23 || O === -1) && (A === 59 || A === -1) && B < 61;
      };
    }
    function d(D, U) {
      if (!(D && U))
        return;
      const z = (/* @__PURE__ */ new Date("2020-01-01T" + D)).valueOf(), M = (/* @__PURE__ */ new Date("2020-01-01T" + U)).valueOf();
      if (z && M)
        return z - M;
    }
    function c(D, U) {
      if (!(D && U))
        return;
      const z = a.exec(D), M = a.exec(U);
      if (z && M)
        return D = z[1] + z[2] + z[3], U = M[1] + M[2] + M[3], D > U ? 1 : D < U ? -1 : 0;
    }
    const g = /t|\s/i;
    function _(D) {
      const U = u(D);
      return function(M) {
        const F = M.split(g);
        return F.length === 2 && n(F[0]) && U(F[1]);
      };
    }
    function $(D, U) {
      if (!(D && U))
        return;
      const z = new Date(D).valueOf(), M = new Date(U).valueOf();
      if (z && M)
        return z - M;
    }
    function b(D, U) {
      if (!(D && U))
        return;
      const [z, M] = D.split(g), [F, X] = U.split(g), B = i(z, F);
      if (B !== void 0)
        return B || d(M, X);
    }
    const E = /\/|:/, f = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function y(D) {
      return E.test(D) && f.test(D);
    }
    const o = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function p(D) {
      return o.lastIndex = 0, o.test(D);
    }
    const w = -2147483648, m = 2 ** 31 - 1;
    function v(D) {
      return Number.isInteger(D) && D <= m && D >= w;
    }
    function R(D) {
      return Number.isInteger(D);
    }
    function T() {
      return !0;
    }
    const C = /[^\\]\\Z/;
    function V(D) {
      if (C.test(D))
        return !1;
      try {
        return new RegExp(D), !0;
      } catch {
        return !1;
      }
    }
  })(Yn)), Yn;
}
var Zn = {}, Nr = { exports: {} }, Qn = {}, Ue = {}, it = {}, xn = {}, es = {}, ts = {}, ti;
function _n() {
  return ti || (ti = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class s extends t {
      constructor(o) {
        if (super(), !e.IDENTIFIER.test(o))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = s;
    class r extends t {
      constructor(o) {
        super(), this._items = typeof o == "string" ? [o] : o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const o = this._items[0];
        return o === "" || o === '""';
      }
      get str() {
        var o;
        return (o = this._str) !== null && o !== void 0 ? o : this._str = this._items.reduce((p, w) => `${p}${w}`, "");
      }
      get names() {
        var o;
        return (o = this._names) !== null && o !== void 0 ? o : this._names = this._items.reduce((p, w) => (w instanceof s && (p[w.str] = (p[w.str] || 0) + 1), p), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function l(y, ...o) {
      const p = [y[0]];
      let w = 0;
      for (; w < o.length; )
        a(p, o[w]), p.push(y[++w]);
      return new r(p);
    }
    e._ = l;
    const n = new r("+");
    function i(y, ...o) {
      const p = [$(y[0])];
      let w = 0;
      for (; w < o.length; )
        p.push(n), a(p, o[w]), p.push(n, $(y[++w]));
      return u(p), new r(p);
    }
    e.str = i;
    function a(y, o) {
      o instanceof r ? y.push(...o._items) : o instanceof s ? y.push(o) : y.push(g(o));
    }
    e.addCodeArg = a;
    function u(y) {
      let o = 1;
      for (; o < y.length - 1; ) {
        if (y[o] === n) {
          const p = d(y[o - 1], y[o + 1]);
          if (p !== void 0) {
            y.splice(o - 1, 3, p);
            continue;
          }
          y[o++] = "+";
        }
        o++;
      }
    }
    function d(y, o) {
      if (o === '""')
        return y;
      if (y === '""')
        return o;
      if (typeof y == "string")
        return o instanceof s || y[y.length - 1] !== '"' ? void 0 : typeof o != "string" ? `${y.slice(0, -1)}${o}"` : o[0] === '"' ? y.slice(0, -1) + o.slice(1) : void 0;
      if (typeof o == "string" && o[0] === '"' && !(y instanceof s))
        return `"${y}${o.slice(1)}`;
    }
    function c(y, o) {
      return o.emptyStr() ? y : y.emptyStr() ? o : i`${y}${o}`;
    }
    e.strConcat = c;
    function g(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : $(Array.isArray(y) ? y.join(",") : y);
    }
    function _(y) {
      return new r($(y));
    }
    e.stringify = _;
    function $(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = $;
    function b(y) {
      return typeof y == "string" && e.IDENTIFIER.test(y) ? new r(`.${y}`) : l`[${y}]`;
    }
    e.getProperty = b;
    function E(y) {
      if (typeof y == "string" && e.IDENTIFIER.test(y))
        return new r(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    e.getEsmExportName = E;
    function f(y) {
      return new r(y.toString());
    }
    e.regexpCode = f;
  })(ts)), ts;
}
var rs = {}, ri;
function ni() {
  return ri || (ri = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = _n();
    class s extends Error {
      constructor(d) {
        super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
      }
    }
    var r;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class l {
      constructor({ prefixes: d, parent: c } = {}) {
        this._names = {}, this._prefixes = d, this._parent = c;
      }
      toName(d) {
        return d instanceof t.Name ? d : this.name(d);
      }
      name(d) {
        return new t.Name(this._newName(d));
      }
      _newName(d) {
        const c = this._names[d] || this._nameGroup(d);
        return `${d}${c.index++}`;
      }
      _nameGroup(d) {
        var c, g;
        if (!((g = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || g === void 0) && g.has(d) || this._prefixes && !this._prefixes.has(d))
          throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
        return this._names[d] = { prefix: d, index: 0 };
      }
    }
    e.Scope = l;
    class n extends t.Name {
      constructor(d, c) {
        super(c), this.prefix = d;
      }
      setValue(d, { property: c, itemIndex: g }) {
        this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${g}]`;
      }
    }
    e.ValueScopeName = n;
    const i = (0, t._)`\n`;
    class a extends l {
      constructor(d) {
        super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(d) {
        return new n(d, this._newName(d));
      }
      value(d, c) {
        var g;
        if (c.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const _ = this.toName(d), { prefix: $ } = _, b = (g = c.key) !== null && g !== void 0 ? g : c.ref;
        let E = this._values[$];
        if (E) {
          const o = E.get(b);
          if (o)
            return o;
        } else
          E = this._values[$] = /* @__PURE__ */ new Map();
        E.set(b, _);
        const f = this._scope[$] || (this._scope[$] = []), y = f.length;
        return f[y] = c.ref, _.setValue(c, { property: $, itemIndex: y }), _;
      }
      getValue(d, c) {
        const g = this._values[d];
        if (g)
          return g.get(c);
      }
      scopeRefs(d, c = this._values) {
        return this._reduceValues(c, (g) => {
          if (g.scopePath === void 0)
            throw new Error(`CodeGen: name "${g}" has no value`);
          return (0, t._)`${d}${g.scopePath}`;
        });
      }
      scopeCode(d = this._values, c, g) {
        return this._reduceValues(d, (_) => {
          if (_.value === void 0)
            throw new Error(`CodeGen: name "${_}" has no value`);
          return _.value.code;
        }, c, g);
      }
      _reduceValues(d, c, g = {}, _) {
        let $ = t.nil;
        for (const b in d) {
          const E = d[b];
          if (!E)
            continue;
          const f = g[b] = g[b] || /* @__PURE__ */ new Map();
          E.forEach((y) => {
            if (f.has(y))
              return;
            f.set(y, r.Started);
            let o = c(y);
            if (o) {
              const p = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              $ = (0, t._)`${$}${p} ${y} = ${o};${this.opts._n}`;
            } else if (o = _?.(y))
              $ = (0, t._)`${$}${o}${this.opts._n}`;
            else
              throw new s(y);
            f.set(y, r.Completed);
          });
        }
        return $;
      }
    }
    e.ValueScope = a;
  })(rs)), rs;
}
var si;
function ne() {
  return si || (si = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = _n(), s = ni();
    var r = _n();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var l = ni();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(h, S) {
        return this;
      }
    }
    class i extends n {
      constructor(h, S, j) {
        super(), this.varKind = h, this.name = S, this.rhs = j;
      }
      render({ es5: h, _n: S }) {
        const j = h ? s.varKinds.var : this.varKind, K = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${j} ${this.name}${K};` + S;
      }
      optimizeNames(h, S) {
        if (h[this.name.str])
          return this.rhs && (this.rhs = M(this.rhs, h, S)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class a extends n {
      constructor(h, S, j) {
        super(), this.lhs = h, this.rhs = S, this.sideEffects = j;
      }
      render({ _n: h }) {
        return `${this.lhs} = ${this.rhs};` + h;
      }
      optimizeNames(h, S) {
        if (!(this.lhs instanceof t.Name && !h[this.lhs.str] && !this.sideEffects))
          return this.rhs = M(this.rhs, h, S), this;
      }
      get names() {
        const h = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return z(h, this.rhs);
      }
    }
    class u extends a {
      constructor(h, S, j, K) {
        super(h, j, K), this.op = S;
      }
      render({ _n: h }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + h;
      }
    }
    class d extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `${this.label}:` + h;
      }
    }
    class c extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `break${this.label ? ` ${this.label}` : ""};` + h;
      }
    }
    class g extends n {
      constructor(h) {
        super(), this.error = h;
      }
      render({ _n: h }) {
        return `throw ${this.error};` + h;
      }
      get names() {
        return this.error.names;
      }
    }
    class _ extends n {
      constructor(h) {
        super(), this.code = h;
      }
      render({ _n: h }) {
        return `${this.code};` + h;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(h, S) {
        return this.code = M(this.code, h, S), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class $ extends n {
      constructor(h = []) {
        super(), this.nodes = h;
      }
      render(h) {
        return this.nodes.reduce((S, j) => S + j.render(h), "");
      }
      optimizeNodes() {
        const { nodes: h } = this;
        let S = h.length;
        for (; S--; ) {
          const j = h[S].optimizeNodes();
          Array.isArray(j) ? h.splice(S, 1, ...j) : j ? h[S] = j : h.splice(S, 1);
        }
        return h.length > 0 ? this : void 0;
      }
      optimizeNames(h, S) {
        const { nodes: j } = this;
        let K = j.length;
        for (; K--; ) {
          const H = j[K];
          H.optimizeNames(h, S) || (F(h, H.names), j.splice(K, 1));
        }
        return j.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((h, S) => U(h, S.names), {});
      }
    }
    class b extends $ {
      render(h) {
        return "{" + h._n + super.render(h) + "}" + h._n;
      }
    }
    class E extends $ {
    }
    class f extends b {
    }
    f.kind = "else";
    class y extends b {
      constructor(h, S) {
        super(S), this.condition = h;
      }
      render(h) {
        let S = `if(${this.condition})` + super.render(h);
        return this.else && (S += "else " + this.else.render(h)), S;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const h = this.condition;
        if (h === !0)
          return this.nodes;
        let S = this.else;
        if (S) {
          const j = S.optimizeNodes();
          S = this.else = Array.isArray(j) ? new f(j) : j;
        }
        if (S)
          return h === !1 ? S instanceof y ? S : S.nodes : this.nodes.length ? this : new y(X(h), S instanceof y ? [S] : S.nodes);
        if (!(h === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(h, S) {
        var j;
        if (this.else = (j = this.else) === null || j === void 0 ? void 0 : j.optimizeNames(h, S), !!(super.optimizeNames(h, S) || this.else))
          return this.condition = M(this.condition, h, S), this;
      }
      get names() {
        const h = super.names;
        return z(h, this.condition), this.else && U(h, this.else.names), h;
      }
    }
    y.kind = "if";
    class o extends b {
    }
    o.kind = "for";
    class p extends o {
      constructor(h) {
        super(), this.iteration = h;
      }
      render(h) {
        return `for(${this.iteration})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iteration = M(this.iteration, h, S), this;
      }
      get names() {
        return U(super.names, this.iteration.names);
      }
    }
    class w extends o {
      constructor(h, S, j, K) {
        super(), this.varKind = h, this.name = S, this.from = j, this.to = K;
      }
      render(h) {
        const S = h.es5 ? s.varKinds.var : this.varKind, { name: j, from: K, to: H } = this;
        return `for(${S} ${j}=${K}; ${j}<${H}; ${j}++)` + super.render(h);
      }
      get names() {
        const h = z(super.names, this.from);
        return z(h, this.to);
      }
    }
    class m extends o {
      constructor(h, S, j, K) {
        super(), this.loop = h, this.varKind = S, this.name = j, this.iterable = K;
      }
      render(h) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iterable = M(this.iterable, h, S), this;
      }
      get names() {
        return U(super.names, this.iterable.names);
      }
    }
    class v extends b {
      constructor(h, S, j) {
        super(), this.name = h, this.args = S, this.async = j;
      }
      render(h) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(h);
      }
    }
    v.kind = "func";
    class R extends $ {
      render(h) {
        return "return " + super.render(h);
      }
    }
    R.kind = "return";
    class T extends b {
      render(h) {
        let S = "try" + super.render(h);
        return this.catch && (S += this.catch.render(h)), this.finally && (S += this.finally.render(h)), S;
      }
      optimizeNodes() {
        var h, S;
        return super.optimizeNodes(), (h = this.catch) === null || h === void 0 || h.optimizeNodes(), (S = this.finally) === null || S === void 0 || S.optimizeNodes(), this;
      }
      optimizeNames(h, S) {
        var j, K;
        return super.optimizeNames(h, S), (j = this.catch) === null || j === void 0 || j.optimizeNames(h, S), (K = this.finally) === null || K === void 0 || K.optimizeNames(h, S), this;
      }
      get names() {
        const h = super.names;
        return this.catch && U(h, this.catch.names), this.finally && U(h, this.finally.names), h;
      }
    }
    class C extends b {
      constructor(h) {
        super(), this.error = h;
      }
      render(h) {
        return `catch(${this.error})` + super.render(h);
      }
    }
    C.kind = "catch";
    class V extends b {
      render(h) {
        return "finally" + super.render(h);
      }
    }
    V.kind = "finally";
    class D {
      constructor(h, S = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...S, _n: S.lines ? `
` : "" }, this._extScope = h, this._scope = new s.Scope({ parent: h }), this._nodes = [new E()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(h) {
        return this._scope.name(h);
      }
      // reserves unique name in the external scope
      scopeName(h) {
        return this._extScope.name(h);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(h, S) {
        const j = this._extScope.value(h, S);
        return (this._values[j.prefix] || (this._values[j.prefix] = /* @__PURE__ */ new Set())).add(j), j;
      }
      getScopeValue(h, S) {
        return this._extScope.getValue(h, S);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(h) {
        return this._extScope.scopeRefs(h, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(h, S, j, K) {
        const H = this._scope.toName(S);
        return j !== void 0 && K && (this._constants[H.str] = j), this._leafNode(new i(h, H, j)), H;
      }
      // `const` declaration (`var` in es5 mode)
      const(h, S, j) {
        return this._def(s.varKinds.const, h, S, j);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(h, S, j) {
        return this._def(s.varKinds.let, h, S, j);
      }
      // `var` declaration with optional assignment
      var(h, S, j) {
        return this._def(s.varKinds.var, h, S, j);
      }
      // assignment code
      assign(h, S, j) {
        return this._leafNode(new a(h, S, j));
      }
      // `+=` code
      add(h, S) {
        return this._leafNode(new u(h, e.operators.ADD, S));
      }
      // appends passed SafeExpr to code or executes Block
      code(h) {
        return typeof h == "function" ? h() : h !== t.nil && this._leafNode(new _(h)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...h) {
        const S = ["{"];
        for (const [j, K] of h)
          S.length > 1 && S.push(","), S.push(j), (j !== K || this.opts.es5) && (S.push(":"), (0, t.addCodeArg)(S, K));
        return S.push("}"), new t._Code(S);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(h, S, j) {
        if (this._blockNode(new y(h)), S && j)
          this.code(S).else().code(j).endIf();
        else if (S)
          this.code(S).endIf();
        else if (j)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(h) {
        return this._elseNode(new y(h));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new f());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, f);
      }
      _for(h, S) {
        return this._blockNode(h), S && this.code(S).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(h, S) {
        return this._for(new p(h), S);
      }
      // `for` statement for a range of values
      forRange(h, S, j, K, H = this.opts.es5 ? s.varKinds.var : s.varKinds.let) {
        const Q = this._scope.toName(h);
        return this._for(new w(H, Q, S, j), () => K(Q));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(h, S, j, K = s.varKinds.const) {
        const H = this._scope.toName(h);
        if (this.opts.es5) {
          const Q = S instanceof t.Name ? S : this.var("_arr", S);
          return this.forRange("_i", 0, (0, t._)`${Q}.length`, (Z) => {
            this.var(H, (0, t._)`${Q}[${Z}]`), j(H);
          });
        }
        return this._for(new m("of", K, H, S), () => j(H));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(h, S, j, K = this.opts.es5 ? s.varKinds.var : s.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(h, (0, t._)`Object.keys(${S})`, j);
        const H = this._scope.toName(h);
        return this._for(new m("in", K, H, S), () => j(H));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(o);
      }
      // `label` statement
      label(h) {
        return this._leafNode(new d(h));
      }
      // `break` statement
      break(h) {
        return this._leafNode(new c(h));
      }
      // `return` statement
      return(h) {
        const S = new R();
        if (this._blockNode(S), this.code(h), S.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(R);
      }
      // `try` statement
      try(h, S, j) {
        if (!S && !j)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const K = new T();
        if (this._blockNode(K), this.code(h), S) {
          const H = this.name("e");
          this._currNode = K.catch = new C(H), S(H);
        }
        return j && (this._currNode = K.finally = new V(), this.code(j)), this._endBlockNode(C, V);
      }
      // `throw` statement
      throw(h) {
        return this._leafNode(new g(h));
      }
      // start self-balancing block
      block(h, S) {
        return this._blockStarts.push(this._nodes.length), h && this.code(h).endBlock(S), this;
      }
      // end the current self-balancing block
      endBlock(h) {
        const S = this._blockStarts.pop();
        if (S === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const j = this._nodes.length - S;
        if (j < 0 || h !== void 0 && j !== h)
          throw new Error(`CodeGen: wrong number of nodes: ${j} vs ${h} expected`);
        return this._nodes.length = S, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(h, S = t.nil, j, K) {
        return this._blockNode(new v(h, S, j)), K && this.code(K).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(v);
      }
      optimize(h = 1) {
        for (; h-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(h) {
        return this._currNode.nodes.push(h), this;
      }
      _blockNode(h) {
        this._currNode.nodes.push(h), this._nodes.push(h);
      }
      _endBlockNode(h, S) {
        const j = this._currNode;
        if (j instanceof h || S && j instanceof S)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${S ? `${h.kind}/${S.kind}` : h.kind}"`);
      }
      _elseNode(h) {
        const S = this._currNode;
        if (!(S instanceof y))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = S.else = h, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const h = this._nodes;
        return h[h.length - 1];
      }
      set _currNode(h) {
        const S = this._nodes;
        S[S.length - 1] = h;
      }
    }
    e.CodeGen = D;
    function U(O, h) {
      for (const S in h)
        O[S] = (O[S] || 0) + (h[S] || 0);
      return O;
    }
    function z(O, h) {
      return h instanceof t._CodeOrName ? U(O, h.names) : O;
    }
    function M(O, h, S) {
      if (O instanceof t.Name)
        return j(O);
      if (!K(O))
        return O;
      return new t._Code(O._items.reduce((H, Q) => (Q instanceof t.Name && (Q = j(Q)), Q instanceof t._Code ? H.push(...Q._items) : H.push(Q), H), []));
      function j(H) {
        const Q = S[H.str];
        return Q === void 0 || h[H.str] !== 1 ? H : (delete h[H.str], Q);
      }
      function K(H) {
        return H instanceof t._Code && H._items.some((Q) => Q instanceof t.Name && h[Q.str] === 1 && S[Q.str] !== void 0);
      }
    }
    function F(O, h) {
      for (const S in h)
        O[S] = (O[S] || 0) - (h[S] || 0);
    }
    function X(O) {
      return typeof O == "boolean" || typeof O == "number" || O === null ? !O : (0, t._)`!${A(O)}`;
    }
    e.not = X;
    const B = N(e.operators.AND);
    function J(...O) {
      return O.reduce(B);
    }
    e.and = J;
    const Y = N(e.operators.OR);
    function k(...O) {
      return O.reduce(Y);
    }
    e.or = k;
    function N(O) {
      return (h, S) => h === t.nil ? S : S === t.nil ? h : (0, t._)`${A(h)} ${O} ${A(S)}`;
    }
    function A(O) {
      return O instanceof t.Name ? O : (0, t._)`(${O})`;
    }
  })(es)), es;
}
var re = {}, ai;
function ce() {
  if (ai) return re;
  ai = 1, Object.defineProperty(re, "__esModule", { value: !0 }), re.checkStrictMode = re.getErrorPath = re.Type = re.useFunc = re.setEvaluated = re.evaluatedPropsToName = re.mergeEvaluated = re.eachItem = re.unescapeJsonPointer = re.escapeJsonPointer = re.escapeFragment = re.unescapeFragment = re.schemaRefOrVal = re.schemaHasRulesButRef = re.schemaHasRules = re.checkUnknownRules = re.alwaysValidSchema = re.toHash = void 0;
  const e = ne(), t = _n();
  function s(m) {
    const v = {};
    for (const R of m)
      v[R] = !0;
    return v;
  }
  re.toHash = s;
  function r(m, v) {
    return typeof v == "boolean" ? v : Object.keys(v).length === 0 ? !0 : (l(m, v), !n(v, m.self.RULES.all));
  }
  re.alwaysValidSchema = r;
  function l(m, v = m.schema) {
    const { opts: R, self: T } = m;
    if (!R.strictSchema || typeof v == "boolean")
      return;
    const C = T.RULES.keywords;
    for (const V in v)
      C[V] || w(m, `unknown keyword: "${V}"`);
  }
  re.checkUnknownRules = l;
  function n(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const R in m)
      if (v[R])
        return !0;
    return !1;
  }
  re.schemaHasRules = n;
  function i(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const R in m)
      if (R !== "$ref" && v.all[R])
        return !0;
    return !1;
  }
  re.schemaHasRulesButRef = i;
  function a({ topSchemaRef: m, schemaPath: v }, R, T, C) {
    if (!C) {
      if (typeof R == "number" || typeof R == "boolean")
        return R;
      if (typeof R == "string")
        return (0, e._)`${R}`;
    }
    return (0, e._)`${m}${v}${(0, e.getProperty)(T)}`;
  }
  re.schemaRefOrVal = a;
  function u(m) {
    return g(decodeURIComponent(m));
  }
  re.unescapeFragment = u;
  function d(m) {
    return encodeURIComponent(c(m));
  }
  re.escapeFragment = d;
  function c(m) {
    return typeof m == "number" ? `${m}` : m.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  re.escapeJsonPointer = c;
  function g(m) {
    return m.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  re.unescapeJsonPointer = g;
  function _(m, v) {
    if (Array.isArray(m))
      for (const R of m)
        v(R);
    else
      v(m);
  }
  re.eachItem = _;
  function $({ mergeNames: m, mergeToName: v, mergeValues: R, resultToName: T }) {
    return (C, V, D, U) => {
      const z = D === void 0 ? V : D instanceof e.Name ? (V instanceof e.Name ? m(C, V, D) : v(C, V, D), D) : V instanceof e.Name ? (v(C, D, V), V) : R(V, D);
      return U === e.Name && !(z instanceof e.Name) ? T(C, z) : z;
    };
  }
  re.mergeEvaluated = {
    props: $({
      mergeNames: (m, v, R) => m.if((0, e._)`${R} !== true && ${v} !== undefined`, () => {
        m.if((0, e._)`${v} === true`, () => m.assign(R, !0), () => m.assign(R, (0, e._)`${R} || {}`).code((0, e._)`Object.assign(${R}, ${v})`));
      }),
      mergeToName: (m, v, R) => m.if((0, e._)`${R} !== true`, () => {
        v === !0 ? m.assign(R, !0) : (m.assign(R, (0, e._)`${R} || {}`), E(m, R, v));
      }),
      mergeValues: (m, v) => m === !0 ? !0 : { ...m, ...v },
      resultToName: b
    }),
    items: $({
      mergeNames: (m, v, R) => m.if((0, e._)`${R} !== true && ${v} !== undefined`, () => m.assign(R, (0, e._)`${v} === true ? true : ${R} > ${v} ? ${R} : ${v}`)),
      mergeToName: (m, v, R) => m.if((0, e._)`${R} !== true`, () => m.assign(R, v === !0 ? !0 : (0, e._)`${R} > ${v} ? ${R} : ${v}`)),
      mergeValues: (m, v) => m === !0 ? !0 : Math.max(m, v),
      resultToName: (m, v) => m.var("items", v)
    })
  };
  function b(m, v) {
    if (v === !0)
      return m.var("props", !0);
    const R = m.var("props", (0, e._)`{}`);
    return v !== void 0 && E(m, R, v), R;
  }
  re.evaluatedPropsToName = b;
  function E(m, v, R) {
    Object.keys(R).forEach((T) => m.assign((0, e._)`${v}${(0, e.getProperty)(T)}`, !0));
  }
  re.setEvaluated = E;
  const f = {};
  function y(m, v) {
    return m.scopeValue("func", {
      ref: v,
      code: f[v.code] || (f[v.code] = new t._Code(v.code))
    });
  }
  re.useFunc = y;
  var o;
  (function(m) {
    m[m.Num = 0] = "Num", m[m.Str = 1] = "Str";
  })(o || (re.Type = o = {}));
  function p(m, v, R) {
    if (m instanceof e.Name) {
      const T = v === o.Num;
      return R ? T ? (0, e._)`"[" + ${m} + "]"` : (0, e._)`"['" + ${m} + "']"` : T ? (0, e._)`"/" + ${m}` : (0, e._)`"/" + ${m}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return R ? (0, e.getProperty)(m).toString() : "/" + c(m);
  }
  re.getErrorPath = p;
  function w(m, v, R = m.opts.strictSchema) {
    if (R) {
      if (v = `strict mode: ${v}`, R === !0)
        throw new Error(v);
      m.self.logger.warn(v);
    }
  }
  return re.checkStrictMode = w, re;
}
var Or = {}, oi;
function xe() {
  if (oi) return Or;
  oi = 1, Object.defineProperty(Or, "__esModule", { value: !0 });
  const e = ne(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Or.default = t, Or;
}
var ii;
function Nn() {
  return ii || (ii = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = ne(), s = ce(), r = xe();
    e.keywordError = {
      message: ({ keyword: f }) => (0, t.str)`must pass "${f}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: f, schemaType: y }) => y ? (0, t.str)`"${f}" keyword must be ${y} ($data)` : (0, t.str)`"${f}" keyword is invalid ($data)`
    };
    function l(f, y = e.keywordError, o, p) {
      const { it: w } = f, { gen: m, compositeRule: v, allErrors: R } = w, T = g(f, y, o);
      p ?? (v || R) ? u(m, T) : d(w, (0, t._)`[${T}]`);
    }
    e.reportError = l;
    function n(f, y = e.keywordError, o) {
      const { it: p } = f, { gen: w, compositeRule: m, allErrors: v } = p, R = g(f, y, o);
      u(w, R), m || v || d(p, r.default.vErrors);
    }
    e.reportExtraError = n;
    function i(f, y) {
      f.assign(r.default.errors, y), f.if((0, t._)`${r.default.vErrors} !== null`, () => f.if(y, () => f.assign((0, t._)`${r.default.vErrors}.length`, y), () => f.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function a({ gen: f, keyword: y, schemaValue: o, data: p, errsCount: w, it: m }) {
      if (w === void 0)
        throw new Error("ajv implementation error");
      const v = f.name("err");
      f.forRange("i", w, r.default.errors, (R) => {
        f.const(v, (0, t._)`${r.default.vErrors}[${R}]`), f.if((0, t._)`${v}.instancePath === undefined`, () => f.assign((0, t._)`${v}.instancePath`, (0, t.strConcat)(r.default.instancePath, m.errorPath))), f.assign((0, t._)`${v}.schemaPath`, (0, t.str)`${m.errSchemaPath}/${y}`), m.opts.verbose && (f.assign((0, t._)`${v}.schema`, o), f.assign((0, t._)`${v}.data`, p));
      });
    }
    e.extendErrors = a;
    function u(f, y) {
      const o = f.const("err", y);
      f.if((0, t._)`${r.default.vErrors} === null`, () => f.assign(r.default.vErrors, (0, t._)`[${o}]`), (0, t._)`${r.default.vErrors}.push(${o})`), f.code((0, t._)`${r.default.errors}++`);
    }
    function d(f, y) {
      const { gen: o, validateName: p, schemaEnv: w } = f;
      w.$async ? o.throw((0, t._)`new ${f.ValidationError}(${y})`) : (o.assign((0, t._)`${p}.errors`, y), o.return(!1));
    }
    const c = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function g(f, y, o) {
      const { createErrors: p } = f.it;
      return p === !1 ? (0, t._)`{}` : _(f, y, o);
    }
    function _(f, y, o = {}) {
      const { gen: p, it: w } = f, m = [
        $(w, o),
        b(f, o)
      ];
      return E(f, y, m), p.object(...m);
    }
    function $({ errorPath: f }, { instancePath: y }) {
      const o = y ? (0, t.str)`${f}${(0, s.getErrorPath)(y, s.Type.Str)}` : f;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, o)];
    }
    function b({ keyword: f, it: { errSchemaPath: y } }, { schemaPath: o, parentSchema: p }) {
      let w = p ? y : (0, t.str)`${y}/${f}`;
      return o && (w = (0, t.str)`${w}${(0, s.getErrorPath)(o, s.Type.Str)}`), [c.schemaPath, w];
    }
    function E(f, { params: y, message: o }, p) {
      const { keyword: w, data: m, schemaValue: v, it: R } = f, { opts: T, propertyName: C, topSchemaRef: V, schemaPath: D } = R;
      p.push([c.keyword, w], [c.params, typeof y == "function" ? y(f) : y || (0, t._)`{}`]), T.messages && p.push([c.message, typeof o == "function" ? o(f) : o]), T.verbose && p.push([c.schema, v], [c.parentSchema, (0, t._)`${V}${D}`], [r.default.data, m]), C && p.push([c.propertyName, C]);
    }
  })(xn)), xn;
}
var ci;
function If() {
  if (ci) return it;
  ci = 1, Object.defineProperty(it, "__esModule", { value: !0 }), it.boolOrEmptySchema = it.topBoolOrEmptySchema = void 0;
  const e = Nn(), t = ne(), s = xe(), r = {
    message: "boolean schema is false"
  };
  function l(a) {
    const { gen: u, schema: d, validateName: c } = a;
    d === !1 ? i(a, !1) : typeof d == "object" && d.$async === !0 ? u.return(s.default.data) : (u.assign((0, t._)`${c}.errors`, null), u.return(!0));
  }
  it.topBoolOrEmptySchema = l;
  function n(a, u) {
    const { gen: d, schema: c } = a;
    c === !1 ? (d.var(u, !1), i(a)) : d.var(u, !0);
  }
  it.boolOrEmptySchema = n;
  function i(a, u) {
    const { gen: d, data: c } = a, g = {
      gen: d,
      keyword: "false schema",
      data: c,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: a
    };
    (0, e.reportError)(g, r, void 0, u);
  }
  return it;
}
var ve = {}, ct = {}, ui;
function Ru() {
  if (ui) return ct;
  ui = 1, Object.defineProperty(ct, "__esModule", { value: !0 }), ct.getRules = ct.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function s(l) {
    return typeof l == "string" && t.has(l);
  }
  ct.isJSONType = s;
  function r() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return ct.getRules = r, ct;
}
var ze = {}, li;
function Pu() {
  if (li) return ze;
  li = 1, Object.defineProperty(ze, "__esModule", { value: !0 }), ze.shouldUseRule = ze.shouldUseGroup = ze.schemaHasRulesForType = void 0;
  function e({ schema: r, self: l }, n) {
    const i = l.RULES.types[n];
    return i && i !== !0 && t(r, i);
  }
  ze.schemaHasRulesForType = e;
  function t(r, l) {
    return l.rules.some((n) => s(r, n));
  }
  ze.shouldUseGroup = t;
  function s(r, l) {
    var n;
    return r[l.keyword] !== void 0 || ((n = l.definition.implements) === null || n === void 0 ? void 0 : n.some((i) => r[i] !== void 0));
  }
  return ze.shouldUseRule = s, ze;
}
var di;
function $n() {
  if (di) return ve;
  di = 1, Object.defineProperty(ve, "__esModule", { value: !0 }), ve.reportTypeError = ve.checkDataTypes = ve.checkDataType = ve.coerceAndCheckDataType = ve.getJSONTypes = ve.getSchemaTypes = ve.DataType = void 0;
  const e = Ru(), t = Pu(), s = Nn(), r = ne(), l = ce();
  var n;
  (function(o) {
    o[o.Correct = 0] = "Correct", o[o.Wrong = 1] = "Wrong";
  })(n || (ve.DataType = n = {}));
  function i(o) {
    const p = a(o.type);
    if (p.includes("null")) {
      if (o.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!p.length && o.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      o.nullable === !0 && p.push("null");
    }
    return p;
  }
  ve.getSchemaTypes = i;
  function a(o) {
    const p = Array.isArray(o) ? o : o ? [o] : [];
    if (p.every(e.isJSONType))
      return p;
    throw new Error("type must be JSONType or JSONType[]: " + p.join(","));
  }
  ve.getJSONTypes = a;
  function u(o, p) {
    const { gen: w, data: m, opts: v } = o, R = c(p, v.coerceTypes), T = p.length > 0 && !(R.length === 0 && p.length === 1 && (0, t.schemaHasRulesForType)(o, p[0]));
    if (T) {
      const C = b(p, m, v.strictNumbers, n.Wrong);
      w.if(C, () => {
        R.length ? g(o, p, R) : f(o);
      });
    }
    return T;
  }
  ve.coerceAndCheckDataType = u;
  const d = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function c(o, p) {
    return p ? o.filter((w) => d.has(w) || p === "array" && w === "array") : [];
  }
  function g(o, p, w) {
    const { gen: m, data: v, opts: R } = o, T = m.let("dataType", (0, r._)`typeof ${v}`), C = m.let("coerced", (0, r._)`undefined`);
    R.coerceTypes === "array" && m.if((0, r._)`${T} == 'object' && Array.isArray(${v}) && ${v}.length == 1`, () => m.assign(v, (0, r._)`${v}[0]`).assign(T, (0, r._)`typeof ${v}`).if(b(p, v, R.strictNumbers), () => m.assign(C, v))), m.if((0, r._)`${C} !== undefined`);
    for (const D of w)
      (d.has(D) || D === "array" && R.coerceTypes === "array") && V(D);
    m.else(), f(o), m.endIf(), m.if((0, r._)`${C} !== undefined`, () => {
      m.assign(v, C), _(o, C);
    });
    function V(D) {
      switch (D) {
        case "string":
          m.elseIf((0, r._)`${T} == "number" || ${T} == "boolean"`).assign(C, (0, r._)`"" + ${v}`).elseIf((0, r._)`${v} === null`).assign(C, (0, r._)`""`);
          return;
        case "number":
          m.elseIf((0, r._)`${T} == "boolean" || ${v} === null
              || (${T} == "string" && ${v} && ${v} == +${v})`).assign(C, (0, r._)`+${v}`);
          return;
        case "integer":
          m.elseIf((0, r._)`${T} === "boolean" || ${v} === null
              || (${T} === "string" && ${v} && ${v} == +${v} && !(${v} % 1))`).assign(C, (0, r._)`+${v}`);
          return;
        case "boolean":
          m.elseIf((0, r._)`${v} === "false" || ${v} === 0 || ${v} === null`).assign(C, !1).elseIf((0, r._)`${v} === "true" || ${v} === 1`).assign(C, !0);
          return;
        case "null":
          m.elseIf((0, r._)`${v} === "" || ${v} === 0 || ${v} === false`), m.assign(C, null);
          return;
        case "array":
          m.elseIf((0, r._)`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${v} === null`).assign(C, (0, r._)`[${v}]`);
      }
    }
  }
  function _({ gen: o, parentData: p, parentDataProperty: w }, m) {
    o.if((0, r._)`${p} !== undefined`, () => o.assign((0, r._)`${p}[${w}]`, m));
  }
  function $(o, p, w, m = n.Correct) {
    const v = m === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let R;
    switch (o) {
      case "null":
        return (0, r._)`${p} ${v} null`;
      case "array":
        R = (0, r._)`Array.isArray(${p})`;
        break;
      case "object":
        R = (0, r._)`${p} && typeof ${p} == "object" && !Array.isArray(${p})`;
        break;
      case "integer":
        R = T((0, r._)`!(${p} % 1) && !isNaN(${p})`);
        break;
      case "number":
        R = T();
        break;
      default:
        return (0, r._)`typeof ${p} ${v} ${o}`;
    }
    return m === n.Correct ? R : (0, r.not)(R);
    function T(C = r.nil) {
      return (0, r.and)((0, r._)`typeof ${p} == "number"`, C, w ? (0, r._)`isFinite(${p})` : r.nil);
    }
  }
  ve.checkDataType = $;
  function b(o, p, w, m) {
    if (o.length === 1)
      return $(o[0], p, w, m);
    let v;
    const R = (0, l.toHash)(o);
    if (R.array && R.object) {
      const T = (0, r._)`typeof ${p} != "object"`;
      v = R.null ? T : (0, r._)`!${p} || ${T}`, delete R.null, delete R.array, delete R.object;
    } else
      v = r.nil;
    R.number && delete R.integer;
    for (const T in R)
      v = (0, r.and)(v, $(T, p, w, m));
    return v;
  }
  ve.checkDataTypes = b;
  const E = {
    message: ({ schema: o }) => `must be ${o}`,
    params: ({ schema: o, schemaValue: p }) => typeof o == "string" ? (0, r._)`{type: ${o}}` : (0, r._)`{type: ${p}}`
  };
  function f(o) {
    const p = y(o);
    (0, s.reportError)(p, E);
  }
  ve.reportTypeError = f;
  function y(o) {
    const { gen: p, data: w, schema: m } = o, v = (0, l.schemaRefOrVal)(o, m, "type");
    return {
      gen: p,
      keyword: "type",
      data: w,
      schema: m.type,
      schemaCode: v,
      schemaValue: v,
      parentSchema: m,
      params: {},
      it: o
    };
  }
  return ve;
}
var Pt = {}, fi;
function Tf() {
  if (fi) return Pt;
  fi = 1, Object.defineProperty(Pt, "__esModule", { value: !0 }), Pt.assignDefaults = void 0;
  const e = ne(), t = ce();
  function s(l, n) {
    const { properties: i, items: a } = l.schema;
    if (n === "object" && i)
      for (const u in i)
        r(l, u, i[u].default);
    else n === "array" && Array.isArray(a) && a.forEach((u, d) => r(l, d, u.default));
  }
  Pt.assignDefaults = s;
  function r(l, n, i) {
    const { gen: a, compositeRule: u, data: d, opts: c } = l;
    if (i === void 0)
      return;
    const g = (0, e._)`${d}${(0, e.getProperty)(n)}`;
    if (u) {
      (0, t.checkStrictMode)(l, `default is ignored for: ${g}`);
      return;
    }
    let _ = (0, e._)`${g} === undefined`;
    c.useDefaults === "empty" && (_ = (0, e._)`${_} || ${g} === null || ${g} === ""`), a.if(_, (0, e._)`${g} = ${(0, e.stringify)(i)}`);
  }
  return Pt;
}
var je = {}, fe = {}, hi;
function qe() {
  if (hi) return fe;
  hi = 1, Object.defineProperty(fe, "__esModule", { value: !0 }), fe.validateUnion = fe.validateArray = fe.usePattern = fe.callValidateCode = fe.schemaProperties = fe.allSchemaProperties = fe.noPropertyInData = fe.propertyInData = fe.isOwnProperty = fe.hasPropFunc = fe.reportMissingProp = fe.checkMissingProp = fe.checkReportMissingProp = void 0;
  const e = ne(), t = ce(), s = xe(), r = ce();
  function l(o, p) {
    const { gen: w, data: m, it: v } = o;
    w.if(c(w, m, p, v.opts.ownProperties), () => {
      o.setParams({ missingProperty: (0, e._)`${p}` }, !0), o.error();
    });
  }
  fe.checkReportMissingProp = l;
  function n({ gen: o, data: p, it: { opts: w } }, m, v) {
    return (0, e.or)(...m.map((R) => (0, e.and)(c(o, p, R, w.ownProperties), (0, e._)`${v} = ${R}`)));
  }
  fe.checkMissingProp = n;
  function i(o, p) {
    o.setParams({ missingProperty: p }, !0), o.error();
  }
  fe.reportMissingProp = i;
  function a(o) {
    return o.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  fe.hasPropFunc = a;
  function u(o, p, w) {
    return (0, e._)`${a(o)}.call(${p}, ${w})`;
  }
  fe.isOwnProperty = u;
  function d(o, p, w, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(w)} !== undefined`;
    return m ? (0, e._)`${v} && ${u(o, p, w)}` : v;
  }
  fe.propertyInData = d;
  function c(o, p, w, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(w)} === undefined`;
    return m ? (0, e.or)(v, (0, e.not)(u(o, p, w))) : v;
  }
  fe.noPropertyInData = c;
  function g(o) {
    return o ? Object.keys(o).filter((p) => p !== "__proto__") : [];
  }
  fe.allSchemaProperties = g;
  function _(o, p) {
    return g(p).filter((w) => !(0, t.alwaysValidSchema)(o, p[w]));
  }
  fe.schemaProperties = _;
  function $({ schemaCode: o, data: p, it: { gen: w, topSchemaRef: m, schemaPath: v, errorPath: R }, it: T }, C, V, D) {
    const U = D ? (0, e._)`${o}, ${p}, ${m}${v}` : p, z = [
      [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, R)],
      [s.default.parentData, T.parentData],
      [s.default.parentDataProperty, T.parentDataProperty],
      [s.default.rootData, s.default.rootData]
    ];
    T.opts.dynamicRef && z.push([s.default.dynamicAnchors, s.default.dynamicAnchors]);
    const M = (0, e._)`${U}, ${w.object(...z)}`;
    return V !== e.nil ? (0, e._)`${C}.call(${V}, ${M})` : (0, e._)`${C}(${M})`;
  }
  fe.callValidateCode = $;
  const b = (0, e._)`new RegExp`;
  function E({ gen: o, it: { opts: p } }, w) {
    const m = p.unicodeRegExp ? "u" : "", { regExp: v } = p.code, R = v(w, m);
    return o.scopeValue("pattern", {
      key: R.toString(),
      ref: R,
      code: (0, e._)`${v.code === "new RegExp" ? b : (0, r.useFunc)(o, v)}(${w}, ${m})`
    });
  }
  fe.usePattern = E;
  function f(o) {
    const { gen: p, data: w, keyword: m, it: v } = o, R = p.name("valid");
    if (v.allErrors) {
      const C = p.let("valid", !0);
      return T(() => p.assign(C, !1)), C;
    }
    return p.var(R, !0), T(() => p.break()), R;
    function T(C) {
      const V = p.const("len", (0, e._)`${w}.length`);
      p.forRange("i", 0, V, (D) => {
        o.subschema({
          keyword: m,
          dataProp: D,
          dataPropType: t.Type.Num
        }, R), p.if((0, e.not)(R), C);
      });
    }
  }
  fe.validateArray = f;
  function y(o) {
    const { gen: p, schema: w, keyword: m, it: v } = o;
    if (!Array.isArray(w))
      throw new Error("ajv implementation error");
    if (w.some((V) => (0, t.alwaysValidSchema)(v, V)) && !v.opts.unevaluated)
      return;
    const T = p.let("valid", !1), C = p.name("_valid");
    p.block(() => w.forEach((V, D) => {
      const U = o.subschema({
        keyword: m,
        schemaProp: D,
        compositeRule: !0
      }, C);
      p.assign(T, (0, e._)`${T} || ${C}`), o.mergeValidEvaluated(U, C) || p.if((0, e.not)(T));
    })), o.result(T, () => o.reset(), () => o.error(!0));
  }
  return fe.validateUnion = y, fe;
}
var mi;
function jf() {
  if (mi) return je;
  mi = 1, Object.defineProperty(je, "__esModule", { value: !0 }), je.validateKeywordUsage = je.validSchemaType = je.funcKeywordCode = je.macroKeywordCode = void 0;
  const e = ne(), t = xe(), s = qe(), r = Nn();
  function l(_, $) {
    const { gen: b, keyword: E, schema: f, parentSchema: y, it: o } = _, p = $.macro.call(o.self, f, y, o), w = d(b, E, p);
    o.opts.validateSchema !== !1 && o.self.validateSchema(p, !0);
    const m = b.name("valid");
    _.subschema({
      schema: p,
      schemaPath: e.nil,
      errSchemaPath: `${o.errSchemaPath}/${E}`,
      topSchemaRef: w,
      compositeRule: !0
    }, m), _.pass(m, () => _.error(!0));
  }
  je.macroKeywordCode = l;
  function n(_, $) {
    var b;
    const { gen: E, keyword: f, schema: y, parentSchema: o, $data: p, it: w } = _;
    u(w, $);
    const m = !p && $.compile ? $.compile.call(w.self, y, o, w) : $.validate, v = d(E, f, m), R = E.let("valid");
    _.block$data(R, T), _.ok((b = $.valid) !== null && b !== void 0 ? b : R);
    function T() {
      if ($.errors === !1)
        D(), $.modifying && i(_), U(() => _.error());
      else {
        const z = $.async ? C() : V();
        $.modifying && i(_), U(() => a(_, z));
      }
    }
    function C() {
      const z = E.let("ruleErrs", null);
      return E.try(() => D((0, e._)`await `), (M) => E.assign(R, !1).if((0, e._)`${M} instanceof ${w.ValidationError}`, () => E.assign(z, (0, e._)`${M}.errors`), () => E.throw(M))), z;
    }
    function V() {
      const z = (0, e._)`${v}.errors`;
      return E.assign(z, null), D(e.nil), z;
    }
    function D(z = $.async ? (0, e._)`await ` : e.nil) {
      const M = w.opts.passContext ? t.default.this : t.default.self, F = !("compile" in $ && !p || $.schema === !1);
      E.assign(R, (0, e._)`${z}${(0, s.callValidateCode)(_, v, M, F)}`, $.modifying);
    }
    function U(z) {
      var M;
      E.if((0, e.not)((M = $.valid) !== null && M !== void 0 ? M : R), z);
    }
  }
  je.funcKeywordCode = n;
  function i(_) {
    const { gen: $, data: b, it: E } = _;
    $.if(E.parentData, () => $.assign(b, (0, e._)`${E.parentData}[${E.parentDataProperty}]`));
  }
  function a(_, $) {
    const { gen: b } = _;
    b.if((0, e._)`Array.isArray(${$})`, () => {
      b.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${$} : ${t.default.vErrors}.concat(${$})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(_);
    }, () => _.error());
  }
  function u({ schemaEnv: _ }, $) {
    if ($.async && !_.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(_, $, b) {
    if (b === void 0)
      throw new Error(`keyword "${$}" failed to compile`);
    return _.scopeValue("keyword", typeof b == "function" ? { ref: b } : { ref: b, code: (0, e.stringify)(b) });
  }
  function c(_, $, b = !1) {
    return !$.length || $.some((E) => E === "array" ? Array.isArray(_) : E === "object" ? _ && typeof _ == "object" && !Array.isArray(_) : typeof _ == E || b && typeof _ > "u");
  }
  je.validSchemaType = c;
  function g({ schema: _, opts: $, self: b, errSchemaPath: E }, f, y) {
    if (Array.isArray(f.keyword) ? !f.keyword.includes(y) : f.keyword !== y)
      throw new Error("ajv implementation error");
    const o = f.dependencies;
    if (o?.some((p) => !Object.prototype.hasOwnProperty.call(_, p)))
      throw new Error(`parent schema must have dependencies of ${y}: ${o.join(",")}`);
    if (f.validateSchema && !f.validateSchema(_[y])) {
      const w = `keyword "${y}" value is invalid at path "${E}": ` + b.errorsText(f.validateSchema.errors);
      if ($.validateSchema === "log")
        b.logger.error(w);
      else
        throw new Error(w);
    }
  }
  return je.validateKeywordUsage = g, je;
}
var Ke = {}, pi;
function Af() {
  if (pi) return Ke;
  pi = 1, Object.defineProperty(Ke, "__esModule", { value: !0 }), Ke.extendSubschemaMode = Ke.extendSubschemaData = Ke.getSubschema = void 0;
  const e = ne(), t = ce();
  function s(n, { keyword: i, schemaProp: a, schema: u, schemaPath: d, errSchemaPath: c, topSchemaRef: g }) {
    if (i !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const _ = n.schema[i];
      return a === void 0 ? {
        schema: _,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}`
      } : {
        schema: _[a],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(a)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}/${(0, t.escapeFragment)(a)}`
      };
    }
    if (u !== void 0) {
      if (d === void 0 || c === void 0 || g === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: d,
        topSchemaRef: g,
        errSchemaPath: c
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Ke.getSubschema = s;
  function r(n, i, { dataProp: a, dataPropType: u, data: d, dataTypes: c, propertyName: g }) {
    if (d !== void 0 && a !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: _ } = i;
    if (a !== void 0) {
      const { errorPath: b, dataPathArr: E, opts: f } = i, y = _.let("data", (0, e._)`${i.data}${(0, e.getProperty)(a)}`, !0);
      $(y), n.errorPath = (0, e.str)`${b}${(0, t.getErrorPath)(a, u, f.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${a}`, n.dataPathArr = [...E, n.parentDataProperty];
    }
    if (d !== void 0) {
      const b = d instanceof e.Name ? d : _.let("data", d, !0);
      $(b), g !== void 0 && (n.propertyName = g);
    }
    c && (n.dataTypes = c);
    function $(b) {
      n.data = b, n.dataLevel = i.dataLevel + 1, n.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), n.parentData = i.data, n.dataNames = [...i.dataNames, b];
    }
  }
  Ke.extendSubschemaData = r;
  function l(n, { jtdDiscriminator: i, jtdMetadata: a, compositeRule: u, createErrors: d, allErrors: c }) {
    u !== void 0 && (n.compositeRule = u), d !== void 0 && (n.createErrors = d), c !== void 0 && (n.allErrors = c), n.jtdDiscriminator = i, n.jtdMetadata = a;
  }
  return Ke.extendSubschemaMode = l, Ke;
}
var be = {}, ns = { exports: {} }, yi;
function kf() {
  if (yi) return ns.exports;
  yi = 1;
  var e = ns.exports = function(r, l, n) {
    typeof l == "function" && (n = l, l = {}), n = l.cb || n;
    var i = typeof n == "function" ? n : n.pre || function() {
    }, a = n.post || function() {
    };
    t(l, i, a, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, l, n, i, a, u, d, c, g, _) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      l(i, a, u, d, c, g, _);
      for (var $ in i) {
        var b = i[$];
        if (Array.isArray(b)) {
          if ($ in e.arrayKeywords)
            for (var E = 0; E < b.length; E++)
              t(r, l, n, b[E], a + "/" + $ + "/" + E, u, a, $, i, E);
        } else if ($ in e.propsKeywords) {
          if (b && typeof b == "object")
            for (var f in b)
              t(r, l, n, b[f], a + "/" + $ + "/" + s(f), u, a, $, i, f);
        } else ($ in e.keywords || r.allKeys && !($ in e.skipKeywords)) && t(r, l, n, b, a + "/" + $, u, a, $, i);
      }
      n(i, a, u, d, c, g, _);
    }
  }
  function s(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return ns.exports;
}
var vi;
function On() {
  if (vi) return be;
  vi = 1, Object.defineProperty(be, "__esModule", { value: !0 }), be.getSchemaRefs = be.resolveUrl = be.normalizeId = be._getFullPath = be.getFullPath = be.inlineRef = void 0;
  const e = ce(), t = En(), s = kf(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function l(E, f = !0) {
    return typeof E == "boolean" ? !0 : f === !0 ? !i(E) : f ? a(E) <= f : !1;
  }
  be.inlineRef = l;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(E) {
    for (const f in E) {
      if (n.has(f))
        return !0;
      const y = E[f];
      if (Array.isArray(y) && y.some(i) || typeof y == "object" && i(y))
        return !0;
    }
    return !1;
  }
  function a(E) {
    let f = 0;
    for (const y in E) {
      if (y === "$ref")
        return 1 / 0;
      if (f++, !r.has(y) && (typeof E[y] == "object" && (0, e.eachItem)(E[y], (o) => f += a(o)), f === 1 / 0))
        return 1 / 0;
    }
    return f;
  }
  function u(E, f = "", y) {
    y !== !1 && (f = g(f));
    const o = E.parse(f);
    return d(E, o);
  }
  be.getFullPath = u;
  function d(E, f) {
    return E.serialize(f).split("#")[0] + "#";
  }
  be._getFullPath = d;
  const c = /#\/?$/;
  function g(E) {
    return E ? E.replace(c, "") : "";
  }
  be.normalizeId = g;
  function _(E, f, y) {
    return y = g(y), E.resolve(f, y);
  }
  be.resolveUrl = _;
  const $ = /^[a-z_][-a-z0-9._]*$/i;
  function b(E, f) {
    if (typeof E == "boolean")
      return {};
    const { schemaId: y, uriResolver: o } = this.opts, p = g(E[y] || f), w = { "": p }, m = u(o, p, !1), v = {}, R = /* @__PURE__ */ new Set();
    return s(E, { allKeys: !0 }, (V, D, U, z) => {
      if (z === void 0)
        return;
      const M = m + D;
      let F = w[z];
      typeof V[y] == "string" && (F = X.call(this, V[y])), B.call(this, V.$anchor), B.call(this, V.$dynamicAnchor), w[D] = F;
      function X(J) {
        const Y = this.opts.uriResolver.resolve;
        if (J = g(F ? Y(F, J) : J), R.has(J))
          throw C(J);
        R.add(J);
        let k = this.refs[J];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? T(V, k.schema, J) : J !== g(M) && (J[0] === "#" ? (T(V, v[J], J), v[J] = V) : this.refs[J] = M), J;
      }
      function B(J) {
        if (typeof J == "string") {
          if (!$.test(J))
            throw new Error(`invalid anchor "${J}"`);
          X.call(this, `#${J}`);
        }
      }
    }), v;
    function T(V, D, U) {
      if (D !== void 0 && !t(V, D))
        throw C(U);
    }
    function C(V) {
      return new Error(`reference "${V}" resolves to more than one schema`);
    }
  }
  return be.getSchemaRefs = b, be;
}
var _i;
function In() {
  if (_i) return Ue;
  _i = 1, Object.defineProperty(Ue, "__esModule", { value: !0 }), Ue.getData = Ue.KeywordCxt = Ue.validateFunctionCode = void 0;
  const e = If(), t = $n(), s = Pu(), r = $n(), l = Tf(), n = jf(), i = Af(), a = ne(), u = xe(), d = On(), c = ce(), g = Nn();
  function _(P) {
    if (m(P) && (R(P), w(P))) {
      f(P);
      return;
    }
    $(P, () => (0, e.topBoolOrEmptySchema)(P));
  }
  Ue.validateFunctionCode = _;
  function $({ gen: P, validateName: I, schema: q, schemaEnv: L, opts: G }, W) {
    G.code.es5 ? P.func(I, (0, a._)`${u.default.data}, ${u.default.valCxt}`, L.$async, () => {
      P.code((0, a._)`"use strict"; ${o(q, G)}`), E(P, G), P.code(W);
    }) : P.func(I, (0, a._)`${u.default.data}, ${b(G)}`, L.$async, () => P.code(o(q, G)).code(W));
  }
  function b(P) {
    return (0, a._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${P.dynamicRef ? (0, a._)`, ${u.default.dynamicAnchors}={}` : a.nil}}={}`;
  }
  function E(P, I) {
    P.if(u.default.valCxt, () => {
      P.var(u.default.instancePath, (0, a._)`${u.default.valCxt}.${u.default.instancePath}`), P.var(u.default.parentData, (0, a._)`${u.default.valCxt}.${u.default.parentData}`), P.var(u.default.parentDataProperty, (0, a._)`${u.default.valCxt}.${u.default.parentDataProperty}`), P.var(u.default.rootData, (0, a._)`${u.default.valCxt}.${u.default.rootData}`), I.dynamicRef && P.var(u.default.dynamicAnchors, (0, a._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      P.var(u.default.instancePath, (0, a._)`""`), P.var(u.default.parentData, (0, a._)`undefined`), P.var(u.default.parentDataProperty, (0, a._)`undefined`), P.var(u.default.rootData, u.default.data), I.dynamicRef && P.var(u.default.dynamicAnchors, (0, a._)`{}`);
    });
  }
  function f(P) {
    const { schema: I, opts: q, gen: L } = P;
    $(P, () => {
      q.$comment && I.$comment && z(P), V(P), L.let(u.default.vErrors, null), L.let(u.default.errors, 0), q.unevaluated && y(P), T(P), M(P);
    });
  }
  function y(P) {
    const { gen: I, validateName: q } = P;
    P.evaluated = I.const("evaluated", (0, a._)`${q}.evaluated`), I.if((0, a._)`${P.evaluated}.dynamicProps`, () => I.assign((0, a._)`${P.evaluated}.props`, (0, a._)`undefined`)), I.if((0, a._)`${P.evaluated}.dynamicItems`, () => I.assign((0, a._)`${P.evaluated}.items`, (0, a._)`undefined`));
  }
  function o(P, I) {
    const q = typeof P == "object" && P[I.schemaId];
    return q && (I.code.source || I.code.process) ? (0, a._)`/*# sourceURL=${q} */` : a.nil;
  }
  function p(P, I) {
    if (m(P) && (R(P), w(P))) {
      v(P, I);
      return;
    }
    (0, e.boolOrEmptySchema)(P, I);
  }
  function w({ schema: P, self: I }) {
    if (typeof P == "boolean")
      return !P;
    for (const q in P)
      if (I.RULES.all[q])
        return !0;
    return !1;
  }
  function m(P) {
    return typeof P.schema != "boolean";
  }
  function v(P, I) {
    const { schema: q, gen: L, opts: G } = P;
    G.$comment && q.$comment && z(P), D(P), U(P);
    const W = L.const("_errs", u.default.errors);
    T(P, W), L.var(I, (0, a._)`${W} === ${u.default.errors}`);
  }
  function R(P) {
    (0, c.checkUnknownRules)(P), C(P);
  }
  function T(P, I) {
    if (P.opts.jtd)
      return X(P, [], !1, I);
    const q = (0, t.getSchemaTypes)(P.schema), L = (0, t.coerceAndCheckDataType)(P, q);
    X(P, q, !L, I);
  }
  function C(P) {
    const { schema: I, errSchemaPath: q, opts: L, self: G } = P;
    I.$ref && L.ignoreKeywordsWithRef && (0, c.schemaHasRulesButRef)(I, G.RULES) && G.logger.warn(`$ref: keywords ignored in schema at path "${q}"`);
  }
  function V(P) {
    const { schema: I, opts: q } = P;
    I.default !== void 0 && q.useDefaults && q.strictSchema && (0, c.checkStrictMode)(P, "default is ignored in the schema root");
  }
  function D(P) {
    const I = P.schema[P.opts.schemaId];
    I && (P.baseId = (0, d.resolveUrl)(P.opts.uriResolver, P.baseId, I));
  }
  function U(P) {
    if (P.schema.$async && !P.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function z({ gen: P, schemaEnv: I, schema: q, errSchemaPath: L, opts: G }) {
    const W = q.$comment;
    if (G.$comment === !0)
      P.code((0, a._)`${u.default.self}.logger.log(${W})`);
    else if (typeof G.$comment == "function") {
      const ae = (0, a.str)`${L}/$comment`, pe = P.scopeValue("root", { ref: I.root });
      P.code((0, a._)`${u.default.self}.opts.$comment(${W}, ${ae}, ${pe}.schema)`);
    }
  }
  function M(P) {
    const { gen: I, schemaEnv: q, validateName: L, ValidationError: G, opts: W } = P;
    q.$async ? I.if((0, a._)`${u.default.errors} === 0`, () => I.return(u.default.data), () => I.throw((0, a._)`new ${G}(${u.default.vErrors})`)) : (I.assign((0, a._)`${L}.errors`, u.default.vErrors), W.unevaluated && F(P), I.return((0, a._)`${u.default.errors} === 0`));
  }
  function F({ gen: P, evaluated: I, props: q, items: L }) {
    q instanceof a.Name && P.assign((0, a._)`${I}.props`, q), L instanceof a.Name && P.assign((0, a._)`${I}.items`, L);
  }
  function X(P, I, q, L) {
    const { gen: G, schema: W, data: ae, allErrors: pe, opts: ue, self: le } = P, { RULES: oe } = le;
    if (W.$ref && (ue.ignoreKeywordsWithRef || !(0, c.schemaHasRulesButRef)(W, oe))) {
      G.block(() => K(P, "$ref", oe.all.$ref.definition));
      return;
    }
    ue.jtd || J(P, I), G.block(() => {
      for (const he of oe.rules)
        Re(he);
      Re(oe.post);
    });
    function Re(he) {
      (0, s.shouldUseGroup)(W, he) && (he.type ? (G.if((0, r.checkDataType)(he.type, ae, ue.strictNumbers)), B(P, he), I.length === 1 && I[0] === he.type && q && (G.else(), (0, r.reportTypeError)(P)), G.endIf()) : B(P, he), pe || G.if((0, a._)`${u.default.errors} === ${L || 0}`));
    }
  }
  function B(P, I) {
    const { gen: q, schema: L, opts: { useDefaults: G } } = P;
    G && (0, l.assignDefaults)(P, I.type), q.block(() => {
      for (const W of I.rules)
        (0, s.shouldUseRule)(L, W) && K(P, W.keyword, W.definition, I.type);
    });
  }
  function J(P, I) {
    P.schemaEnv.meta || !P.opts.strictTypes || (Y(P, I), P.opts.allowUnionTypes || k(P, I), N(P, P.dataTypes));
  }
  function Y(P, I) {
    if (I.length) {
      if (!P.dataTypes.length) {
        P.dataTypes = I;
        return;
      }
      I.forEach((q) => {
        O(P.dataTypes, q) || S(P, `type "${q}" not allowed by context "${P.dataTypes.join(",")}"`);
      }), h(P, I);
    }
  }
  function k(P, I) {
    I.length > 1 && !(I.length === 2 && I.includes("null")) && S(P, "use allowUnionTypes to allow union type keyword");
  }
  function N(P, I) {
    const q = P.self.RULES.all;
    for (const L in q) {
      const G = q[L];
      if (typeof G == "object" && (0, s.shouldUseRule)(P.schema, G)) {
        const { type: W } = G.definition;
        W.length && !W.some((ae) => A(I, ae)) && S(P, `missing type "${W.join(",")}" for keyword "${L}"`);
      }
    }
  }
  function A(P, I) {
    return P.includes(I) || I === "number" && P.includes("integer");
  }
  function O(P, I) {
    return P.includes(I) || I === "integer" && P.includes("number");
  }
  function h(P, I) {
    const q = [];
    for (const L of P.dataTypes)
      O(I, L) ? q.push(L) : I.includes("integer") && L === "number" && q.push("integer");
    P.dataTypes = q;
  }
  function S(P, I) {
    const q = P.schemaEnv.baseId + P.errSchemaPath;
    I += ` at "${q}" (strictTypes)`, (0, c.checkStrictMode)(P, I, P.opts.strictTypes);
  }
  class j {
    constructor(I, q, L) {
      if ((0, n.validateKeywordUsage)(I, q, L), this.gen = I.gen, this.allErrors = I.allErrors, this.keyword = L, this.data = I.data, this.schema = I.schema[L], this.$data = q.$data && I.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, c.schemaRefOrVal)(I, this.schema, L, this.$data), this.schemaType = q.schemaType, this.parentSchema = I.schema, this.params = {}, this.it = I, this.def = q, this.$data)
        this.schemaCode = I.gen.const("vSchema", Z(this.$data, I));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, q.schemaType, q.allowUndefined))
        throw new Error(`${L} value must be ${JSON.stringify(q.schemaType)}`);
      ("code" in q ? q.trackErrors : q.errors !== !1) && (this.errsCount = I.gen.const("_errs", u.default.errors));
    }
    result(I, q, L) {
      this.failResult((0, a.not)(I), q, L);
    }
    failResult(I, q, L) {
      this.gen.if(I), L ? L() : this.error(), q ? (this.gen.else(), q(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(I, q) {
      this.failResult((0, a.not)(I), void 0, q);
    }
    fail(I) {
      if (I === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(I), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(I) {
      if (!this.$data)
        return this.fail(I);
      const { schemaCode: q } = this;
      this.fail((0, a._)`${q} !== undefined && (${(0, a.or)(this.invalid$data(), I)})`);
    }
    error(I, q, L) {
      if (q) {
        this.setParams(q), this._error(I, L), this.setParams({});
        return;
      }
      this._error(I, L);
    }
    _error(I, q) {
      (I ? g.reportExtraError : g.reportError)(this, this.def.error, q);
    }
    $dataError() {
      (0, g.reportError)(this, this.def.$dataError || g.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, g.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(I) {
      this.allErrors || this.gen.if(I);
    }
    setParams(I, q) {
      q ? Object.assign(this.params, I) : this.params = I;
    }
    block$data(I, q, L = a.nil) {
      this.gen.block(() => {
        this.check$data(I, L), q();
      });
    }
    check$data(I = a.nil, q = a.nil) {
      if (!this.$data)
        return;
      const { gen: L, schemaCode: G, schemaType: W, def: ae } = this;
      L.if((0, a.or)((0, a._)`${G} === undefined`, q)), I !== a.nil && L.assign(I, !0), (W.length || ae.validateSchema) && (L.elseIf(this.invalid$data()), this.$dataError(), I !== a.nil && L.assign(I, !1)), L.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: q, schemaType: L, def: G, it: W } = this;
      return (0, a.or)(ae(), pe());
      function ae() {
        if (L.length) {
          if (!(q instanceof a.Name))
            throw new Error("ajv implementation error");
          const ue = Array.isArray(L) ? L : [L];
          return (0, a._)`${(0, r.checkDataTypes)(ue, q, W.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return a.nil;
      }
      function pe() {
        if (G.validateSchema) {
          const ue = I.scopeValue("validate$data", { ref: G.validateSchema });
          return (0, a._)`!${ue}(${q})`;
        }
        return a.nil;
      }
    }
    subschema(I, q) {
      const L = (0, i.getSubschema)(this.it, I);
      (0, i.extendSubschemaData)(L, this.it, I), (0, i.extendSubschemaMode)(L, I);
      const G = { ...this.it, ...L, items: void 0, props: void 0 };
      return p(G, q), G;
    }
    mergeEvaluated(I, q) {
      const { it: L, gen: G } = this;
      L.opts.unevaluated && (L.props !== !0 && I.props !== void 0 && (L.props = c.mergeEvaluated.props(G, I.props, L.props, q)), L.items !== !0 && I.items !== void 0 && (L.items = c.mergeEvaluated.items(G, I.items, L.items, q)));
    }
    mergeValidEvaluated(I, q) {
      const { it: L, gen: G } = this;
      if (L.opts.unevaluated && (L.props !== !0 || L.items !== !0))
        return G.if(q, () => this.mergeEvaluated(I, a.Name)), !0;
    }
  }
  Ue.KeywordCxt = j;
  function K(P, I, q, L) {
    const G = new j(P, q, I);
    "code" in q ? q.code(G, L) : G.$data && q.validate ? (0, n.funcKeywordCode)(G, q) : "macro" in q ? (0, n.macroKeywordCode)(G, q) : (q.compile || q.validate) && (0, n.funcKeywordCode)(G, q);
  }
  const H = /^\/(?:[^~]|~0|~1)*$/, Q = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Z(P, { dataLevel: I, dataNames: q, dataPathArr: L }) {
    let G, W;
    if (P === "")
      return u.default.rootData;
    if (P[0] === "/") {
      if (!H.test(P))
        throw new Error(`Invalid JSON-pointer: ${P}`);
      G = P, W = u.default.rootData;
    } else {
      const le = Q.exec(P);
      if (!le)
        throw new Error(`Invalid JSON-pointer: ${P}`);
      const oe = +le[1];
      if (G = le[2], G === "#") {
        if (oe >= I)
          throw new Error(ue("property/index", oe));
        return L[I - oe];
      }
      if (oe > I)
        throw new Error(ue("data", oe));
      if (W = q[I - oe], !G)
        return W;
    }
    let ae = W;
    const pe = G.split("/");
    for (const le of pe)
      le && (W = (0, a._)`${W}${(0, a.getProperty)((0, c.unescapeJsonPointer)(le))}`, ae = (0, a._)`${ae} && ${W}`);
    return ae;
    function ue(le, oe) {
      return `Cannot access ${le} ${oe} levels up, current level is ${I}`;
    }
  }
  return Ue.getData = Z, Ue;
}
var Ir = {}, $i;
function la() {
  if ($i) return Ir;
  $i = 1, Object.defineProperty(Ir, "__esModule", { value: !0 });
  class e extends Error {
    constructor(s) {
      super("validation failed"), this.errors = s, this.ajv = this.validation = !0;
    }
  }
  return Ir.default = e, Ir;
}
var Tr = {}, gi;
function Tn() {
  if (gi) return Tr;
  gi = 1, Object.defineProperty(Tr, "__esModule", { value: !0 });
  const e = On();
  class t extends Error {
    constructor(r, l, n, i) {
      super(i || `can't resolve reference ${n} from id ${l}`), this.missingRef = (0, e.resolveUrl)(r, l, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return Tr.default = t, Tr;
}
var Oe = {}, wi;
function da() {
  if (wi) return Oe;
  wi = 1, Object.defineProperty(Oe, "__esModule", { value: !0 }), Oe.resolveSchema = Oe.getCompilingSchema = Oe.resolveRef = Oe.compileSchema = Oe.SchemaEnv = void 0;
  const e = ne(), t = la(), s = xe(), r = On(), l = ce(), n = In();
  class i {
    constructor(y) {
      var o;
      this.refs = {}, this.dynamicAnchors = {};
      let p;
      typeof y.schema == "object" && (p = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (o = y.baseId) !== null && o !== void 0 ? o : (0, r.normalizeId)(p?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = p?.$async, this.refs = {};
    }
  }
  Oe.SchemaEnv = i;
  function a(f) {
    const y = c.call(this, f);
    if (y)
      return y;
    const o = (0, r.getFullPath)(this.opts.uriResolver, f.root.baseId), { es5: p, lines: w } = this.opts.code, { ownProperties: m } = this.opts, v = new e.CodeGen(this.scope, { es5: p, lines: w, ownProperties: m });
    let R;
    f.$async && (R = v.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const T = v.scopeName("validate");
    f.validateName = T;
    const C = {
      gen: v,
      allErrors: this.opts.allErrors,
      data: s.default.data,
      parentData: s.default.parentData,
      parentDataProperty: s.default.parentDataProperty,
      dataNames: [s.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: v.scopeValue("schema", this.opts.code.source === !0 ? { ref: f.schema, code: (0, e.stringify)(f.schema) } : { ref: f.schema }),
      validateName: T,
      ValidationError: R,
      schema: f.schema,
      schemaEnv: f,
      rootId: o,
      baseId: f.baseId || o,
      schemaPath: e.nil,
      errSchemaPath: f.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let V;
    try {
      this._compilations.add(f), (0, n.validateFunctionCode)(C), v.optimize(this.opts.code.optimize);
      const D = v.toString();
      V = `${v.scopeRefs(s.default.scope)}return ${D}`, this.opts.code.process && (V = this.opts.code.process(V, f));
      const z = new Function(`${s.default.self}`, `${s.default.scope}`, V)(this, this.scope.get());
      if (this.scope.value(T, { ref: z }), z.errors = null, z.schema = f.schema, z.schemaEnv = f, f.$async && (z.$async = !0), this.opts.code.source === !0 && (z.source = { validateName: T, validateCode: D, scopeValues: v._values }), this.opts.unevaluated) {
        const { props: M, items: F } = C;
        z.evaluated = {
          props: M instanceof e.Name ? void 0 : M,
          items: F instanceof e.Name ? void 0 : F,
          dynamicProps: M instanceof e.Name,
          dynamicItems: F instanceof e.Name
        }, z.source && (z.source.evaluated = (0, e.stringify)(z.evaluated));
      }
      return f.validate = z, f;
    } catch (D) {
      throw delete f.validate, delete f.validateName, V && this.logger.error("Error compiling schema, function code:", V), D;
    } finally {
      this._compilations.delete(f);
    }
  }
  Oe.compileSchema = a;
  function u(f, y, o) {
    var p;
    o = (0, r.resolveUrl)(this.opts.uriResolver, y, o);
    const w = f.refs[o];
    if (w)
      return w;
    let m = _.call(this, f, o);
    if (m === void 0) {
      const v = (p = f.localRefs) === null || p === void 0 ? void 0 : p[o], { schemaId: R } = this.opts;
      v && (m = new i({ schema: v, schemaId: R, root: f, baseId: y }));
    }
    if (m !== void 0)
      return f.refs[o] = d.call(this, m);
  }
  Oe.resolveRef = u;
  function d(f) {
    return (0, r.inlineRef)(f.schema, this.opts.inlineRefs) ? f.schema : f.validate ? f : a.call(this, f);
  }
  function c(f) {
    for (const y of this._compilations)
      if (g(y, f))
        return y;
  }
  Oe.getCompilingSchema = c;
  function g(f, y) {
    return f.schema === y.schema && f.root === y.root && f.baseId === y.baseId;
  }
  function _(f, y) {
    let o;
    for (; typeof (o = this.refs[y]) == "string"; )
      y = o;
    return o || this.schemas[y] || $.call(this, f, y);
  }
  function $(f, y) {
    const o = this.opts.uriResolver.parse(y), p = (0, r._getFullPath)(this.opts.uriResolver, o);
    let w = (0, r.getFullPath)(this.opts.uriResolver, f.baseId, void 0);
    if (Object.keys(f.schema).length > 0 && p === w)
      return E.call(this, o, f);
    const m = (0, r.normalizeId)(p), v = this.refs[m] || this.schemas[m];
    if (typeof v == "string") {
      const R = $.call(this, f, v);
      return typeof R?.schema != "object" ? void 0 : E.call(this, o, R);
    }
    if (typeof v?.schema == "object") {
      if (v.validate || a.call(this, v), m === (0, r.normalizeId)(y)) {
        const { schema: R } = v, { schemaId: T } = this.opts, C = R[T];
        return C && (w = (0, r.resolveUrl)(this.opts.uriResolver, w, C)), new i({ schema: R, schemaId: T, root: f, baseId: w });
      }
      return E.call(this, o, v);
    }
  }
  Oe.resolveSchema = $;
  const b = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function E(f, { baseId: y, schema: o, root: p }) {
    var w;
    if (((w = f.fragment) === null || w === void 0 ? void 0 : w[0]) !== "/")
      return;
    for (const R of f.fragment.slice(1).split("/")) {
      if (typeof o == "boolean")
        return;
      const T = o[(0, l.unescapeFragment)(R)];
      if (T === void 0)
        return;
      o = T;
      const C = typeof o == "object" && o[this.opts.schemaId];
      !b.has(R) && C && (y = (0, r.resolveUrl)(this.opts.uriResolver, y, C));
    }
    let m;
    if (typeof o != "boolean" && o.$ref && !(0, l.schemaHasRulesButRef)(o, this.RULES)) {
      const R = (0, r.resolveUrl)(this.opts.uriResolver, y, o.$ref);
      m = $.call(this, p, R);
    }
    const { schemaId: v } = this.opts;
    if (m = m || new i({ schema: o, schemaId: v, root: p, baseId: y }), m.schema !== m.root.schema)
      return m;
  }
  return Oe;
}
const qf = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Cf = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Df = "object", Mf = ["$data"], Lf = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, Vf = !1, Ff = {
  $id: qf,
  description: Cf,
  type: Df,
  required: Mf,
  properties: Lf,
  additionalProperties: Vf
};
var jr = {}, Ei;
function Uf() {
  if (Ei) return jr;
  Ei = 1, Object.defineProperty(jr, "__esModule", { value: !0 });
  const e = $u();
  return e.code = 'require("ajv/dist/runtime/uri").default', jr.default = e, jr;
}
var bi;
function zf() {
  return bi || (bi = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = In();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var s = ne();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    const r = la(), l = Tn(), n = Ru(), i = da(), a = ne(), u = On(), d = $n(), c = ce(), g = Ff, _ = Uf(), $ = (k, N) => new RegExp(k, N);
    $.code = "new RegExp";
    const b = ["removeAdditional", "useDefaults", "coerceTypes"], E = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), f = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, o = 200;
    function p(k) {
      var N, A, O, h, S, j, K, H, Q, Z, P, I, q, L, G, W, ae, pe, ue, le, oe, Re, he, et, tt;
      const Ie = k.strict, rt = (N = k.code) === null || N === void 0 ? void 0 : N.optimize, wt = rt === !0 || rt === void 0 ? 1 : rt || 0, Et = (O = (A = k.code) === null || A === void 0 ? void 0 : A.regExp) !== null && O !== void 0 ? O : $, Dn = (h = k.uriResolver) !== null && h !== void 0 ? h : _.default;
      return {
        strictSchema: (j = (S = k.strictSchema) !== null && S !== void 0 ? S : Ie) !== null && j !== void 0 ? j : !0,
        strictNumbers: (H = (K = k.strictNumbers) !== null && K !== void 0 ? K : Ie) !== null && H !== void 0 ? H : !0,
        strictTypes: (Z = (Q = k.strictTypes) !== null && Q !== void 0 ? Q : Ie) !== null && Z !== void 0 ? Z : "log",
        strictTuples: (I = (P = k.strictTuples) !== null && P !== void 0 ? P : Ie) !== null && I !== void 0 ? I : "log",
        strictRequired: (L = (q = k.strictRequired) !== null && q !== void 0 ? q : Ie) !== null && L !== void 0 ? L : !1,
        code: k.code ? { ...k.code, optimize: wt, regExp: Et } : { optimize: wt, regExp: Et },
        loopRequired: (G = k.loopRequired) !== null && G !== void 0 ? G : o,
        loopEnum: (W = k.loopEnum) !== null && W !== void 0 ? W : o,
        meta: (ae = k.meta) !== null && ae !== void 0 ? ae : !0,
        messages: (pe = k.messages) !== null && pe !== void 0 ? pe : !0,
        inlineRefs: (ue = k.inlineRefs) !== null && ue !== void 0 ? ue : !0,
        schemaId: (le = k.schemaId) !== null && le !== void 0 ? le : "$id",
        addUsedSchema: (oe = k.addUsedSchema) !== null && oe !== void 0 ? oe : !0,
        validateSchema: (Re = k.validateSchema) !== null && Re !== void 0 ? Re : !0,
        validateFormats: (he = k.validateFormats) !== null && he !== void 0 ? he : !0,
        unicodeRegExp: (et = k.unicodeRegExp) !== null && et !== void 0 ? et : !0,
        int32range: (tt = k.int32range) !== null && tt !== void 0 ? tt : !0,
        uriResolver: Dn
      };
    }
    class w {
      constructor(N = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), N = this.opts = { ...N, ...p(N) };
        const { es5: A, lines: O } = this.opts.code;
        this.scope = new a.ValueScope({ scope: {}, prefixes: E, es5: A, lines: O }), this.logger = U(N.logger);
        const h = N.validateFormats;
        N.validateFormats = !1, this.RULES = (0, n.getRules)(), m.call(this, f, N, "NOT SUPPORTED"), m.call(this, y, N, "DEPRECATED", "warn"), this._metaOpts = V.call(this), N.formats && T.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), N.keywords && C.call(this, N.keywords), typeof N.meta == "object" && this.addMetaSchema(N.meta), R.call(this), N.validateFormats = h;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: N, meta: A, schemaId: O } = this.opts;
        let h = g;
        O === "id" && (h = { ...g }, h.id = h.$id, delete h.$id), A && N && this.addMetaSchema(h, h[O], !1);
      }
      defaultMeta() {
        const { meta: N, schemaId: A } = this.opts;
        return this.opts.defaultMeta = typeof N == "object" ? N[A] || N : void 0;
      }
      validate(N, A) {
        let O;
        if (typeof N == "string") {
          if (O = this.getSchema(N), !O)
            throw new Error(`no schema with key or ref "${N}"`);
        } else
          O = this.compile(N);
        const h = O(A);
        return "$async" in O || (this.errors = O.errors), h;
      }
      compile(N, A) {
        const O = this._addSchema(N, A);
        return O.validate || this._compileSchemaEnv(O);
      }
      compileAsync(N, A) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: O } = this.opts;
        return h.call(this, N, A);
        async function h(Z, P) {
          await S.call(this, Z.$schema);
          const I = this._addSchema(Z, P);
          return I.validate || j.call(this, I);
        }
        async function S(Z) {
          Z && !this.getSchema(Z) && await h.call(this, { $ref: Z }, !0);
        }
        async function j(Z) {
          try {
            return this._compileSchemaEnv(Z);
          } catch (P) {
            if (!(P instanceof l.default))
              throw P;
            return K.call(this, P), await H.call(this, P.missingSchema), j.call(this, Z);
          }
        }
        function K({ missingSchema: Z, missingRef: P }) {
          if (this.refs[Z])
            throw new Error(`AnySchema ${Z} is loaded but ${P} cannot be resolved`);
        }
        async function H(Z) {
          const P = await Q.call(this, Z);
          this.refs[Z] || await S.call(this, P.$schema), this.refs[Z] || this.addSchema(P, Z, A);
        }
        async function Q(Z) {
          const P = this._loading[Z];
          if (P)
            return P;
          try {
            return await (this._loading[Z] = O(Z));
          } finally {
            delete this._loading[Z];
          }
        }
      }
      // Adds schema to the instance
      addSchema(N, A, O, h = this.opts.validateSchema) {
        if (Array.isArray(N)) {
          for (const j of N)
            this.addSchema(j, void 0, O, h);
          return this;
        }
        let S;
        if (typeof N == "object") {
          const { schemaId: j } = this.opts;
          if (S = N[j], S !== void 0 && typeof S != "string")
            throw new Error(`schema ${j} must be string`);
        }
        return A = (0, u.normalizeId)(A || S), this._checkUnique(A), this.schemas[A] = this._addSchema(N, O, A, h, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(N, A, O = this.opts.validateSchema) {
        return this.addSchema(N, A, !0, O), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(N, A) {
        if (typeof N == "boolean")
          return !0;
        let O;
        if (O = N.$schema, O !== void 0 && typeof O != "string")
          throw new Error("$schema must be a string");
        if (O = O || this.opts.defaultMeta || this.defaultMeta(), !O)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const h = this.validate(O, N);
        if (!h && A) {
          const S = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(S);
          else
            throw new Error(S);
        }
        return h;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(N) {
        let A;
        for (; typeof (A = v.call(this, N)) == "string"; )
          N = A;
        if (A === void 0) {
          const { schemaId: O } = this.opts, h = new i.SchemaEnv({ schema: {}, schemaId: O });
          if (A = i.resolveSchema.call(this, h, N), !A)
            return;
          this.refs[N] = A;
        }
        return A.validate || this._compileSchemaEnv(A);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(N) {
        if (N instanceof RegExp)
          return this._removeAllSchemas(this.schemas, N), this._removeAllSchemas(this.refs, N), this;
        switch (typeof N) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const A = v.call(this, N);
            return typeof A == "object" && this._cache.delete(A.schema), delete this.schemas[N], delete this.refs[N], this;
          }
          case "object": {
            const A = N;
            this._cache.delete(A);
            let O = N[this.opts.schemaId];
            return O && (O = (0, u.normalizeId)(O), delete this.schemas[O], delete this.refs[O]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(N) {
        for (const A of N)
          this.addKeyword(A);
        return this;
      }
      addKeyword(N, A) {
        let O;
        if (typeof N == "string")
          O = N, typeof A == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), A.keyword = O);
        else if (typeof N == "object" && A === void 0) {
          if (A = N, O = A.keyword, Array.isArray(O) && !O.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (M.call(this, O, A), !A)
          return (0, c.eachItem)(O, (S) => F.call(this, S)), this;
        B.call(this, A);
        const h = {
          ...A,
          type: (0, d.getJSONTypes)(A.type),
          schemaType: (0, d.getJSONTypes)(A.schemaType)
        };
        return (0, c.eachItem)(O, h.type.length === 0 ? (S) => F.call(this, S, h) : (S) => h.type.forEach((j) => F.call(this, S, h, j))), this;
      }
      getKeyword(N) {
        const A = this.RULES.all[N];
        return typeof A == "object" ? A.definition : !!A;
      }
      // Remove keyword
      removeKeyword(N) {
        const { RULES: A } = this;
        delete A.keywords[N], delete A.all[N];
        for (const O of A.rules) {
          const h = O.rules.findIndex((S) => S.keyword === N);
          h >= 0 && O.rules.splice(h, 1);
        }
        return this;
      }
      // Add format
      addFormat(N, A) {
        return typeof A == "string" && (A = new RegExp(A)), this.formats[N] = A, this;
      }
      errorsText(N = this.errors, { separator: A = ", ", dataVar: O = "data" } = {}) {
        return !N || N.length === 0 ? "No errors" : N.map((h) => `${O}${h.instancePath} ${h.message}`).reduce((h, S) => h + A + S);
      }
      $dataMetaSchema(N, A) {
        const O = this.RULES.all;
        N = JSON.parse(JSON.stringify(N));
        for (const h of A) {
          const S = h.split("/").slice(1);
          let j = N;
          for (const K of S)
            j = j[K];
          for (const K in O) {
            const H = O[K];
            if (typeof H != "object")
              continue;
            const { $data: Q } = H.definition, Z = j[K];
            Q && Z && (j[K] = Y(Z));
          }
        }
        return N;
      }
      _removeAllSchemas(N, A) {
        for (const O in N) {
          const h = N[O];
          (!A || A.test(O)) && (typeof h == "string" ? delete N[O] : h && !h.meta && (this._cache.delete(h.schema), delete N[O]));
        }
      }
      _addSchema(N, A, O, h = this.opts.validateSchema, S = this.opts.addUsedSchema) {
        let j;
        const { schemaId: K } = this.opts;
        if (typeof N == "object")
          j = N[K];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof N != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let H = this._cache.get(N);
        if (H !== void 0)
          return H;
        O = (0, u.normalizeId)(j || O);
        const Q = u.getSchemaRefs.call(this, N, O);
        return H = new i.SchemaEnv({ schema: N, schemaId: K, meta: A, baseId: O, localRefs: Q }), this._cache.set(H.schema, H), S && !O.startsWith("#") && (O && this._checkUnique(O), this.refs[O] = H), h && this.validateSchema(N, !0), H;
      }
      _checkUnique(N) {
        if (this.schemas[N] || this.refs[N])
          throw new Error(`schema with key or id "${N}" already exists`);
      }
      _compileSchemaEnv(N) {
        if (N.meta ? this._compileMetaSchema(N) : i.compileSchema.call(this, N), !N.validate)
          throw new Error("ajv implementation error");
        return N.validate;
      }
      _compileMetaSchema(N) {
        const A = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, N);
        } finally {
          this.opts = A;
        }
      }
    }
    w.ValidationError = r.default, w.MissingRefError = l.default, e.default = w;
    function m(k, N, A, O = "error") {
      for (const h in k) {
        const S = h;
        S in N && this.logger[O](`${A}: option ${h}. ${k[S]}`);
      }
    }
    function v(k) {
      return k = (0, u.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function R() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const N in k)
            this.addSchema(k[N], N);
    }
    function T() {
      for (const k in this.opts.formats) {
        const N = this.opts.formats[k];
        N && this.addFormat(k, N);
      }
    }
    function C(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const N in k) {
        const A = k[N];
        A.keyword || (A.keyword = N), this.addKeyword(A);
      }
    }
    function V() {
      const k = { ...this.opts };
      for (const N of b)
        delete k[N];
      return k;
    }
    const D = { log() {
    }, warn() {
    }, error() {
    } };
    function U(k) {
      if (k === !1)
        return D;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const z = /^[a-z_$][a-z0-9_$:-]*$/i;
    function M(k, N) {
      const { RULES: A } = this;
      if ((0, c.eachItem)(k, (O) => {
        if (A.keywords[O])
          throw new Error(`Keyword ${O} is already defined`);
        if (!z.test(O))
          throw new Error(`Keyword ${O} has invalid name`);
      }), !!N && N.$data && !("code" in N || "validate" in N))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function F(k, N, A) {
      var O;
      const h = N?.post;
      if (A && h)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: S } = this;
      let j = h ? S.post : S.rules.find(({ type: H }) => H === A);
      if (j || (j = { type: A, rules: [] }, S.rules.push(j)), S.keywords[k] = !0, !N)
        return;
      const K = {
        keyword: k,
        definition: {
          ...N,
          type: (0, d.getJSONTypes)(N.type),
          schemaType: (0, d.getJSONTypes)(N.schemaType)
        }
      };
      N.before ? X.call(this, j, K, N.before) : j.rules.push(K), S.all[k] = K, (O = N.implements) === null || O === void 0 || O.forEach((H) => this.addKeyword(H));
    }
    function X(k, N, A) {
      const O = k.rules.findIndex((h) => h.keyword === A);
      O >= 0 ? k.rules.splice(O, 0, N) : (k.rules.push(N), this.logger.warn(`rule ${A} is not defined`));
    }
    function B(k) {
      let { metaSchema: N } = k;
      N !== void 0 && (k.$data && this.opts.$data && (N = Y(N)), k.validateSchema = this.compile(N, !0));
    }
    const J = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(k) {
      return { anyOf: [k, J] };
    }
  })(Qn)), Qn;
}
var Ar = {}, kr = {}, qr = {}, Si;
function Kf() {
  if (Si) return qr;
  Si = 1, Object.defineProperty(qr, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return qr.default = e, qr;
}
var Xe = {}, Ri;
function Gf() {
  if (Ri) return Xe;
  Ri = 1, Object.defineProperty(Xe, "__esModule", { value: !0 }), Xe.callRef = Xe.getValidate = void 0;
  const e = Tn(), t = qe(), s = ne(), r = xe(), l = da(), n = ce(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(d) {
      const { gen: c, schema: g, it: _ } = d, { baseId: $, schemaEnv: b, validateName: E, opts: f, self: y } = _, { root: o } = b;
      if ((g === "#" || g === "#/") && $ === o.baseId)
        return w();
      const p = l.resolveRef.call(y, o, $, g);
      if (p === void 0)
        throw new e.default(_.opts.uriResolver, $, g);
      if (p instanceof l.SchemaEnv)
        return m(p);
      return v(p);
      function w() {
        if (b === o)
          return u(d, E, b, b.$async);
        const R = c.scopeValue("root", { ref: o });
        return u(d, (0, s._)`${R}.validate`, o, o.$async);
      }
      function m(R) {
        const T = a(d, R);
        u(d, T, R, R.$async);
      }
      function v(R) {
        const T = c.scopeValue("schema", f.code.source === !0 ? { ref: R, code: (0, s.stringify)(R) } : { ref: R }), C = c.name("valid"), V = d.subschema({
          schema: R,
          dataTypes: [],
          schemaPath: s.nil,
          topSchemaRef: T,
          errSchemaPath: g
        }, C);
        d.mergeEvaluated(V), d.ok(C);
      }
    }
  };
  function a(d, c) {
    const { gen: g } = d;
    return c.validate ? g.scopeValue("validate", { ref: c.validate }) : (0, s._)`${g.scopeValue("wrapper", { ref: c })}.validate`;
  }
  Xe.getValidate = a;
  function u(d, c, g, _) {
    const { gen: $, it: b } = d, { allErrors: E, schemaEnv: f, opts: y } = b, o = y.passContext ? r.default.this : s.nil;
    _ ? p() : w();
    function p() {
      if (!f.$async)
        throw new Error("async schema referenced by sync schema");
      const R = $.let("valid");
      $.try(() => {
        $.code((0, s._)`await ${(0, t.callValidateCode)(d, c, o)}`), v(c), E || $.assign(R, !0);
      }, (T) => {
        $.if((0, s._)`!(${T} instanceof ${b.ValidationError})`, () => $.throw(T)), m(T), E || $.assign(R, !1);
      }), d.ok(R);
    }
    function w() {
      d.result((0, t.callValidateCode)(d, c, o), () => v(c), () => m(c));
    }
    function m(R) {
      const T = (0, s._)`${R}.errors`;
      $.assign(r.default.vErrors, (0, s._)`${r.default.vErrors} === null ? ${T} : ${r.default.vErrors}.concat(${T})`), $.assign(r.default.errors, (0, s._)`${r.default.vErrors}.length`);
    }
    function v(R) {
      var T;
      if (!b.opts.unevaluated)
        return;
      const C = (T = g?.validate) === null || T === void 0 ? void 0 : T.evaluated;
      if (b.props !== !0)
        if (C && !C.dynamicProps)
          C.props !== void 0 && (b.props = n.mergeEvaluated.props($, C.props, b.props));
        else {
          const V = $.var("props", (0, s._)`${R}.evaluated.props`);
          b.props = n.mergeEvaluated.props($, V, b.props, s.Name);
        }
      if (b.items !== !0)
        if (C && !C.dynamicItems)
          C.items !== void 0 && (b.items = n.mergeEvaluated.items($, C.items, b.items));
        else {
          const V = $.var("items", (0, s._)`${R}.evaluated.items`);
          b.items = n.mergeEvaluated.items($, V, b.items, s.Name);
        }
    }
  }
  return Xe.callRef = u, Xe.default = i, Xe;
}
var Pi;
function Hf() {
  if (Pi) return kr;
  Pi = 1, Object.defineProperty(kr, "__esModule", { value: !0 });
  const e = Kf(), t = Gf(), s = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return kr.default = s, kr;
}
var Cr = {}, Dr = {}, Ni;
function Jf() {
  if (Ni) return Dr;
  Ni = 1, Object.defineProperty(Dr, "__esModule", { value: !0 });
  const e = ne(), t = e.operators, s = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: i }) => (0, e.str)`must be ${s[n].okStr} ${i}`,
    params: ({ keyword: n, schemaCode: i }) => (0, e._)`{comparison: ${s[n].okStr}, limit: ${i}}`
  }, l = {
    keyword: Object.keys(s),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: i, data: a, schemaCode: u } = n;
      n.fail$data((0, e._)`${a} ${s[i].fail} ${u} || isNaN(${a})`);
    }
  };
  return Dr.default = l, Dr;
}
var Mr = {}, Oi;
function Bf() {
  if (Oi) return Mr;
  Oi = 1, Object.defineProperty(Mr, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: l, data: n, schemaCode: i, it: a } = r, u = a.opts.multipleOfPrecision, d = l.let("res"), c = u ? (0, e._)`Math.abs(Math.round(${d}) - ${d}) > 1e-${u}` : (0, e._)`${d} !== parseInt(${d})`;
      r.fail$data((0, e._)`(${i} === 0 || (${d} = ${n}/${i}, ${c}))`);
    }
  };
  return Mr.default = s, Mr;
}
var Lr = {}, Vr = {}, Ii;
function Xf() {
  if (Ii) return Vr;
  Ii = 1, Object.defineProperty(Vr, "__esModule", { value: !0 });
  function e(t) {
    const s = t.length;
    let r = 0, l = 0, n;
    for (; l < s; )
      r++, n = t.charCodeAt(l++), n >= 55296 && n <= 56319 && l < s && (n = t.charCodeAt(l), (n & 64512) === 56320 && l++);
    return r;
  }
  return Vr.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Vr;
}
var Ti;
function Wf() {
  if (Ti) return Lr;
  Ti = 1, Object.defineProperty(Lr, "__esModule", { value: !0 });
  const e = ne(), t = ce(), s = Xf(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const a = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${a} than ${i} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: a, schemaCode: u, it: d } = n, c = i === "maxLength" ? e.operators.GT : e.operators.LT, g = d.opts.unicode === !1 ? (0, e._)`${a}.length` : (0, e._)`${(0, t.useFunc)(n.gen, s.default)}(${a})`;
      n.fail$data((0, e._)`${g} ${c} ${u}`);
    }
  };
  return Lr.default = l, Lr;
}
var Fr = {}, ji;
function Yf() {
  if (ji) return Fr;
  ji = 1, Object.defineProperty(Fr, "__esModule", { value: !0 });
  const e = qe(), t = ne(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, t.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, t._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: n, $data: i, schema: a, schemaCode: u, it: d } = l, c = d.opts.unicodeRegExp ? "u" : "", g = i ? (0, t._)`(new RegExp(${u}, ${c}))` : (0, e.usePattern)(l, a);
      l.fail$data((0, t._)`!${g}.test(${n})`);
    }
  };
  return Fr.default = r, Fr;
}
var Ur = {}, Ai;
function Zf() {
  if (Ai) return Ur;
  Ai = 1, Object.defineProperty(Ur, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, a = l === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${a} ${i}`);
    }
  };
  return Ur.default = s, Ur;
}
var zr = {}, ki;
function Qf() {
  if (ki) return zr;
  ki = 1, Object.defineProperty(zr, "__esModule", { value: !0 });
  const e = qe(), t = ne(), s = ce(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: i, schema: a, schemaCode: u, data: d, $data: c, it: g } = n, { opts: _ } = g;
      if (!c && a.length === 0)
        return;
      const $ = a.length >= _.loopRequired;
      if (g.allErrors ? b() : E(), _.strictRequired) {
        const o = n.parentSchema.properties, { definedProperties: p } = n.it;
        for (const w of a)
          if (o?.[w] === void 0 && !p.has(w)) {
            const m = g.schemaEnv.baseId + g.errSchemaPath, v = `required property "${w}" is not defined at "${m}" (strictRequired)`;
            (0, s.checkStrictMode)(g, v, g.opts.strictRequired);
          }
      }
      function b() {
        if ($ || c)
          n.block$data(t.nil, f);
        else
          for (const o of a)
            (0, e.checkReportMissingProp)(n, o);
      }
      function E() {
        const o = i.let("missing");
        if ($ || c) {
          const p = i.let("valid", !0);
          n.block$data(p, () => y(o, p)), n.ok(p);
        } else
          i.if((0, e.checkMissingProp)(n, a, o)), (0, e.reportMissingProp)(n, o), i.else();
      }
      function f() {
        i.forOf("prop", u, (o) => {
          n.setParams({ missingProperty: o }), i.if((0, e.noPropertyInData)(i, d, o, _.ownProperties), () => n.error());
        });
      }
      function y(o, p) {
        n.setParams({ missingProperty: o }), i.forOf(o, u, () => {
          i.assign(p, (0, e.propertyInData)(i, d, o, _.ownProperties)), i.if((0, t.not)(p), () => {
            n.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return zr.default = l, zr;
}
var Kr = {}, qi;
function xf() {
  if (qi) return Kr;
  qi = 1, Object.defineProperty(Kr, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, a = l === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${a} ${i}`);
    }
  };
  return Kr.default = s, Kr;
}
var Gr = {}, Hr = {}, Ci;
function fa() {
  if (Ci) return Hr;
  Ci = 1, Object.defineProperty(Hr, "__esModule", { value: !0 });
  const e = En();
  return e.code = 'require("ajv/dist/runtime/equal").default', Hr.default = e, Hr;
}
var Di;
function eh() {
  if (Di) return Gr;
  Di = 1, Object.defineProperty(Gr, "__esModule", { value: !0 });
  const e = $n(), t = ne(), s = ce(), r = fa(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: a } }) => (0, t.str)`must NOT have duplicate items (items ## ${a} and ${i} are identical)`,
      params: ({ params: { i, j: a } }) => (0, t._)`{i: ${i}, j: ${a}}`
    },
    code(i) {
      const { gen: a, data: u, $data: d, schema: c, parentSchema: g, schemaCode: _, it: $ } = i;
      if (!d && !c)
        return;
      const b = a.let("valid"), E = g.items ? (0, e.getSchemaTypes)(g.items) : [];
      i.block$data(b, f, (0, t._)`${_} === false`), i.ok(b);
      function f() {
        const w = a.let("i", (0, t._)`${u}.length`), m = a.let("j");
        i.setParams({ i: w, j: m }), a.assign(b, !0), a.if((0, t._)`${w} > 1`, () => (y() ? o : p)(w, m));
      }
      function y() {
        return E.length > 0 && !E.some((w) => w === "object" || w === "array");
      }
      function o(w, m) {
        const v = a.name("item"), R = (0, e.checkDataTypes)(E, v, $.opts.strictNumbers, e.DataType.Wrong), T = a.const("indices", (0, t._)`{}`);
        a.for((0, t._)`;${w}--;`, () => {
          a.let(v, (0, t._)`${u}[${w}]`), a.if(R, (0, t._)`continue`), E.length > 1 && a.if((0, t._)`typeof ${v} == "string"`, (0, t._)`${v} += "_"`), a.if((0, t._)`typeof ${T}[${v}] == "number"`, () => {
            a.assign(m, (0, t._)`${T}[${v}]`), i.error(), a.assign(b, !1).break();
          }).code((0, t._)`${T}[${v}] = ${w}`);
        });
      }
      function p(w, m) {
        const v = (0, s.useFunc)(a, r.default), R = a.name("outer");
        a.label(R).for((0, t._)`;${w}--;`, () => a.for((0, t._)`${m} = ${w}; ${m}--;`, () => a.if((0, t._)`${v}(${u}[${w}], ${u}[${m}])`, () => {
          i.error(), a.assign(b, !1).break(R);
        })));
      }
    }
  };
  return Gr.default = n, Gr;
}
var Jr = {}, Mi;
function th() {
  if (Mi) return Jr;
  Mi = 1, Object.defineProperty(Jr, "__esModule", { value: !0 });
  const e = ne(), t = ce(), s = fa(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: u, schemaCode: d, schema: c } = n;
      u || c && typeof c == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(i, s.default)}(${a}, ${d})`) : n.fail((0, e._)`${c} !== ${a}`);
    }
  };
  return Jr.default = l, Jr;
}
var Br = {}, Li;
function rh() {
  if (Li) return Br;
  Li = 1, Object.defineProperty(Br, "__esModule", { value: !0 });
  const e = ne(), t = ce(), s = fa(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: u, schema: d, schemaCode: c, it: g } = n;
      if (!u && d.length === 0)
        throw new Error("enum must have non-empty array");
      const _ = d.length >= g.opts.loopEnum;
      let $;
      const b = () => $ ?? ($ = (0, t.useFunc)(i, s.default));
      let E;
      if (_ || u)
        E = i.let("valid"), n.block$data(E, f);
      else {
        if (!Array.isArray(d))
          throw new Error("ajv implementation error");
        const o = i.const("vSchema", c);
        E = (0, e.or)(...d.map((p, w) => y(o, w)));
      }
      n.pass(E);
      function f() {
        i.assign(E, !1), i.forOf("v", c, (o) => i.if((0, e._)`${b()}(${a}, ${o})`, () => i.assign(E, !0).break()));
      }
      function y(o, p) {
        const w = d[p];
        return typeof w == "object" && w !== null ? (0, e._)`${b()}(${a}, ${o}[${p}])` : (0, e._)`${a} === ${w}`;
      }
    }
  };
  return Br.default = l, Br;
}
var Vi;
function nh() {
  if (Vi) return Cr;
  Vi = 1, Object.defineProperty(Cr, "__esModule", { value: !0 });
  const e = Jf(), t = Bf(), s = Wf(), r = Yf(), l = Zf(), n = Qf(), i = xf(), a = eh(), u = th(), d = rh(), c = [
    // number
    e.default,
    t.default,
    // string
    s.default,
    r.default,
    // object
    l.default,
    n.default,
    // array
    i.default,
    a.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    d.default
  ];
  return Cr.default = c, Cr;
}
var Xr = {}, pt = {}, Fi;
function Nu() {
  if (Fi) return pt;
  Fi = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.validateAdditionalItems = void 0;
  const e = ne(), t = ce(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: i, it: a } = n, { items: u } = i;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(a, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(n, u);
    }
  };
  function l(n, i) {
    const { gen: a, schema: u, data: d, keyword: c, it: g } = n;
    g.items = !0;
    const _ = a.const("len", (0, e._)`${d}.length`);
    if (u === !1)
      n.setParams({ len: i.length }), n.pass((0, e._)`${_} <= ${i.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)(g, u)) {
      const b = a.var("valid", (0, e._)`${_} <= ${i.length}`);
      a.if((0, e.not)(b), () => $(b)), n.ok(b);
    }
    function $(b) {
      a.forRange("i", i.length, _, (E) => {
        n.subschema({ keyword: c, dataProp: E, dataPropType: t.Type.Num }, b), g.allErrors || a.if((0, e.not)(b), () => a.break());
      });
    }
  }
  return pt.validateAdditionalItems = l, pt.default = r, pt;
}
var Wr = {}, yt = {}, Ui;
function Ou() {
  if (Ui) return yt;
  Ui = 1, Object.defineProperty(yt, "__esModule", { value: !0 }), yt.validateTuple = void 0;
  const e = ne(), t = ce(), s = qe(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: i, it: a } = n;
      if (Array.isArray(i))
        return l(n, "additionalItems", i);
      a.items = !0, !(0, t.alwaysValidSchema)(a, i) && n.ok((0, s.validateArray)(n));
    }
  };
  function l(n, i, a = n.schema) {
    const { gen: u, parentSchema: d, data: c, keyword: g, it: _ } = n;
    E(d), _.opts.unevaluated && a.length && _.items !== !0 && (_.items = t.mergeEvaluated.items(u, a.length, _.items));
    const $ = u.name("valid"), b = u.const("len", (0, e._)`${c}.length`);
    a.forEach((f, y) => {
      (0, t.alwaysValidSchema)(_, f) || (u.if((0, e._)`${b} > ${y}`, () => n.subschema({
        keyword: g,
        schemaProp: y,
        dataProp: y
      }, $)), n.ok($));
    });
    function E(f) {
      const { opts: y, errSchemaPath: o } = _, p = a.length, w = p === f.minItems && (p === f.maxItems || f[i] === !1);
      if (y.strictTuples && !w) {
        const m = `"${g}" is ${p}-tuple, but minItems or maxItems/${i} are not specified or different at path "${o}"`;
        (0, t.checkStrictMode)(_, m, y.strictTuples);
      }
    }
  }
  return yt.validateTuple = l, yt.default = r, yt;
}
var zi;
function sh() {
  if (zi) return Wr;
  zi = 1, Object.defineProperty(Wr, "__esModule", { value: !0 });
  const e = Ou(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (s) => (0, e.validateTuple)(s, "items")
  };
  return Wr.default = t, Wr;
}
var Yr = {}, Ki;
function ah() {
  if (Ki) return Yr;
  Ki = 1, Object.defineProperty(Yr, "__esModule", { value: !0 });
  const e = ne(), t = ce(), s = qe(), r = Nu(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: a, parentSchema: u, it: d } = i, { prefixItems: c } = u;
      d.items = !0, !(0, t.alwaysValidSchema)(d, a) && (c ? (0, r.validateAdditionalItems)(i, c) : i.ok((0, s.validateArray)(i)));
    }
  };
  return Yr.default = n, Yr;
}
var Zr = {}, Gi;
function oh() {
  if (Gi) return Zr;
  Gi = 1, Object.defineProperty(Zr, "__esModule", { value: !0 });
  const e = ne(), t = ce(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${l} valid item(s)` : (0, e.str)`must contain at least ${l} and no more than ${n} valid item(s)`,
      params: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${l}}` : (0, e._)`{minContains: ${l}, maxContains: ${n}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: a, data: u, it: d } = l;
      let c, g;
      const { minContains: _, maxContains: $ } = a;
      d.opts.next ? (c = _ === void 0 ? 1 : _, g = $) : c = 1;
      const b = n.const("len", (0, e._)`${u}.length`);
      if (l.setParams({ min: c, max: g }), g === void 0 && c === 0) {
        (0, t.checkStrictMode)(d, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (g !== void 0 && c > g) {
        (0, t.checkStrictMode)(d, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(d, i)) {
        let p = (0, e._)`${b} >= ${c}`;
        g !== void 0 && (p = (0, e._)`${p} && ${b} <= ${g}`), l.pass(p);
        return;
      }
      d.items = !0;
      const E = n.name("valid");
      g === void 0 && c === 1 ? y(E, () => n.if(E, () => n.break())) : c === 0 ? (n.let(E, !0), g !== void 0 && n.if((0, e._)`${u}.length > 0`, f)) : (n.let(E, !1), f()), l.result(E, () => l.reset());
      function f() {
        const p = n.name("_valid"), w = n.let("count", 0);
        y(p, () => n.if(p, () => o(w)));
      }
      function y(p, w) {
        n.forRange("i", 0, b, (m) => {
          l.subschema({
            keyword: "contains",
            dataProp: m,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, p), w();
        });
      }
      function o(p) {
        n.code((0, e._)`${p}++`), g === void 0 ? n.if((0, e._)`${p} >= ${c}`, () => n.assign(E, !0).break()) : (n.if((0, e._)`${p} > ${g}`, () => n.assign(E, !1).break()), c === 1 ? n.assign(E, !0) : n.if((0, e._)`${p} >= ${c}`, () => n.assign(E, !0)));
      }
    }
  };
  return Zr.default = r, Zr;
}
var ss = {}, Hi;
function ih() {
  return Hi || (Hi = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = ne(), s = ce(), r = qe();
    e.error = {
      message: ({ params: { property: u, depsCount: d, deps: c } }) => {
        const g = d === 1 ? "property" : "properties";
        return (0, t.str)`must have ${g} ${c} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: d, deps: c, missingProperty: g } }) => (0, t._)`{property: ${u},
    missingProperty: ${g},
    depsCount: ${d},
    deps: ${c}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [d, c] = n(u);
        i(u, d), a(u, c);
      }
    };
    function n({ schema: u }) {
      const d = {}, c = {};
      for (const g in u) {
        if (g === "__proto__")
          continue;
        const _ = Array.isArray(u[g]) ? d : c;
        _[g] = u[g];
      }
      return [d, c];
    }
    function i(u, d = u.schema) {
      const { gen: c, data: g, it: _ } = u;
      if (Object.keys(d).length === 0)
        return;
      const $ = c.let("missing");
      for (const b in d) {
        const E = d[b];
        if (E.length === 0)
          continue;
        const f = (0, r.propertyInData)(c, g, b, _.opts.ownProperties);
        u.setParams({
          property: b,
          depsCount: E.length,
          deps: E.join(", ")
        }), _.allErrors ? c.if(f, () => {
          for (const y of E)
            (0, r.checkReportMissingProp)(u, y);
        }) : (c.if((0, t._)`${f} && (${(0, r.checkMissingProp)(u, E, $)})`), (0, r.reportMissingProp)(u, $), c.else());
      }
    }
    e.validatePropertyDeps = i;
    function a(u, d = u.schema) {
      const { gen: c, data: g, keyword: _, it: $ } = u, b = c.name("valid");
      for (const E in d)
        (0, s.alwaysValidSchema)($, d[E]) || (c.if(
          (0, r.propertyInData)(c, g, E, $.opts.ownProperties),
          () => {
            const f = u.subschema({ keyword: _, schemaProp: E }, b);
            u.mergeValidEvaluated(f, b);
          },
          () => c.var(b, !0)
          // TODO var
        ), u.ok(b));
    }
    e.validateSchemaDeps = a, e.default = l;
  })(ss)), ss;
}
var Qr = {}, Ji;
function ch() {
  if (Ji) return Qr;
  Ji = 1, Object.defineProperty(Qr, "__esModule", { value: !0 });
  const e = ne(), t = ce(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, e._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: n, schema: i, data: a, it: u } = l;
      if ((0, t.alwaysValidSchema)(u, i))
        return;
      const d = n.name("valid");
      n.forIn("key", a, (c) => {
        l.setParams({ propertyName: c }), l.subschema({
          keyword: "propertyNames",
          data: c,
          dataTypes: ["string"],
          propertyName: c,
          compositeRule: !0
        }, d), n.if((0, e.not)(d), () => {
          l.error(!0), u.allErrors || n.break();
        });
      }), l.ok(d);
    }
  };
  return Qr.default = r, Qr;
}
var xr = {}, Bi;
function Iu() {
  if (Bi) return xr;
  Bi = 1, Object.defineProperty(xr, "__esModule", { value: !0 });
  const e = qe(), t = ne(), s = xe(), r = ce(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: i }) => (0, t._)`{additionalProperty: ${i.additionalProperty}}`
    },
    code(i) {
      const { gen: a, schema: u, parentSchema: d, data: c, errsCount: g, it: _ } = i;
      if (!g)
        throw new Error("ajv implementation error");
      const { allErrors: $, opts: b } = _;
      if (_.props = !0, b.removeAdditional !== "all" && (0, r.alwaysValidSchema)(_, u))
        return;
      const E = (0, e.allSchemaProperties)(d.properties), f = (0, e.allSchemaProperties)(d.patternProperties);
      y(), i.ok((0, t._)`${g} === ${s.default.errors}`);
      function y() {
        a.forIn("key", c, (v) => {
          !E.length && !f.length ? w(v) : a.if(o(v), () => w(v));
        });
      }
      function o(v) {
        let R;
        if (E.length > 8) {
          const T = (0, r.schemaRefOrVal)(_, d.properties, "properties");
          R = (0, e.isOwnProperty)(a, T, v);
        } else E.length ? R = (0, t.or)(...E.map((T) => (0, t._)`${v} === ${T}`)) : R = t.nil;
        return f.length && (R = (0, t.or)(R, ...f.map((T) => (0, t._)`${(0, e.usePattern)(i, T)}.test(${v})`))), (0, t.not)(R);
      }
      function p(v) {
        a.code((0, t._)`delete ${c}[${v}]`);
      }
      function w(v) {
        if (b.removeAdditional === "all" || b.removeAdditional && u === !1) {
          p(v);
          return;
        }
        if (u === !1) {
          i.setParams({ additionalProperty: v }), i.error(), $ || a.break();
          return;
        }
        if (typeof u == "object" && !(0, r.alwaysValidSchema)(_, u)) {
          const R = a.name("valid");
          b.removeAdditional === "failing" ? (m(v, R, !1), a.if((0, t.not)(R), () => {
            i.reset(), p(v);
          })) : (m(v, R), $ || a.if((0, t.not)(R), () => a.break()));
        }
      }
      function m(v, R, T) {
        const C = {
          keyword: "additionalProperties",
          dataProp: v,
          dataPropType: r.Type.Str
        };
        T === !1 && Object.assign(C, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(C, R);
      }
    }
  };
  return xr.default = n, xr;
}
var en = {}, Xi;
function uh() {
  if (Xi) return en;
  Xi = 1, Object.defineProperty(en, "__esModule", { value: !0 });
  const e = In(), t = qe(), s = ce(), r = Iu(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, parentSchema: u, data: d, it: c } = n;
      c.opts.removeAdditional === "all" && u.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(c, r.default, "additionalProperties"));
      const g = (0, t.allSchemaProperties)(a);
      for (const f of g)
        c.definedProperties.add(f);
      c.opts.unevaluated && g.length && c.props !== !0 && (c.props = s.mergeEvaluated.props(i, (0, s.toHash)(g), c.props));
      const _ = g.filter((f) => !(0, s.alwaysValidSchema)(c, a[f]));
      if (_.length === 0)
        return;
      const $ = i.name("valid");
      for (const f of _)
        b(f) ? E(f) : (i.if((0, t.propertyInData)(i, d, f, c.opts.ownProperties)), E(f), c.allErrors || i.else().var($, !0), i.endIf()), n.it.definedProperties.add(f), n.ok($);
      function b(f) {
        return c.opts.useDefaults && !c.compositeRule && a[f].default !== void 0;
      }
      function E(f) {
        n.subschema({
          keyword: "properties",
          schemaProp: f,
          dataProp: f
        }, $);
      }
    }
  };
  return en.default = l, en;
}
var tn = {}, Wi;
function lh() {
  if (Wi) return tn;
  Wi = 1, Object.defineProperty(tn, "__esModule", { value: !0 });
  const e = qe(), t = ne(), s = ce(), r = ce(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, data: u, parentSchema: d, it: c } = n, { opts: g } = c, _ = (0, e.allSchemaProperties)(a), $ = _.filter((w) => (0, s.alwaysValidSchema)(c, a[w]));
      if (_.length === 0 || $.length === _.length && (!c.opts.unevaluated || c.props === !0))
        return;
      const b = g.strictSchema && !g.allowMatchingProperties && d.properties, E = i.name("valid");
      c.props !== !0 && !(c.props instanceof t.Name) && (c.props = (0, r.evaluatedPropsToName)(i, c.props));
      const { props: f } = c;
      y();
      function y() {
        for (const w of _)
          b && o(w), c.allErrors ? p(w) : (i.var(E, !0), p(w), i.if(E));
      }
      function o(w) {
        for (const m in b)
          new RegExp(w).test(m) && (0, s.checkStrictMode)(c, `property ${m} matches pattern ${w} (use allowMatchingProperties)`);
      }
      function p(w) {
        i.forIn("key", u, (m) => {
          i.if((0, t._)`${(0, e.usePattern)(n, w)}.test(${m})`, () => {
            const v = $.includes(w);
            v || n.subschema({
              keyword: "patternProperties",
              schemaProp: w,
              dataProp: m,
              dataPropType: r.Type.Str
            }, E), c.opts.unevaluated && f !== !0 ? i.assign((0, t._)`${f}[${m}]`, !0) : !v && !c.allErrors && i.if((0, t.not)(E), () => i.break());
          });
        });
      }
    }
  };
  return tn.default = l, tn;
}
var rn = {}, Yi;
function dh() {
  if (Yi) return rn;
  Yi = 1, Object.defineProperty(rn, "__esModule", { value: !0 });
  const e = ce(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if ((0, e.alwaysValidSchema)(n, l)) {
        s.fail();
        return;
      }
      const i = r.name("valid");
      s.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), s.failResult(i, () => s.reset(), () => s.error());
    },
    error: { message: "must NOT be valid" }
  };
  return rn.default = t, rn;
}
var nn = {}, Zi;
function fh() {
  if (Zi) return nn;
  Zi = 1, Object.defineProperty(nn, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: qe().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return nn.default = t, nn;
}
var sn = {}, Qi;
function hh() {
  if (Qi) return sn;
  Qi = 1, Object.defineProperty(sn, "__esModule", { value: !0 });
  const e = ne(), t = ce(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, e._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: a, it: u } = l;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && a.discriminator)
        return;
      const d = i, c = n.let("valid", !1), g = n.let("passing", null), _ = n.name("_valid");
      l.setParams({ passing: g }), n.block($), l.result(c, () => l.reset(), () => l.error(!0));
      function $() {
        d.forEach((b, E) => {
          let f;
          (0, t.alwaysValidSchema)(u, b) ? n.var(_, !0) : f = l.subschema({
            keyword: "oneOf",
            schemaProp: E,
            compositeRule: !0
          }, _), E > 0 && n.if((0, e._)`${_} && ${c}`).assign(c, !1).assign(g, (0, e._)`[${g}, ${E}]`).else(), n.if(_, () => {
            n.assign(c, !0), n.assign(g, E), f && l.mergeEvaluated(f, e.Name);
          });
        });
      }
    }
  };
  return sn.default = r, sn;
}
var an = {}, xi;
function mh() {
  if (xi) return an;
  xi = 1, Object.defineProperty(an, "__esModule", { value: !0 });
  const e = ce(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const i = r.name("valid");
      l.forEach((a, u) => {
        if ((0, e.alwaysValidSchema)(n, a))
          return;
        const d = s.subschema({ keyword: "allOf", schemaProp: u }, i);
        s.ok(i), s.mergeEvaluated(d);
      });
    }
  };
  return an.default = t, an;
}
var on = {}, ec;
function ph() {
  if (ec) return on;
  ec = 1, Object.defineProperty(on, "__esModule", { value: !0 });
  const e = ne(), t = ce(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: i, parentSchema: a, it: u } = n;
      a.then === void 0 && a.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const d = l(u, "then"), c = l(u, "else");
      if (!d && !c)
        return;
      const g = i.let("valid", !0), _ = i.name("_valid");
      if ($(), n.reset(), d && c) {
        const E = i.let("ifClause");
        n.setParams({ ifClause: E }), i.if(_, b("then", E), b("else", E));
      } else d ? i.if(_, b("then")) : i.if((0, e.not)(_), b("else"));
      n.pass(g, () => n.error(!0));
      function $() {
        const E = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, _);
        n.mergeEvaluated(E);
      }
      function b(E, f) {
        return () => {
          const y = n.subschema({ keyword: E }, _);
          i.assign(g, _), n.mergeValidEvaluated(y, g), f ? i.assign(f, (0, e._)`${E}`) : n.setParams({ ifClause: E });
        };
      }
    }
  };
  function l(n, i) {
    const a = n.schema[i];
    return a !== void 0 && !(0, t.alwaysValidSchema)(n, a);
  }
  return on.default = r, on;
}
var cn = {}, tc;
function yh() {
  if (tc) return cn;
  tc = 1, Object.defineProperty(cn, "__esModule", { value: !0 });
  const e = ce(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: s, parentSchema: r, it: l }) {
      r.if === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "if" is ignored`);
    }
  };
  return cn.default = t, cn;
}
var rc;
function vh() {
  if (rc) return Xr;
  rc = 1, Object.defineProperty(Xr, "__esModule", { value: !0 });
  const e = Nu(), t = sh(), s = Ou(), r = ah(), l = oh(), n = ih(), i = ch(), a = Iu(), u = uh(), d = lh(), c = dh(), g = fh(), _ = hh(), $ = mh(), b = ph(), E = yh();
  function f(y = !1) {
    const o = [
      // any
      c.default,
      g.default,
      _.default,
      $.default,
      b.default,
      E.default,
      // object
      i.default,
      a.default,
      n.default,
      u.default,
      d.default
    ];
    return y ? o.push(t.default, r.default) : o.push(e.default, s.default), o.push(l.default), o;
  }
  return Xr.default = f, Xr;
}
var un = {}, ln = {}, nc;
function _h() {
  if (nc) return ln;
  nc = 1, Object.defineProperty(ln, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, l) {
      const { gen: n, data: i, $data: a, schema: u, schemaCode: d, it: c } = r, { opts: g, errSchemaPath: _, schemaEnv: $, self: b } = c;
      if (!g.validateFormats)
        return;
      a ? E() : f();
      function E() {
        const y = n.scopeValue("formats", {
          ref: b.formats,
          code: g.code.formats
        }), o = n.const("fDef", (0, e._)`${y}[${d}]`), p = n.let("fType"), w = n.let("format");
        n.if((0, e._)`typeof ${o} == "object" && !(${o} instanceof RegExp)`, () => n.assign(p, (0, e._)`${o}.type || "string"`).assign(w, (0, e._)`${o}.validate`), () => n.assign(p, (0, e._)`"string"`).assign(w, o)), r.fail$data((0, e.or)(m(), v()));
        function m() {
          return g.strictSchema === !1 ? e.nil : (0, e._)`${d} && !${w}`;
        }
        function v() {
          const R = $.$async ? (0, e._)`(${o}.async ? await ${w}(${i}) : ${w}(${i}))` : (0, e._)`${w}(${i})`, T = (0, e._)`(typeof ${w} == "function" ? ${R} : ${w}.test(${i}))`;
          return (0, e._)`${w} && ${w} !== true && ${p} === ${l} && !${T}`;
        }
      }
      function f() {
        const y = b.formats[u];
        if (!y) {
          m();
          return;
        }
        if (y === !0)
          return;
        const [o, p, w] = v(y);
        o === l && r.pass(R());
        function m() {
          if (g.strictSchema === !1) {
            b.logger.warn(T());
            return;
          }
          throw new Error(T());
          function T() {
            return `unknown format "${u}" ignored in schema at path "${_}"`;
          }
        }
        function v(T) {
          const C = T instanceof RegExp ? (0, e.regexpCode)(T) : g.code.formats ? (0, e._)`${g.code.formats}${(0, e.getProperty)(u)}` : void 0, V = n.scopeValue("formats", { key: u, ref: T, code: C });
          return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, e._)`${V}.validate`] : ["string", T, V];
        }
        function R() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!$.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${w}(${i})`;
          }
          return typeof p == "function" ? (0, e._)`${w}(${i})` : (0, e._)`${w}.test(${i})`;
        }
      }
    }
  };
  return ln.default = s, ln;
}
var sc;
function $h() {
  if (sc) return un;
  sc = 1, Object.defineProperty(un, "__esModule", { value: !0 });
  const t = [_h().default];
  return un.default = t, un;
}
var ut = {}, ac;
function gh() {
  return ac || (ac = 1, Object.defineProperty(ut, "__esModule", { value: !0 }), ut.contentVocabulary = ut.metadataVocabulary = void 0, ut.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], ut.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), ut;
}
var oc;
function wh() {
  if (oc) return Ar;
  oc = 1, Object.defineProperty(Ar, "__esModule", { value: !0 });
  const e = Hf(), t = nh(), s = vh(), r = $h(), l = gh(), n = [
    e.default,
    t.default,
    (0, s.default)(),
    r.default,
    l.metadataVocabulary,
    l.contentVocabulary
  ];
  return Ar.default = n, Ar;
}
var dn = {}, Nt = {}, ic;
function Eh() {
  if (ic) return Nt;
  ic = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (Nt.DiscrError = e = {})), Nt;
}
var cc;
function bh() {
  if (cc) return dn;
  cc = 1, Object.defineProperty(dn, "__esModule", { value: !0 });
  const e = ne(), t = Eh(), s = da(), r = Tn(), l = ce(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: a, tagName: u } }) => a === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: a, tag: u, tagName: d } }) => (0, e._)`{error: ${a}, tag: ${d}, tagValue: ${u}}`
    },
    code(a) {
      const { gen: u, data: d, schema: c, parentSchema: g, it: _ } = a, { oneOf: $ } = g;
      if (!_.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const b = c.propertyName;
      if (typeof b != "string")
        throw new Error("discriminator: requires propertyName");
      if (c.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!$)
        throw new Error("discriminator: requires oneOf keyword");
      const E = u.let("valid", !1), f = u.const("tag", (0, e._)`${d}${(0, e.getProperty)(b)}`);
      u.if((0, e._)`typeof ${f} == "string"`, () => y(), () => a.error(!1, { discrError: t.DiscrError.Tag, tag: f, tagName: b })), a.ok(E);
      function y() {
        const w = p();
        u.if(!1);
        for (const m in w)
          u.elseIf((0, e._)`${f} === ${m}`), u.assign(E, o(w[m]));
        u.else(), a.error(!1, { discrError: t.DiscrError.Mapping, tag: f, tagName: b }), u.endIf();
      }
      function o(w) {
        const m = u.name("valid"), v = a.subschema({ keyword: "oneOf", schemaProp: w }, m);
        return a.mergeEvaluated(v, e.Name), m;
      }
      function p() {
        var w;
        const m = {}, v = T(g);
        let R = !0;
        for (let D = 0; D < $.length; D++) {
          let U = $[D];
          if (U?.$ref && !(0, l.schemaHasRulesButRef)(U, _.self.RULES)) {
            const M = U.$ref;
            if (U = s.resolveRef.call(_.self, _.schemaEnv.root, _.baseId, M), U instanceof s.SchemaEnv && (U = U.schema), U === void 0)
              throw new r.default(_.opts.uriResolver, _.baseId, M);
          }
          const z = (w = U?.properties) === null || w === void 0 ? void 0 : w[b];
          if (typeof z != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${b}"`);
          R = R && (v || T(U)), C(z, D);
        }
        if (!R)
          throw new Error(`discriminator: "${b}" must be required`);
        return m;
        function T({ required: D }) {
          return Array.isArray(D) && D.includes(b);
        }
        function C(D, U) {
          if (D.const)
            V(D.const, U);
          else if (D.enum)
            for (const z of D.enum)
              V(z, U);
          else
            throw new Error(`discriminator: "properties/${b}" must have "const" or "enum"`);
        }
        function V(D, U) {
          if (typeof D != "string" || D in m)
            throw new Error(`discriminator: "${b}" values must be unique strings`);
          m[D] = U;
        }
      }
    }
  };
  return dn.default = i, dn;
}
const Sh = "http://json-schema.org/draft-07/schema#", Rh = "http://json-schema.org/draft-07/schema#", Ph = "Core schema meta-schema", Nh = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Oh = ["object", "boolean"], Ih = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, Th = {
  $schema: Sh,
  $id: Rh,
  title: Ph,
  definitions: Nh,
  type: Oh,
  properties: Ih,
  default: !0
};
var uc;
function jh() {
  return uc || (uc = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const s = zf(), r = wh(), l = bh(), n = Th, i = ["/properties"], a = "http://json-schema.org/draft-07/schema";
    class u extends s.default {
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((b) => this.addVocabulary(b)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const b = this.opts.$data ? this.$dataMetaSchema(n, i) : n;
        this.addMetaSchema(b, a, !1), this.refs["http://json-schema.org/schema"] = a;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(a) ? a : void 0);
      }
    }
    t.Ajv = u, e.exports = t = u, e.exports.Ajv = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
    var d = In();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return d.KeywordCxt;
    } });
    var c = ne();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return c._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return c.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return c.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return c.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return c.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return c.CodeGen;
    } });
    var g = la();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return g.default;
    } });
    var _ = Tn();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return _.default;
    } });
  })(Nr, Nr.exports)), Nr.exports;
}
var lc;
function Ah() {
  return lc || (lc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = jh(), s = ne(), r = s.operators, l = {
      formatMaximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
      formatMinimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
      formatExclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
    }, n = {
      message: ({ keyword: a, schemaCode: u }) => (0, s.str)`should be ${l[a].okStr} ${u}`,
      params: ({ keyword: a, schemaCode: u }) => (0, s._)`{comparison: ${l[a].okStr}, limit: ${u}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(l),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: n,
      code(a) {
        const { gen: u, data: d, schemaCode: c, keyword: g, it: _ } = a, { opts: $, self: b } = _;
        if (!$.validateFormats)
          return;
        const E = new t.KeywordCxt(_, b.RULES.all.format.definition, "format");
        E.$data ? f() : y();
        function f() {
          const p = u.scopeValue("formats", {
            ref: b.formats,
            code: $.code.formats
          }), w = u.const("fmt", (0, s._)`${p}[${E.schemaCode}]`);
          a.fail$data((0, s.or)((0, s._)`typeof ${w} != "object"`, (0, s._)`${w} instanceof RegExp`, (0, s._)`typeof ${w}.compare != "function"`, o(w)));
        }
        function y() {
          const p = E.schema, w = b.formats[p];
          if (!w || w === !0)
            return;
          if (typeof w != "object" || w instanceof RegExp || typeof w.compare != "function")
            throw new Error(`"${g}": format "${p}" does not define "compare" function`);
          const m = u.scopeValue("formats", {
            key: p,
            ref: w,
            code: $.code.formats ? (0, s._)`${$.code.formats}${(0, s.getProperty)(p)}` : void 0
          });
          a.fail$data(o(m));
        }
        function o(p) {
          return (0, s._)`${p}.compare(${d}, ${c}) ${l[g].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const i = (a) => (a.addKeyword(e.formatLimitDefinition), a);
    e.default = i;
  })(Zn)), Zn;
}
var dc;
function kh() {
  return dc || (dc = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const s = Of(), r = Ah(), l = ne(), n = new l.Name("fullFormats"), i = new l.Name("fastFormats"), a = (d, c = { keywords: !0 }) => {
      if (Array.isArray(c))
        return u(d, c, s.fullFormats, n), d;
      const [g, _] = c.mode === "fast" ? [s.fastFormats, i] : [s.fullFormats, n], $ = c.formats || s.formatNames;
      return u(d, $, g, _), c.keywords && (0, r.default)(d), d;
    };
    a.get = (d, c = "full") => {
      const _ = (c === "fast" ? s.fastFormats : s.fullFormats)[d];
      if (!_)
        throw new Error(`Unknown format "${d}"`);
      return _;
    };
    function u(d, c, g, _) {
      var $, b;
      ($ = (b = d.opts.code).formats) !== null && $ !== void 0 || (b.formats = (0, l._)`require("ajv-formats/dist/formats").${_}`);
      for (const E of c)
        d.addFormat(E, g[E]);
    }
    e.exports = t = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
  })(Pr, Pr.exports)), Pr.exports;
}
var qh = kh();
const Ch = /* @__PURE__ */ pu(qh), Dh = (e, t, s, r) => {
  if (s === "length" || s === "prototype" || s === "arguments" || s === "caller")
    return;
  const l = Object.getOwnPropertyDescriptor(e, s), n = Object.getOwnPropertyDescriptor(t, s);
  !Mh(l, n) && r || Object.defineProperty(e, s, n);
}, Mh = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Lh = (e, t) => {
  const s = Object.getPrototypeOf(t);
  s !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, s);
}, Vh = (e, t) => `/* Wrapped ${e}*/
${t}`, Fh = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Uh = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), zh = (e, t, s) => {
  const r = s === "" ? "" : `with ${s.trim()}() `, l = Vh.bind(null, r, t.toString());
  Object.defineProperty(l, "name", Uh);
  const { writable: n, enumerable: i, configurable: a } = Fh;
  Object.defineProperty(e, "toString", { value: l, writable: n, enumerable: i, configurable: a });
};
function Kh(e, t, { ignoreNonConfigurable: s = !1 } = {}) {
  const { name: r } = e;
  for (const l of Reflect.ownKeys(t))
    Dh(e, t, l, s);
  return Lh(e, t), zh(e, t, r), e;
}
const fc = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: s = 0,
    maxWait: r = Number.POSITIVE_INFINITY,
    before: l = !1,
    after: n = !0
  } = t;
  if (s < 0 || r < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!l && !n)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let i, a, u;
  const d = function(...c) {
    const g = this, _ = () => {
      i = void 0, a && (clearTimeout(a), a = void 0), n && (u = e.apply(g, c));
    }, $ = () => {
      a = void 0, i && (clearTimeout(i), i = void 0), n && (u = e.apply(g, c));
    }, b = l && !i;
    return clearTimeout(i), i = setTimeout(_, s), r > 0 && r !== Number.POSITIVE_INFINITY && !a && (a = setTimeout($, r)), b && (u = e.apply(g, c)), u;
  };
  return Kh(d, e), d.cancel = () => {
    i && (clearTimeout(i), i = void 0), a && (clearTimeout(a), a = void 0);
  }, d;
};
var fn = { exports: {} }, as, hc;
function jn() {
  if (hc) return as;
  hc = 1;
  const e = "2.0.0", t = 256, s = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, l = t - 6;
  return as = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: l,
    MAX_SAFE_INTEGER: s,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, as;
}
var os, mc;
function An() {
  return mc || (mc = 1, os = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), os;
}
var pc;
function Ot() {
  return pc || (pc = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: s,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: l
    } = jn(), n = An();
    t = e.exports = {};
    const i = t.re = [], a = t.safeRe = [], u = t.src = [], d = t.safeSrc = [], c = t.t = {};
    let g = 0;
    const _ = "[a-zA-Z0-9-]", $ = [
      ["\\s", 1],
      ["\\d", l],
      [_, r]
    ], b = (f) => {
      for (const [y, o] of $)
        f = f.split(`${y}*`).join(`${y}{0,${o}}`).split(`${y}+`).join(`${y}{1,${o}}`);
      return f;
    }, E = (f, y, o) => {
      const p = b(y), w = g++;
      n(f, w, y), c[f] = w, u[w] = y, d[w] = p, i[w] = new RegExp(y, o ? "g" : void 0), a[w] = new RegExp(p, o ? "g" : void 0);
    };
    E("NUMERICIDENTIFIER", "0|[1-9]\\d*"), E("NUMERICIDENTIFIERLOOSE", "\\d+"), E("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${_}*`), E("MAINVERSION", `(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})`), E("MAINVERSIONLOOSE", `(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASEIDENTIFIER", `(?:${u[c.NONNUMERICIDENTIFIER]}|${u[c.NUMERICIDENTIFIER]})`), E("PRERELEASEIDENTIFIERLOOSE", `(?:${u[c.NONNUMERICIDENTIFIER]}|${u[c.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASE", `(?:-(${u[c.PRERELEASEIDENTIFIER]}(?:\\.${u[c.PRERELEASEIDENTIFIER]})*))`), E("PRERELEASELOOSE", `(?:-?(${u[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[c.PRERELEASEIDENTIFIERLOOSE]})*))`), E("BUILDIDENTIFIER", `${_}+`), E("BUILD", `(?:\\+(${u[c.BUILDIDENTIFIER]}(?:\\.${u[c.BUILDIDENTIFIER]})*))`), E("FULLPLAIN", `v?${u[c.MAINVERSION]}${u[c.PRERELEASE]}?${u[c.BUILD]}?`), E("FULL", `^${u[c.FULLPLAIN]}$`), E("LOOSEPLAIN", `[v=\\s]*${u[c.MAINVERSIONLOOSE]}${u[c.PRERELEASELOOSE]}?${u[c.BUILD]}?`), E("LOOSE", `^${u[c.LOOSEPLAIN]}$`), E("GTLT", "((?:<|>)?=?)"), E("XRANGEIDENTIFIERLOOSE", `${u[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), E("XRANGEIDENTIFIER", `${u[c.NUMERICIDENTIFIER]}|x|X|\\*`), E("XRANGEPLAIN", `[v=\\s]*(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:${u[c.PRERELEASE]})?${u[c.BUILD]}?)?)?`), E("XRANGEPLAINLOOSE", `[v=\\s]*(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:${u[c.PRERELEASELOOSE]})?${u[c.BUILD]}?)?)?`), E("XRANGE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAIN]}$`), E("XRANGELOOSE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAINLOOSE]}$`), E("COERCEPLAIN", `(^|[^\\d])(\\d{1,${s}})(?:\\.(\\d{1,${s}}))?(?:\\.(\\d{1,${s}}))?`), E("COERCE", `${u[c.COERCEPLAIN]}(?:$|[^\\d])`), E("COERCEFULL", u[c.COERCEPLAIN] + `(?:${u[c.PRERELEASE]})?(?:${u[c.BUILD]})?(?:$|[^\\d])`), E("COERCERTL", u[c.COERCE], !0), E("COERCERTLFULL", u[c.COERCEFULL], !0), E("LONETILDE", "(?:~>?)"), E("TILDETRIM", `(\\s*)${u[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", E("TILDE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAIN]}$`), E("TILDELOOSE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAINLOOSE]}$`), E("LONECARET", "(?:\\^)"), E("CARETTRIM", `(\\s*)${u[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", E("CARET", `^${u[c.LONECARET]}${u[c.XRANGEPLAIN]}$`), E("CARETLOOSE", `^${u[c.LONECARET]}${u[c.XRANGEPLAINLOOSE]}$`), E("COMPARATORLOOSE", `^${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]})$|^$`), E("COMPARATOR", `^${u[c.GTLT]}\\s*(${u[c.FULLPLAIN]})$|^$`), E("COMPARATORTRIM", `(\\s*)${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]}|${u[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", E("HYPHENRANGE", `^\\s*(${u[c.XRANGEPLAIN]})\\s+-\\s+(${u[c.XRANGEPLAIN]})\\s*$`), E("HYPHENRANGELOOSE", `^\\s*(${u[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[c.XRANGEPLAINLOOSE]})\\s*$`), E("STAR", "(<|>)?=?\\s*\\*"), E("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), E("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(fn, fn.exports)), fn.exports;
}
var is, yc;
function ha() {
  if (yc) return is;
  yc = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return is = (r) => r ? typeof r != "object" ? e : r : t, is;
}
var cs, vc;
function Tu() {
  if (vc) return cs;
  vc = 1;
  const e = /^[0-9]+$/, t = (r, l) => {
    if (typeof r == "number" && typeof l == "number")
      return r === l ? 0 : r < l ? -1 : 1;
    const n = e.test(r), i = e.test(l);
    return n && i && (r = +r, l = +l), r === l ? 0 : n && !i ? -1 : i && !n ? 1 : r < l ? -1 : 1;
  };
  return cs = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, l) => t(l, r)
  }, cs;
}
var us, _c;
function Se() {
  if (_c) return us;
  _c = 1;
  const e = An(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: s } = jn(), { safeRe: r, t: l } = Ot(), n = ha(), { compareIdentifiers: i } = Tu();
  class a {
    constructor(d, c) {
      if (c = n(c), d instanceof a) {
        if (d.loose === !!c.loose && d.includePrerelease === !!c.includePrerelease)
          return d;
        d = d.version;
      } else if (typeof d != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof d}".`);
      if (d.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", d, c), this.options = c, this.loose = !!c.loose, this.includePrerelease = !!c.includePrerelease;
      const g = d.trim().match(c.loose ? r[l.LOOSE] : r[l.FULL]);
      if (!g)
        throw new TypeError(`Invalid Version: ${d}`);
      if (this.raw = d, this.major = +g[1], this.minor = +g[2], this.patch = +g[3], this.major > s || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > s || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > s || this.patch < 0)
        throw new TypeError("Invalid patch version");
      g[4] ? this.prerelease = g[4].split(".").map((_) => {
        if (/^[0-9]+$/.test(_)) {
          const $ = +_;
          if ($ >= 0 && $ < s)
            return $;
        }
        return _;
      }) : this.prerelease = [], this.build = g[5] ? g[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(d) {
      if (e("SemVer.compare", this.version, this.options, d), !(d instanceof a)) {
        if (typeof d == "string" && d === this.version)
          return 0;
        d = new a(d, this.options);
      }
      return d.version === this.version ? 0 : this.compareMain(d) || this.comparePre(d);
    }
    compareMain(d) {
      return d instanceof a || (d = new a(d, this.options)), this.major < d.major ? -1 : this.major > d.major ? 1 : this.minor < d.minor ? -1 : this.minor > d.minor ? 1 : this.patch < d.patch ? -1 : this.patch > d.patch ? 1 : 0;
    }
    comparePre(d) {
      if (d instanceof a || (d = new a(d, this.options)), this.prerelease.length && !d.prerelease.length)
        return -1;
      if (!this.prerelease.length && d.prerelease.length)
        return 1;
      if (!this.prerelease.length && !d.prerelease.length)
        return 0;
      let c = 0;
      do {
        const g = this.prerelease[c], _ = d.prerelease[c];
        if (e("prerelease compare", c, g, _), g === void 0 && _ === void 0)
          return 0;
        if (_ === void 0)
          return 1;
        if (g === void 0)
          return -1;
        if (g === _)
          continue;
        return i(g, _);
      } while (++c);
    }
    compareBuild(d) {
      d instanceof a || (d = new a(d, this.options));
      let c = 0;
      do {
        const g = this.build[c], _ = d.build[c];
        if (e("build compare", c, g, _), g === void 0 && _ === void 0)
          return 0;
        if (_ === void 0)
          return 1;
        if (g === void 0)
          return -1;
        if (g === _)
          continue;
        return i(g, _);
      } while (++c);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(d, c, g) {
      if (d.startsWith("pre")) {
        if (!c && g === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (c) {
          const _ = `-${c}`.match(this.options.loose ? r[l.PRERELEASELOOSE] : r[l.PRERELEASE]);
          if (!_ || _[1] !== c)
            throw new Error(`invalid identifier: ${c}`);
        }
      }
      switch (d) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", c, g);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", c, g);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", c, g), this.inc("pre", c, g);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", c, g), this.inc("pre", c, g);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const _ = Number(g) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [_];
          else {
            let $ = this.prerelease.length;
            for (; --$ >= 0; )
              typeof this.prerelease[$] == "number" && (this.prerelease[$]++, $ = -2);
            if ($ === -1) {
              if (c === this.prerelease.join(".") && g === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(_);
            }
          }
          if (c) {
            let $ = [c, _];
            g === !1 && ($ = [c]), i(this.prerelease[0], c) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = $) : this.prerelease = $;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${d}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return us = a, us;
}
var ls, $c;
function gt() {
  if ($c) return ls;
  $c = 1;
  const e = Se();
  return ls = (s, r, l = !1) => {
    if (s instanceof e)
      return s;
    try {
      return new e(s, r);
    } catch (n) {
      if (!l)
        return null;
      throw n;
    }
  }, ls;
}
var ds, gc;
function Gh() {
  if (gc) return ds;
  gc = 1;
  const e = gt();
  return ds = (s, r) => {
    const l = e(s, r);
    return l ? l.version : null;
  }, ds;
}
var fs, wc;
function Hh() {
  if (wc) return fs;
  wc = 1;
  const e = gt();
  return fs = (s, r) => {
    const l = e(s.trim().replace(/^[=v]+/, ""), r);
    return l ? l.version : null;
  }, fs;
}
var hs, Ec;
function Jh() {
  if (Ec) return hs;
  Ec = 1;
  const e = Se();
  return hs = (s, r, l, n, i) => {
    typeof l == "string" && (i = n, n = l, l = void 0);
    try {
      return new e(
        s instanceof e ? s.version : s,
        l
      ).inc(r, n, i).version;
    } catch {
      return null;
    }
  }, hs;
}
var ms, bc;
function Bh() {
  if (bc) return ms;
  bc = 1;
  const e = gt();
  return ms = (s, r) => {
    const l = e(s, null, !0), n = e(r, null, !0), i = l.compare(n);
    if (i === 0)
      return null;
    const a = i > 0, u = a ? l : n, d = a ? n : l, c = !!u.prerelease.length;
    if (!!d.prerelease.length && !c) {
      if (!d.patch && !d.minor)
        return "major";
      if (d.compareMain(u) === 0)
        return d.minor && !d.patch ? "minor" : "patch";
    }
    const _ = c ? "pre" : "";
    return l.major !== n.major ? _ + "major" : l.minor !== n.minor ? _ + "minor" : l.patch !== n.patch ? _ + "patch" : "prerelease";
  }, ms;
}
var ps, Sc;
function Xh() {
  if (Sc) return ps;
  Sc = 1;
  const e = Se();
  return ps = (s, r) => new e(s, r).major, ps;
}
var ys, Rc;
function Wh() {
  if (Rc) return ys;
  Rc = 1;
  const e = Se();
  return ys = (s, r) => new e(s, r).minor, ys;
}
var vs, Pc;
function Yh() {
  if (Pc) return vs;
  Pc = 1;
  const e = Se();
  return vs = (s, r) => new e(s, r).patch, vs;
}
var _s, Nc;
function Zh() {
  if (Nc) return _s;
  Nc = 1;
  const e = gt();
  return _s = (s, r) => {
    const l = e(s, r);
    return l && l.prerelease.length ? l.prerelease : null;
  }, _s;
}
var $s, Oc;
function Ce() {
  if (Oc) return $s;
  Oc = 1;
  const e = Se();
  return $s = (s, r, l) => new e(s, l).compare(new e(r, l)), $s;
}
var gs, Ic;
function Qh() {
  if (Ic) return gs;
  Ic = 1;
  const e = Ce();
  return gs = (s, r, l) => e(r, s, l), gs;
}
var ws, Tc;
function xh() {
  if (Tc) return ws;
  Tc = 1;
  const e = Ce();
  return ws = (s, r) => e(s, r, !0), ws;
}
var Es, jc;
function ma() {
  if (jc) return Es;
  jc = 1;
  const e = Se();
  return Es = (s, r, l) => {
    const n = new e(s, l), i = new e(r, l);
    return n.compare(i) || n.compareBuild(i);
  }, Es;
}
var bs, Ac;
function em() {
  if (Ac) return bs;
  Ac = 1;
  const e = ma();
  return bs = (s, r) => s.sort((l, n) => e(l, n, r)), bs;
}
var Ss, kc;
function tm() {
  if (kc) return Ss;
  kc = 1;
  const e = ma();
  return Ss = (s, r) => s.sort((l, n) => e(n, l, r)), Ss;
}
var Rs, qc;
function kn() {
  if (qc) return Rs;
  qc = 1;
  const e = Ce();
  return Rs = (s, r, l) => e(s, r, l) > 0, Rs;
}
var Ps, Cc;
function pa() {
  if (Cc) return Ps;
  Cc = 1;
  const e = Ce();
  return Ps = (s, r, l) => e(s, r, l) < 0, Ps;
}
var Ns, Dc;
function ju() {
  if (Dc) return Ns;
  Dc = 1;
  const e = Ce();
  return Ns = (s, r, l) => e(s, r, l) === 0, Ns;
}
var Os, Mc;
function Au() {
  if (Mc) return Os;
  Mc = 1;
  const e = Ce();
  return Os = (s, r, l) => e(s, r, l) !== 0, Os;
}
var Is, Lc;
function ya() {
  if (Lc) return Is;
  Lc = 1;
  const e = Ce();
  return Is = (s, r, l) => e(s, r, l) >= 0, Is;
}
var Ts, Vc;
function va() {
  if (Vc) return Ts;
  Vc = 1;
  const e = Ce();
  return Ts = (s, r, l) => e(s, r, l) <= 0, Ts;
}
var js, Fc;
function ku() {
  if (Fc) return js;
  Fc = 1;
  const e = ju(), t = Au(), s = kn(), r = ya(), l = pa(), n = va();
  return js = (a, u, d, c) => {
    switch (u) {
      case "===":
        return typeof a == "object" && (a = a.version), typeof d == "object" && (d = d.version), a === d;
      case "!==":
        return typeof a == "object" && (a = a.version), typeof d == "object" && (d = d.version), a !== d;
      case "":
      case "=":
      case "==":
        return e(a, d, c);
      case "!=":
        return t(a, d, c);
      case ">":
        return s(a, d, c);
      case ">=":
        return r(a, d, c);
      case "<":
        return l(a, d, c);
      case "<=":
        return n(a, d, c);
      default:
        throw new TypeError(`Invalid operator: ${u}`);
    }
  }, js;
}
var As, Uc;
function rm() {
  if (Uc) return As;
  Uc = 1;
  const e = Se(), t = gt(), { safeRe: s, t: r } = Ot();
  return As = (n, i) => {
    if (n instanceof e)
      return n;
    if (typeof n == "number" && (n = String(n)), typeof n != "string")
      return null;
    i = i || {};
    let a = null;
    if (!i.rtl)
      a = n.match(i.includePrerelease ? s[r.COERCEFULL] : s[r.COERCE]);
    else {
      const $ = i.includePrerelease ? s[r.COERCERTLFULL] : s[r.COERCERTL];
      let b;
      for (; (b = $.exec(n)) && (!a || a.index + a[0].length !== n.length); )
        (!a || b.index + b[0].length !== a.index + a[0].length) && (a = b), $.lastIndex = b.index + b[1].length + b[2].length;
      $.lastIndex = -1;
    }
    if (a === null)
      return null;
    const u = a[2], d = a[3] || "0", c = a[4] || "0", g = i.includePrerelease && a[5] ? `-${a[5]}` : "", _ = i.includePrerelease && a[6] ? `+${a[6]}` : "";
    return t(`${u}.${d}.${c}${g}${_}`, i);
  }, As;
}
var ks, zc;
function nm() {
  if (zc) return ks;
  zc = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(s) {
      const r = this.map.get(s);
      if (r !== void 0)
        return this.map.delete(s), this.map.set(s, r), r;
    }
    delete(s) {
      return this.map.delete(s);
    }
    set(s, r) {
      if (!this.delete(s) && r !== void 0) {
        if (this.map.size >= this.max) {
          const n = this.map.keys().next().value;
          this.delete(n);
        }
        this.map.set(s, r);
      }
      return this;
    }
  }
  return ks = e, ks;
}
var qs, Kc;
function De() {
  if (Kc) return qs;
  Kc = 1;
  const e = /\s+/g;
  class t {
    constructor(F, X) {
      if (X = l(X), F instanceof t)
        return F.loose === !!X.loose && F.includePrerelease === !!X.includePrerelease ? F : new t(F.raw, X);
      if (F instanceof n)
        return this.raw = F.value, this.set = [[F]], this.formatted = void 0, this;
      if (this.options = X, this.loose = !!X.loose, this.includePrerelease = !!X.includePrerelease, this.raw = F.trim().replace(e, " "), this.set = this.raw.split("||").map((B) => this.parseRange(B.trim())).filter((B) => B.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const B = this.set[0];
        if (this.set = this.set.filter((J) => !E(J[0])), this.set.length === 0)
          this.set = [B];
        else if (this.set.length > 1) {
          for (const J of this.set)
            if (J.length === 1 && f(J[0])) {
              this.set = [J];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let F = 0; F < this.set.length; F++) {
          F > 0 && (this.formatted += "||");
          const X = this.set[F];
          for (let B = 0; B < X.length; B++)
            B > 0 && (this.formatted += " "), this.formatted += X[B].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(F) {
      const B = ((this.options.includePrerelease && $) | (this.options.loose && b)) + ":" + F, J = r.get(B);
      if (J)
        return J;
      const Y = this.options.loose, k = Y ? u[d.HYPHENRANGELOOSE] : u[d.HYPHENRANGE];
      F = F.replace(k, U(this.options.includePrerelease)), i("hyphen replace", F), F = F.replace(u[d.COMPARATORTRIM], c), i("comparator trim", F), F = F.replace(u[d.TILDETRIM], g), i("tilde trim", F), F = F.replace(u[d.CARETTRIM], _), i("caret trim", F);
      let N = F.split(" ").map((S) => o(S, this.options)).join(" ").split(/\s+/).map((S) => D(S, this.options));
      Y && (N = N.filter((S) => (i("loose invalid filter", S, this.options), !!S.match(u[d.COMPARATORLOOSE])))), i("range list", N);
      const A = /* @__PURE__ */ new Map(), O = N.map((S) => new n(S, this.options));
      for (const S of O) {
        if (E(S))
          return [S];
        A.set(S.value, S);
      }
      A.size > 1 && A.has("") && A.delete("");
      const h = [...A.values()];
      return r.set(B, h), h;
    }
    intersects(F, X) {
      if (!(F instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((B) => y(B, X) && F.set.some((J) => y(J, X) && B.every((Y) => J.every((k) => Y.intersects(k, X)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(F) {
      if (!F)
        return !1;
      if (typeof F == "string")
        try {
          F = new a(F, this.options);
        } catch {
          return !1;
        }
      for (let X = 0; X < this.set.length; X++)
        if (z(this.set[X], F, this.options))
          return !0;
      return !1;
    }
  }
  qs = t;
  const s = nm(), r = new s(), l = ha(), n = qn(), i = An(), a = Se(), {
    safeRe: u,
    t: d,
    comparatorTrimReplace: c,
    tildeTrimReplace: g,
    caretTrimReplace: _
  } = Ot(), { FLAG_INCLUDE_PRERELEASE: $, FLAG_LOOSE: b } = jn(), E = (M) => M.value === "<0.0.0-0", f = (M) => M.value === "", y = (M, F) => {
    let X = !0;
    const B = M.slice();
    let J = B.pop();
    for (; X && B.length; )
      X = B.every((Y) => J.intersects(Y, F)), J = B.pop();
    return X;
  }, o = (M, F) => (M = M.replace(u[d.BUILD], ""), i("comp", M, F), M = v(M, F), i("caret", M), M = w(M, F), i("tildes", M), M = T(M, F), i("xrange", M), M = V(M, F), i("stars", M), M), p = (M) => !M || M.toLowerCase() === "x" || M === "*", w = (M, F) => M.trim().split(/\s+/).map((X) => m(X, F)).join(" "), m = (M, F) => {
    const X = F.loose ? u[d.TILDELOOSE] : u[d.TILDE];
    return M.replace(X, (B, J, Y, k, N) => {
      i("tilde", M, B, J, Y, k, N);
      let A;
      return p(J) ? A = "" : p(Y) ? A = `>=${J}.0.0 <${+J + 1}.0.0-0` : p(k) ? A = `>=${J}.${Y}.0 <${J}.${+Y + 1}.0-0` : N ? (i("replaceTilde pr", N), A = `>=${J}.${Y}.${k}-${N} <${J}.${+Y + 1}.0-0`) : A = `>=${J}.${Y}.${k} <${J}.${+Y + 1}.0-0`, i("tilde return", A), A;
    });
  }, v = (M, F) => M.trim().split(/\s+/).map((X) => R(X, F)).join(" "), R = (M, F) => {
    i("caret", M, F);
    const X = F.loose ? u[d.CARETLOOSE] : u[d.CARET], B = F.includePrerelease ? "-0" : "";
    return M.replace(X, (J, Y, k, N, A) => {
      i("caret", M, J, Y, k, N, A);
      let O;
      return p(Y) ? O = "" : p(k) ? O = `>=${Y}.0.0${B} <${+Y + 1}.0.0-0` : p(N) ? Y === "0" ? O = `>=${Y}.${k}.0${B} <${Y}.${+k + 1}.0-0` : O = `>=${Y}.${k}.0${B} <${+Y + 1}.0.0-0` : A ? (i("replaceCaret pr", A), Y === "0" ? k === "0" ? O = `>=${Y}.${k}.${N}-${A} <${Y}.${k}.${+N + 1}-0` : O = `>=${Y}.${k}.${N}-${A} <${Y}.${+k + 1}.0-0` : O = `>=${Y}.${k}.${N}-${A} <${+Y + 1}.0.0-0`) : (i("no pr"), Y === "0" ? k === "0" ? O = `>=${Y}.${k}.${N}${B} <${Y}.${k}.${+N + 1}-0` : O = `>=${Y}.${k}.${N}${B} <${Y}.${+k + 1}.0-0` : O = `>=${Y}.${k}.${N} <${+Y + 1}.0.0-0`), i("caret return", O), O;
    });
  }, T = (M, F) => (i("replaceXRanges", M, F), M.split(/\s+/).map((X) => C(X, F)).join(" ")), C = (M, F) => {
    M = M.trim();
    const X = F.loose ? u[d.XRANGELOOSE] : u[d.XRANGE];
    return M.replace(X, (B, J, Y, k, N, A) => {
      i("xRange", M, B, J, Y, k, N, A);
      const O = p(Y), h = O || p(k), S = h || p(N), j = S;
      return J === "=" && j && (J = ""), A = F.includePrerelease ? "-0" : "", O ? J === ">" || J === "<" ? B = "<0.0.0-0" : B = "*" : J && j ? (h && (k = 0), N = 0, J === ">" ? (J = ">=", h ? (Y = +Y + 1, k = 0, N = 0) : (k = +k + 1, N = 0)) : J === "<=" && (J = "<", h ? Y = +Y + 1 : k = +k + 1), J === "<" && (A = "-0"), B = `${J + Y}.${k}.${N}${A}`) : h ? B = `>=${Y}.0.0${A} <${+Y + 1}.0.0-0` : S && (B = `>=${Y}.${k}.0${A} <${Y}.${+k + 1}.0-0`), i("xRange return", B), B;
    });
  }, V = (M, F) => (i("replaceStars", M, F), M.trim().replace(u[d.STAR], "")), D = (M, F) => (i("replaceGTE0", M, F), M.trim().replace(u[F.includePrerelease ? d.GTE0PRE : d.GTE0], "")), U = (M) => (F, X, B, J, Y, k, N, A, O, h, S, j) => (p(B) ? X = "" : p(J) ? X = `>=${B}.0.0${M ? "-0" : ""}` : p(Y) ? X = `>=${B}.${J}.0${M ? "-0" : ""}` : k ? X = `>=${X}` : X = `>=${X}${M ? "-0" : ""}`, p(O) ? A = "" : p(h) ? A = `<${+O + 1}.0.0-0` : p(S) ? A = `<${O}.${+h + 1}.0-0` : j ? A = `<=${O}.${h}.${S}-${j}` : M ? A = `<${O}.${h}.${+S + 1}-0` : A = `<=${A}`, `${X} ${A}`.trim()), z = (M, F, X) => {
    for (let B = 0; B < M.length; B++)
      if (!M[B].test(F))
        return !1;
    if (F.prerelease.length && !X.includePrerelease) {
      for (let B = 0; B < M.length; B++)
        if (i(M[B].semver), M[B].semver !== n.ANY && M[B].semver.prerelease.length > 0) {
          const J = M[B].semver;
          if (J.major === F.major && J.minor === F.minor && J.patch === F.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return qs;
}
var Cs, Gc;
function qn() {
  if (Gc) return Cs;
  Gc = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, g) {
      if (g = s(g), c instanceof t) {
        if (c.loose === !!g.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), i("comparator", c, g), this.options = g, this.loose = !!g.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(c) {
      const g = this.options.loose ? r[l.COMPARATORLOOSE] : r[l.COMPARATOR], _ = c.match(g);
      if (!_)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = _[1] !== void 0 ? _[1] : "", this.operator === "=" && (this.operator = ""), _[2] ? this.semver = new a(_[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (i("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new a(c, this.options);
        } catch {
          return !1;
        }
      return n(c, this.operator, this.semver, this.options);
    }
    intersects(c, g) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(c.value, g).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new u(this.value, g).test(c.semver) : (g = s(g), g.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !g.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || n(this.semver, "<", c.semver, g) && this.operator.startsWith(">") && c.operator.startsWith("<") || n(this.semver, ">", c.semver, g) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  Cs = t;
  const s = ha(), { safeRe: r, t: l } = Ot(), n = ku(), i = An(), a = Se(), u = De();
  return Cs;
}
var Ds, Hc;
function Cn() {
  if (Hc) return Ds;
  Hc = 1;
  const e = De();
  return Ds = (s, r, l) => {
    try {
      r = new e(r, l);
    } catch {
      return !1;
    }
    return r.test(s);
  }, Ds;
}
var Ms, Jc;
function sm() {
  if (Jc) return Ms;
  Jc = 1;
  const e = De();
  return Ms = (s, r) => new e(s, r).set.map((l) => l.map((n) => n.value).join(" ").trim().split(" ")), Ms;
}
var Ls, Bc;
function am() {
  if (Bc) return Ls;
  Bc = 1;
  const e = Se(), t = De();
  return Ls = (r, l, n) => {
    let i = null, a = null, u = null;
    try {
      u = new t(l, n);
    } catch {
      return null;
    }
    return r.forEach((d) => {
      u.test(d) && (!i || a.compare(d) === -1) && (i = d, a = new e(i, n));
    }), i;
  }, Ls;
}
var Vs, Xc;
function om() {
  if (Xc) return Vs;
  Xc = 1;
  const e = Se(), t = De();
  return Vs = (r, l, n) => {
    let i = null, a = null, u = null;
    try {
      u = new t(l, n);
    } catch {
      return null;
    }
    return r.forEach((d) => {
      u.test(d) && (!i || a.compare(d) === 1) && (i = d, a = new e(i, n));
    }), i;
  }, Vs;
}
var Fs, Wc;
function im() {
  if (Wc) return Fs;
  Wc = 1;
  const e = Se(), t = De(), s = kn();
  return Fs = (l, n) => {
    l = new t(l, n);
    let i = new e("0.0.0");
    if (l.test(i) || (i = new e("0.0.0-0"), l.test(i)))
      return i;
    i = null;
    for (let a = 0; a < l.set.length; ++a) {
      const u = l.set[a];
      let d = null;
      u.forEach((c) => {
        const g = new e(c.semver.version);
        switch (c.operator) {
          case ">":
            g.prerelease.length === 0 ? g.patch++ : g.prerelease.push(0), g.raw = g.format();
          /* fallthrough */
          case "":
          case ">=":
            (!d || s(g, d)) && (d = g);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${c.operator}`);
        }
      }), d && (!i || s(i, d)) && (i = d);
    }
    return i && l.test(i) ? i : null;
  }, Fs;
}
var Us, Yc;
function cm() {
  if (Yc) return Us;
  Yc = 1;
  const e = De();
  return Us = (s, r) => {
    try {
      return new e(s, r).range || "*";
    } catch {
      return null;
    }
  }, Us;
}
var zs, Zc;
function _a() {
  if (Zc) return zs;
  Zc = 1;
  const e = Se(), t = qn(), { ANY: s } = t, r = De(), l = Cn(), n = kn(), i = pa(), a = va(), u = ya();
  return zs = (c, g, _, $) => {
    c = new e(c, $), g = new r(g, $);
    let b, E, f, y, o;
    switch (_) {
      case ">":
        b = n, E = a, f = i, y = ">", o = ">=";
        break;
      case "<":
        b = i, E = u, f = n, y = "<", o = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (l(c, g, $))
      return !1;
    for (let p = 0; p < g.set.length; ++p) {
      const w = g.set[p];
      let m = null, v = null;
      if (w.forEach((R) => {
        R.semver === s && (R = new t(">=0.0.0")), m = m || R, v = v || R, b(R.semver, m.semver, $) ? m = R : f(R.semver, v.semver, $) && (v = R);
      }), m.operator === y || m.operator === o || (!v.operator || v.operator === y) && E(c, v.semver))
        return !1;
      if (v.operator === o && f(c, v.semver))
        return !1;
    }
    return !0;
  }, zs;
}
var Ks, Qc;
function um() {
  if (Qc) return Ks;
  Qc = 1;
  const e = _a();
  return Ks = (s, r, l) => e(s, r, ">", l), Ks;
}
var Gs, xc;
function lm() {
  if (xc) return Gs;
  xc = 1;
  const e = _a();
  return Gs = (s, r, l) => e(s, r, "<", l), Gs;
}
var Hs, eu;
function dm() {
  if (eu) return Hs;
  eu = 1;
  const e = De();
  return Hs = (s, r, l) => (s = new e(s, l), r = new e(r, l), s.intersects(r, l)), Hs;
}
var Js, tu;
function fm() {
  if (tu) return Js;
  tu = 1;
  const e = Cn(), t = Ce();
  return Js = (s, r, l) => {
    const n = [];
    let i = null, a = null;
    const u = s.sort((_, $) => t(_, $, l));
    for (const _ of u)
      e(_, r, l) ? (a = _, i || (i = _)) : (a && n.push([i, a]), a = null, i = null);
    i && n.push([i, null]);
    const d = [];
    for (const [_, $] of n)
      _ === $ ? d.push(_) : !$ && _ === u[0] ? d.push("*") : $ ? _ === u[0] ? d.push(`<=${$}`) : d.push(`${_} - ${$}`) : d.push(`>=${_}`);
    const c = d.join(" || "), g = typeof r.raw == "string" ? r.raw : String(r);
    return c.length < g.length ? c : r;
  }, Js;
}
var Bs, ru;
function hm() {
  if (ru) return Bs;
  ru = 1;
  const e = De(), t = qn(), { ANY: s } = t, r = Cn(), l = Ce(), n = (g, _, $ = {}) => {
    if (g === _)
      return !0;
    g = new e(g, $), _ = new e(_, $);
    let b = !1;
    e: for (const E of g.set) {
      for (const f of _.set) {
        const y = u(E, f, $);
        if (b = b || y !== null, y)
          continue e;
      }
      if (b)
        return !1;
    }
    return !0;
  }, i = [new t(">=0.0.0-0")], a = [new t(">=0.0.0")], u = (g, _, $) => {
    if (g === _)
      return !0;
    if (g.length === 1 && g[0].semver === s) {
      if (_.length === 1 && _[0].semver === s)
        return !0;
      $.includePrerelease ? g = i : g = a;
    }
    if (_.length === 1 && _[0].semver === s) {
      if ($.includePrerelease)
        return !0;
      _ = a;
    }
    const b = /* @__PURE__ */ new Set();
    let E, f;
    for (const T of g)
      T.operator === ">" || T.operator === ">=" ? E = d(E, T, $) : T.operator === "<" || T.operator === "<=" ? f = c(f, T, $) : b.add(T.semver);
    if (b.size > 1)
      return null;
    let y;
    if (E && f) {
      if (y = l(E.semver, f.semver, $), y > 0)
        return null;
      if (y === 0 && (E.operator !== ">=" || f.operator !== "<="))
        return null;
    }
    for (const T of b) {
      if (E && !r(T, String(E), $) || f && !r(T, String(f), $))
        return null;
      for (const C of _)
        if (!r(T, String(C), $))
          return !1;
      return !0;
    }
    let o, p, w, m, v = f && !$.includePrerelease && f.semver.prerelease.length ? f.semver : !1, R = E && !$.includePrerelease && E.semver.prerelease.length ? E.semver : !1;
    v && v.prerelease.length === 1 && f.operator === "<" && v.prerelease[0] === 0 && (v = !1);
    for (const T of _) {
      if (m = m || T.operator === ">" || T.operator === ">=", w = w || T.operator === "<" || T.operator === "<=", E) {
        if (R && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === R.major && T.semver.minor === R.minor && T.semver.patch === R.patch && (R = !1), T.operator === ">" || T.operator === ">=") {
          if (o = d(E, T, $), o === T && o !== E)
            return !1;
        } else if (E.operator === ">=" && !r(E.semver, String(T), $))
          return !1;
      }
      if (f) {
        if (v && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === v.major && T.semver.minor === v.minor && T.semver.patch === v.patch && (v = !1), T.operator === "<" || T.operator === "<=") {
          if (p = c(f, T, $), p === T && p !== f)
            return !1;
        } else if (f.operator === "<=" && !r(f.semver, String(T), $))
          return !1;
      }
      if (!T.operator && (f || E) && y !== 0)
        return !1;
    }
    return !(E && w && !f && y !== 0 || f && m && !E && y !== 0 || R || v);
  }, d = (g, _, $) => {
    if (!g)
      return _;
    const b = l(g.semver, _.semver, $);
    return b > 0 ? g : b < 0 || _.operator === ">" && g.operator === ">=" ? _ : g;
  }, c = (g, _, $) => {
    if (!g)
      return _;
    const b = l(g.semver, _.semver, $);
    return b < 0 ? g : b > 0 || _.operator === "<" && g.operator === "<=" ? _ : g;
  };
  return Bs = n, Bs;
}
var Xs, nu;
function mm() {
  if (nu) return Xs;
  nu = 1;
  const e = Ot(), t = jn(), s = Se(), r = Tu(), l = gt(), n = Gh(), i = Hh(), a = Jh(), u = Bh(), d = Xh(), c = Wh(), g = Yh(), _ = Zh(), $ = Ce(), b = Qh(), E = xh(), f = ma(), y = em(), o = tm(), p = kn(), w = pa(), m = ju(), v = Au(), R = ya(), T = va(), C = ku(), V = rm(), D = qn(), U = De(), z = Cn(), M = sm(), F = am(), X = om(), B = im(), J = cm(), Y = _a(), k = um(), N = lm(), A = dm(), O = fm(), h = hm();
  return Xs = {
    parse: l,
    valid: n,
    clean: i,
    inc: a,
    diff: u,
    major: d,
    minor: c,
    patch: g,
    prerelease: _,
    compare: $,
    rcompare: b,
    compareLoose: E,
    compareBuild: f,
    sort: y,
    rsort: o,
    gt: p,
    lt: w,
    eq: m,
    neq: v,
    gte: R,
    lte: T,
    cmp: C,
    coerce: V,
    Comparator: D,
    Range: U,
    satisfies: z,
    toComparators: M,
    maxSatisfying: F,
    minSatisfying: X,
    minVersion: B,
    validRange: J,
    outside: Y,
    gtr: k,
    ltr: N,
    intersects: A,
    simplifyRange: O,
    subset: h,
    SemVer: s,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, Xs;
}
var pm = mm();
const vt = /* @__PURE__ */ pu(pm), ym = Object.prototype.toString, vm = "[object Uint8Array]", _m = "[object ArrayBuffer]";
function qu(e, t, s) {
  return e ? e.constructor === t ? !0 : ym.call(e) === s : !1;
}
function Cu(e) {
  return qu(e, Uint8Array, vm);
}
function $m(e) {
  return qu(e, ArrayBuffer, _m);
}
function gm(e) {
  return Cu(e) || $m(e);
}
function wm(e) {
  if (!Cu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Em(e) {
  if (!gm(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Ws(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ??= e.reduce((l, n) => l + n.length, 0);
  const s = new Uint8Array(t);
  let r = 0;
  for (const l of e)
    wm(l), s.set(l, r), r += l.length;
  return s;
}
const su = {
  utf8: new globalThis.TextDecoder("utf8")
};
function hn(e, t = "utf8") {
  return Em(e), su[t] ??= new globalThis.TextDecoder(t), su[t].decode(e);
}
function bm(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Sm = new globalThis.TextEncoder();
function mn(e) {
  return bm(e), Sm.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Ys = "aes-256-cbc", We = () => /* @__PURE__ */ Object.create(null), au = (e) => e !== void 0, Zs = (e, t) => {
  const s = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), r = typeof t;
  if (s.has(r))
    throw new TypeError(`Setting a value of type \`${r}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Ye = "__internal__", Qs = `${Ye}.migrations.version`;
class Rm {
  path;
  events;
  #s;
  #r;
  #e;
  #t = {};
  #a = !1;
  #o;
  #i;
  #n;
  constructor(t = {}) {
    const s = this.#c(t);
    this.#e = s, this.#u(s), this.#d(s), this.#f(s), this.events = new EventTarget(), this.#r = s.encryptionKey, this.path = this.#h(s), this.#m(s), s.watch && this._watch();
  }
  get(t, s) {
    if (this.#e.accessPropertiesByDotNotation)
      return this._get(t, s);
    const { store: r } = this;
    return t in r ? r[t] : s;
  }
  set(t, s) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && s === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${Ye} key, as it's used to manage this module internal operations.`);
    const { store: r } = this, l = (n, i) => {
      if (Zs(n, i), this.#e.accessPropertiesByDotNotation)
        It(r, n, i);
      else {
        if (n === "__proto__" || n === "constructor" || n === "prototype")
          return;
        r[n] = i;
      }
    };
    if (typeof t == "object") {
      const n = t;
      for (const [i, a] of Object.entries(n))
        l(i, a);
    } else
      l(t, s);
    this.store = r;
  }
  has(t) {
    return this.#e.accessPropertiesByDotNotation ? Ln(this.store, t) : t in this.store;
  }
  appendToArray(t, s) {
    Zs(t, s);
    const r = this.#e.accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(r))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...r, s]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const s of t)
      au(this.#t[s]) && this.set(s, this.#t[s]);
  }
  delete(t) {
    const { store: s } = this;
    this.#e.accessPropertiesByDotNotation ? Fu(s, t) : delete s[t], this.store = s;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = We();
    for (const s of Object.keys(this.#t))
      au(this.#t[s]) && (Zs(s, this.#t[s]), this.#e.accessPropertiesByDotNotation ? It(t, s, this.#t[s]) : t[s] = this.#t[s]);
    this.store = t;
  }
  onDidChange(t, s) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof s != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof s}`);
    return this._handleValueChange(() => this.get(t), s);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleStoreChange(t);
  }
  get size() {
    return Object.keys(this.store).filter((s) => !this._isReservedKeyPath(s)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const t = x.readFileSync(this.path, this.#r ? null : "utf8"), s = this._decryptData(t), r = this._deserialize(s);
      return this.#a || this._validate(r), Object.assign(We(), r);
    } catch (t) {
      if (t?.code === "ENOENT")
        return this._ensureDirectory(), We();
      if (this.#e.clearInvalidConfig) {
        const s = t;
        if (s.name === "SyntaxError" || s.message?.startsWith("Config schema violation:"))
          return We();
      }
      throw t;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Ln(t, Ye))
      try {
        const s = x.readFileSync(this.path, this.#r ? null : "utf8"), r = this._decryptData(s), l = this._deserialize(r);
        Ln(l, Ye) && It(t, Ye, ba(l, Ye));
      } catch {
      }
    this.#a || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, s] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, s]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    this.#o && (this.#o.close(), this.#o = void 0), this.#i && (x.unwatchFile(this.path), this.#i = !1), this.#n = void 0;
  }
  _decryptData(t) {
    if (!this.#r)
      return typeof t == "string" ? t : hn(t);
    try {
      const s = t.slice(0, 16), r = nt.pbkdf2Sync(this.#r, s, 1e4, 32, "sha512"), l = nt.createDecipheriv(Ys, r, s), n = t.slice(17), i = typeof n == "string" ? mn(n) : n;
      return hn(Ws([l.update(i), l.final()]));
    } catch {
      try {
        const s = t.slice(0, 16), r = nt.pbkdf2Sync(this.#r, s.toString(), 1e4, 32, "sha512"), l = nt.createDecipheriv(Ys, r, s), n = t.slice(17), i = typeof n == "string" ? mn(n) : n;
        return hn(Ws([l.update(i), l.final()]));
      } catch {
      }
    }
    return typeof t == "string" ? t : hn(t);
  }
  _handleStoreChange(t) {
    let s = this.store;
    const r = () => {
      const l = s, n = this.store;
      wa(n, l) || (s = n, t.call(this, n, l));
    };
    return this.events.addEventListener("change", r), () => {
      this.events.removeEventListener("change", r);
    };
  }
  _handleValueChange(t, s) {
    let r = t();
    const l = () => {
      const n = r, i = t();
      wa(i, n) || (r = i, s.call(this, i, n));
    };
    return this.events.addEventListener("change", l), () => {
      this.events.removeEventListener("change", l);
    };
  }
  _deserialize = (t) => JSON.parse(t);
  _serialize = (t) => JSON.stringify(t, void 0, "	");
  _validate(t) {
    if (!this.#s || this.#s(t) || !this.#s.errors)
      return;
    const r = this.#s.errors.map(({ instancePath: l, message: n = "" }) => `\`${l.slice(1)}\` ${n}`);
    throw new Error("Config schema violation: " + r.join("; "));
  }
  _ensureDirectory() {
    x.mkdirSync(ie.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let s = this._serialize(t);
    if (this.#r) {
      const r = nt.randomBytes(16), l = nt.pbkdf2Sync(this.#r, r, 1e4, 32, "sha512"), n = nt.createCipheriv(Ys, l, r);
      s = Ws([r, mn(":"), n.update(mn(s)), n.final()]);
    }
    if (me.env.SNAP)
      x.writeFileSync(this.path, s, { mode: this.#e.configFileMode });
    else
      try {
        mu(this.path, s, { mode: this.#e.configFileMode });
      } catch (r) {
        if (r?.code === "EXDEV") {
          x.writeFileSync(this.path, s, { mode: this.#e.configFileMode });
          return;
        }
        throw r;
      }
  }
  _watch() {
    if (this._ensureDirectory(), x.existsSync(this.path) || this._write(We()), me.platform === "win32" || me.platform === "darwin") {
      this.#n ??= fc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 });
      const t = ie.dirname(this.path), s = ie.basename(this.path);
      this.#o = x.watch(t, { persistent: !1, encoding: "utf8" }, (r, l) => {
        l && l !== s || typeof this.#n == "function" && this.#n();
      });
    } else
      this.#n ??= fc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 }), x.watchFile(this.path, { persistent: !1 }, (t, s) => {
        typeof this.#n == "function" && this.#n();
      }), this.#i = !0;
  }
  _migrate(t, s, r) {
    let l = this._get(Qs, "0.0.0");
    const n = Object.keys(t).filter((a) => this._shouldPerformMigration(a, l, s));
    let i = structuredClone(this.store);
    for (const a of n)
      try {
        r && r(this, {
          fromVersion: l,
          toVersion: a,
          finalVersion: s,
          versions: n
        });
        const u = t[a];
        u?.(this), this._set(Qs, a), l = a, i = structuredClone(this.store);
      } catch (u) {
        this.store = i;
        try {
          this._write(i);
        } catch {
        }
        const d = u instanceof Error ? u.message : String(u);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${d}`);
      }
    (this._isVersionInRangeFormat(l) || !vt.eq(l, s)) && this._set(Qs, s);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [s, r] of Object.entries(t))
      if (this._isReservedKeyPath(s) || this._objectContainsReservedKey(r))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === Ye || t.startsWith(`${Ye}.`);
  }
  _isVersionInRangeFormat(t) {
    return vt.clean(t) === null;
  }
  _shouldPerformMigration(t, s, r) {
    return this._isVersionInRangeFormat(t) ? s !== "0.0.0" && vt.satisfies(s, t) ? !1 : vt.satisfies(r, t) : !(vt.lte(t, s) || vt.gt(t, r));
  }
  _get(t, s) {
    return ba(this.store, t, s);
  }
  _set(t, s) {
    const { store: r } = this;
    It(r, t, s), this.store = r;
  }
  #c(t) {
    const s = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!s.cwd) {
      if (!s.projectName)
        throw new Error("Please specify the `projectName` option.");
      s.cwd = Gu(s.projectName, { suffix: s.projectSuffix }).config;
    }
    return typeof s.fileExtension == "string" && (s.fileExtension = s.fileExtension.replace(/^\.+/, "")), s;
  }
  #u(t) {
    if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
      return;
    if (t.schema && typeof t.schema != "object")
      throw new TypeError("The `schema` option must be an object.");
    const s = Ch.default, r = new Nf.Ajv2020({
      allErrors: !0,
      useDefaults: !0,
      ...t.ajvOptions
    });
    s(r);
    const l = {
      ...t.rootSchema,
      type: "object",
      properties: t.schema
    };
    this.#s = r.compile(l), this.#l(t.schema);
  }
  #l(t) {
    const s = Object.entries(t ?? {});
    for (const [r, l] of s) {
      if (!l || typeof l != "object" || !Object.hasOwn(l, "default"))
        continue;
      const { default: n } = l;
      n !== void 0 && (this.#t[r] = n);
    }
  }
  #d(t) {
    t.defaults && Object.assign(this.#t, t.defaults);
  }
  #f(t) {
    t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
  }
  #h(t) {
    const s = typeof t.fileExtension == "string" ? t.fileExtension : void 0, r = s ? `.${s}` : "";
    return ie.resolve(t.cwd, `${t.configName ?? "config"}${r}`);
  }
  #m(t) {
    if (t.migrations) {
      this.#p(t), this._validate(this.store);
      return;
    }
    const s = this.store, r = Object.assign(We(), t.defaults ?? {}, s);
    this._validate(r);
    try {
      Ea.deepEqual(s, r);
    } catch {
      this.store = r;
    }
  }
  #p(t) {
    const { migrations: s, projectVersion: r } = t;
    if (s) {
      if (!r)
        throw new Error("Please specify the `projectVersion` option.");
      this.#a = !0;
      try {
        const l = this.store, n = Object.assign(We(), t.defaults ?? {}, l);
        try {
          Ea.deepEqual(l, n);
        } catch {
          this._write(n);
        }
        this._migrate(s, r, t.beforeEachMigration);
      } finally {
        this.#a = !1;
      }
    }
  }
}
const { app: pn, ipcMain: ea, shell: Pm } = cu;
let ou = !1;
const iu = () => {
  if (!ea || !pn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: pn.getPath("userData"),
    appVersion: pn.getVersion()
  };
  return ou || (ea.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), ou = !0), e;
};
class Nm extends Rm {
  constructor(t) {
    let s, r;
    if (me.type === "renderer") {
      const l = cu.ipcRenderer.sendSync("electron-store-get-data");
      if (!l)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: s, appVersion: r } = l);
    } else ea && pn && ({ defaultCwd: s, appVersion: r } = iu());
    t = {
      name: "config",
      ...t
    }, t.projectVersion ||= r, t.cwd ? t.cwd = ie.isAbsolute(t.cwd) ? t.cwd : ie.join(s, t.cwd) : t.cwd = s, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    iu();
  }
  async openInEditor() {
    const t = await Pm.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const Om = Mu(import.meta.url), Im = ie.dirname(Om), $a = new Nm();
Qe.commandLine.appendSwitch("ignore-certificate-errors");
let xs = null;
ra.on("set-token", (e, t) => {
  $a.set("user_token", t), console.log("Token 已保存:", t);
});
ra.handle("get-token", () => {
  const e = $a.get("user_token");
  return console.log("读取 Token:", e), e;
});
ra.on("clear-token", () => {
  $a.delete("user_token");
});
function ta() {
  xs = new na({
    width: 1200,
    height: 800,
    // icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      // 👇 再次提醒：如果还没生成 preload.js，请保持这行注释状态
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: !0,
      contextIsolation: !1,
      webSecurity: !1,
      allowRunningInsecureContent: !0
    }
  }), process.env.VITE_DEV_SERVER_URL, process.env.VITE_DEV_SERVER_URL ? xs.loadURL(process.env.VITE_DEV_SERVER_URL) : xs.loadFile(ie.join(Im, "../dist/index.html"));
}
function Tm() {
  const e = process.platform === "darwin", t = [
    // 🔴 Mac 专属：第一个菜单是应用名称 (显示在左上角苹果图标旁)
    ...e ? [{
      label: Qe.name,
      submenu: [
        { label: "关于系统", role: "about" },
        { type: "separator" },
        { label: "隐藏应用", role: "hide" },
        { label: "隐藏其他", role: "hideOthers" },
        { label: "显示全部", role: "unhide" },
        { type: "separator" },
        { label: "退出系统", role: "quit" }
      ]
    }] : [],
    // 文件菜单
    {
      label: "文件",
      submenu: [
        // Mac 上通常把“关闭窗口”放在这里，而“退出”在第一个菜单
        e ? { label: "关闭窗口", role: "close" } : { label: "退出系统", role: "quit" }
      ]
    },
    // 编辑菜单 (Mac 必须保留这个，否则复制粘贴快捷键会失效！)
    {
      label: "编辑",
      submenu: [
        { label: "撤销", role: "undo" },
        { label: "重做", role: "redo" },
        { type: "separator" },
        { label: "剪切", role: "cut" },
        { label: "复制", role: "copy" },
        { label: "粘贴", role: "paste" },
        { label: "全选", role: "selectAll" }
      ]
    },
    // 视图菜单
    {
      label: "视图",
      submenu: [
        { label: "刷新页面", role: "reload" },
        { label: "强制刷新", role: "forceReload" },
        { label: "开发者工具", role: "toggleDevTools" },
        // 调试完可以注释掉
        { type: "separator" },
        { label: "实际大小", role: "resetZoom" },
        { label: "放大", role: "zoomIn" },
        { label: "缩小", role: "zoomOut" },
        { type: "separator" },
        { label: "全屏", role: "togglefullscreen" }
      ]
    },
    // 帮助菜单
    {
      label: "帮助",
      submenu: [
        {
          label: "了解更多",
          click: async () => {
            await Du.openExternal("https://xie-app.asia");
          }
        }
      ]
    }
  ], s = ga.buildFromTemplate(t);
  ga.setApplicationMenu(s);
}
Qe.whenReady().then(() => {
  Qe.setName("成绩分析助手"), Tm(), ta(), Qe.on("activate", () => {
    na.getAllWindows().length === 0 && ta();
  });
});
Qe.on("window-all-closed", () => {
  process.platform !== "darwin" && Qe.quit();
});
Qe.on("activate", () => {
  na.getAllWindows().length === 0 && ta();
});
