var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _a, _value, _reactions, _b, _value2, _reactions2, _f, _depth, _derivatives, _settersQueue, _derivativesQueue, _reactionsQueue, _applyUpdate, applyUpdate_fn;
class LiveFragment {
  constructor() {
    __publicField(this, "startMarker", document.createTextNode(""));
    __publicField(this, "endMarker", document.createTextNode(""));
  }
  static from(firstNode, lastNode) {
    const liveFragment2 = new this();
    firstNode.before(liveFragment2.startMarker);
    lastNode.after(liveFragment2.endMarker);
    return liveFragment2;
  }
  before(...xs) {
    this.startMarker.before(...xs);
  }
  prepend(...xs) {
    this.startMarker.after(...xs);
  }
  append(...xs) {
    this.endMarker.before(...xs);
  }
  after(...xs) {
    this.endMarker.after(...xs);
  }
  remove() {
    const range = document.createRange();
    range.setStartBefore(this.startMarker);
    range.setEndAfter(this.endMarker);
    range.deleteContents();
  }
  replaceChildren(...xs) {
    const range = document.createRange();
    range.setStartAfter(this.startMarker);
    range.setEndBefore(this.endMarker);
    range.deleteContents();
    this.startMarker.after(...xs);
  }
  replaceWith(...xs) {
    this.endMarker.after(...xs);
    this.remove();
  }
  get childNodes() {
    const childNodes = [];
    for (let currentNode = this.startMarker.nextSibling; currentNode != this.endMarker && currentNode; currentNode = currentNode.nextSibling)
      childNodes.push(currentNode);
    return childNodes;
  }
  get children() {
    return this.childNodes.filter((node) => node instanceof HTMLElement);
  }
}
var liveFragment = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  LiveFragment
});
const isReactive = Symbol.for("bruh reactive");
class SimpleReactive {
  constructor(value) {
    __publicField(this, _a, true);
    __privateAdd(this, _value, void 0);
    __privateAdd(this, _reactions, new Set());
    __privateSet(this, _value, value);
  }
  get value() {
    return __privateGet(this, _value);
  }
  set value(newValue) {
    if (newValue === __privateGet(this, _value))
      return;
    __privateSet(this, _value, newValue);
    for (const reaction of __privateGet(this, _reactions))
      reaction();
  }
  addReaction(reaction) {
    __privateGet(this, _reactions).add(reaction);
    return () => __privateGet(this, _reactions).delete(reaction);
  }
}
_a = isReactive;
_value = new WeakMap();
_reactions = new WeakMap();
const _FunctionalReactive = class {
  constructor(x, f) {
    __privateAdd(this, _applyUpdate);
    __publicField(this, _b, true);
    __privateAdd(this, _value2, void 0);
    __privateAdd(this, _reactions2, new Set());
    __privateAdd(this, _f, void 0);
    __privateAdd(this, _depth, 0);
    __privateAdd(this, _derivatives, new Set());
    if (!f) {
      __privateSet(this, _value2, x);
      return;
    }
    __privateSet(this, _value2, f());
    __privateSet(this, _f, f);
    __privateSet(this, _depth, Math.max(...x.map((d) => __privateGet(d, _depth))) + 1);
    x.forEach((d) => __privateGet(d, _derivatives).add(this));
  }
  get value() {
    if (__privateGet(_FunctionalReactive, _settersQueue).size)
      _FunctionalReactive.applyUpdates();
    return __privateGet(this, _value2);
  }
  set value(newValue) {
    if (__privateGet(this, _depth) !== 0)
      return;
    if (!__privateGet(_FunctionalReactive, _settersQueue).size)
      queueMicrotask(_FunctionalReactive.applyUpdates);
    __privateGet(_FunctionalReactive, _settersQueue).set(this, newValue);
  }
  addReaction(reaction) {
    __privateGet(this, _reactions2).add(reaction);
    return () => __privateGet(this, _reactions2).delete(reaction);
  }
  static applyUpdates() {
    var _a2, _b2, _c;
    if (!__privateGet(_FunctionalReactive, _settersQueue).size)
      return;
    for (const [sourceNode, newValue] of __privateGet(_FunctionalReactive, _settersQueue).entries())
      __privateMethod(_a2 = sourceNode, _applyUpdate, applyUpdate_fn).call(_a2, newValue);
    __privateGet(_FunctionalReactive, _settersQueue).clear();
    for (const depthSet of __privateGet(_FunctionalReactive, _derivativesQueue))
      if (depthSet)
        for (const derivative of depthSet)
          __privateMethod(_c = derivative, _applyUpdate, applyUpdate_fn).call(_c, __privateGet(_b2 = derivative, _f).call(_b2));
    __privateGet(_FunctionalReactive, _derivativesQueue).length = 0;
    for (const reaction of __privateGet(_FunctionalReactive, _reactionsQueue))
      reaction();
    __privateGet(_FunctionalReactive, _reactionsQueue).length = 0;
  }
};
let FunctionalReactive = _FunctionalReactive;
_b = isReactive;
_value2 = new WeakMap();
_reactions2 = new WeakMap();
_f = new WeakMap();
_depth = new WeakMap();
_derivatives = new WeakMap();
_settersQueue = new WeakMap();
_derivativesQueue = new WeakMap();
_reactionsQueue = new WeakMap();
_applyUpdate = new WeakSet();
applyUpdate_fn = function(newValue) {
  if (newValue === __privateGet(this, _value2))
    return;
  __privateSet(this, _value2, newValue);
  __privateGet(_FunctionalReactive, _reactionsQueue).push(...__privateGet(this, _reactions2));
  const queue = __privateGet(_FunctionalReactive, _derivativesQueue);
  for (const derivative of __privateGet(this, _derivatives)) {
    const depth = __privateGet(derivative, _depth);
    if (!queue[depth])
      queue[depth] = new Set();
    queue[depth].add(derivative);
  }
};
__privateAdd(FunctionalReactive, _settersQueue, new Map());
__privateAdd(FunctionalReactive, _derivativesQueue, []);
__privateAdd(FunctionalReactive, _reactionsQueue, []);
const r = (x, f) => new FunctionalReactive(x, f);
const reactiveDo = (x, f) => {
  if (x == null ? void 0 : x[isReactive]) {
    f(x.value);
    return x.addReaction(() => f(x.value));
  }
  f(x);
};
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  isReactive,
  SimpleReactive,
  FunctionalReactive,
  r,
  reactiveDo
});
const isBruhChild = (x) => (x == null ? void 0 : x[isReactive]) || x instanceof Node || Array.isArray(x) || x == null || !(typeof x === "function" || typeof x === "object");
const toNode = (x) => x instanceof Node ? x : document.createTextNode(x);
const bruhChildrenToNodes = (...children) => children.flat(Infinity).flatMap((child) => {
  if (!child[isReactive])
    return [toNode(child)];
  if (Array.isArray(child.value)) {
    const liveFragment2 = new LiveFragment();
    child.addReaction(() => {
      liveFragment2.replaceChildren(...bruhChildrenToNodes(...child.value));
    });
    return [liveFragment2.startMarker, ...bruhChildrenToNodes(...child.value), liveFragment2.endMarker];
  }
  let node = toNode(child.value);
  child.addReaction(() => {
    const oldNode = node;
    node = toNode(child.value);
    oldNode.replaceWith(node);
  });
  return [node];
});
const applyStyles = (element, styles) => {
  for (const property in styles)
    reactiveDo(styles[property], (value) => {
      if (value !== void 0)
        element.style.setProperty(property, value);
      else
        element.style.removeProperty(property);
    });
};
const applyClasses = (element, classes) => {
  for (const name in classes)
    reactiveDo(classes[name], (value) => {
      element.classList.toggle(name, value);
    });
};
const applyAttributes = (element, attributes) => {
  for (const name in attributes)
    reactiveDo(attributes[name], (value) => {
      if (value !== void 0)
        element.setAttribute(name, value);
      else
        element.removeAttribute(name);
    });
};
const t = (textContent) => {
  if (!textContent[isReactive])
    return document.createTextNode(textContent);
  const node = document.createTextNode(textContent.value);
  textContent.addReaction(() => {
    node.textContent = textContent.value;
  });
  return node;
};
const e = (name) => (...variadic) => {
  var _a2;
  if (isBruhChild(variadic[0])) {
    const element2 = document.createElement(name);
    element2.append(...bruhChildrenToNodes(...variadic));
    return element2;
  }
  const [props, ...children] = variadic;
  const { namespace } = (_a2 = props.bruh) != null ? _a2 : {};
  delete props.bruh;
  const element = namespace ? document.createElementNS(namespace, name) : document.createElement(name);
  if (typeof props.style === "object") {
    applyStyles(element, props.style);
    delete props.style;
  }
  if (typeof props.class === "object") {
    applyClasses(element, props.class);
    delete props.class;
  }
  applyAttributes(element, props);
  element.append(...bruhChildrenToNodes(...children));
  return element;
};
const h = (nameOrComponent, props, ...children) => {
  if (typeof nameOrComponent === "string") {
    const makeElement = e(nameOrComponent);
    return props ? makeElement(props, ...children) : makeElement(...children);
  }
  return nameOrComponent(__spreadProps(__spreadValues({}, props), { children }));
};
const JSXFragment = ({ children }) => children;
const hydrateTextNodes = () => {
  const tagged = {};
  const bruhTextNodes = document.getElementsByTagName("bruh-textnode");
  for (const bruhTextNode of bruhTextNodes) {
    const textNode = document.createTextNode(bruhTextNode.textContent);
    const tag = bruhTextNode.getAttribute("tag");
    if (tag)
      tagged[tag] = textNode;
    bruhTextNode.replaceWith(textNode);
  }
  return tagged;
};
var index_browser = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  bruhChildrenToNodes,
  applyStyles,
  applyClasses,
  applyAttributes,
  t,
  e,
  h,
  JSXFragment,
  hydrateTextNodes
});
const pipe = (x, ...fs) => fs.reduce((y, f) => f(y), x);
const dispatch = (target, type, options) => target.dispatchEvent(new CustomEvent(type, __spreadValues({
  bubbles: true,
  cancelable: true,
  composed: true
}, options)));
const createDestructable = (object, iterable) => {
  const destructable = __spreadProps(__spreadValues({}, object), {
    [Symbol.iterator]: () => iterable[Symbol.iterator]()
  });
  Object.defineProperty(destructable, Symbol.iterator, {
    enumerable: false
  });
  return destructable;
};
const functionAsObject = (f) => new Proxy({}, {
  get: (_, property) => f(property)
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  pipe,
  dispatch,
  createDestructable,
  functionAsObject
});
export { index_browser as dom, liveFragment, index$1 as reactive, index as util };
//# sourceMappingURL=bruh.es.js.map
