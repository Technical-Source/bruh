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
var _a, _value, _reactions, _b, _value2, _reactions2, _f, _depth, _derivatives, _settersQueue, _derivativesQueue, _reactionsQueue, _applyUpdate, applyUpdate_fn, _c, _d, _e, _f2;
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
const isReactive$1 = Symbol.for("bruh reactive");
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
_a = isReactive$1;
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
    var _a2, _b2, _c2;
    if (!__privateGet(_FunctionalReactive, _settersQueue).size)
      return;
    for (const [sourceNode, newValue] of __privateGet(_FunctionalReactive, _settersQueue).entries())
      __privateMethod(_a2 = sourceNode, _applyUpdate, applyUpdate_fn).call(_a2, newValue);
    __privateGet(_FunctionalReactive, _settersQueue).clear();
    for (const depthSet of __privateGet(_FunctionalReactive, _derivativesQueue))
      if (depthSet)
        for (const derivative of depthSet)
          __privateMethod(_c2 = derivative, _applyUpdate, applyUpdate_fn).call(_c2, __privateGet(_b2 = derivative, _f).call(_b2));
    __privateGet(_FunctionalReactive, _derivativesQueue).length = 0;
    for (const reaction of __privateGet(_FunctionalReactive, _reactionsQueue))
      reaction();
    __privateGet(_FunctionalReactive, _reactionsQueue).length = 0;
  }
};
let FunctionalReactive = _FunctionalReactive;
_b = isReactive$1;
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
  if (x == null ? void 0 : x[isReactive$1]) {
    f(x.value);
    return x.addReaction(() => f(x.value));
  }
  f(x);
};
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  SimpleReactive,
  FunctionalReactive,
  r,
  reactiveDo
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
const maybeDo = (existsThen, emptyThen) => (x) => {
  if (Array.isArray(x)) {
    if (x.length)
      existsThen(x[0]);
    else
      emptyThen();
  } else
    existsThen(x);
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
  maybeDo,
  functionAsObject
});
const isReactive = Symbol.for("bruh reactive");
const isMetaNode = Symbol.for("bruh meta node");
const isMetaTextNode = Symbol.for("bruh meta text node");
const isMetaElement = Symbol.for("bruh meta element");
const isMetaNodeChild = (x) => (x == null ? void 0 : x[isMetaNode]) || (x == null ? void 0 : x[isReactive]) || x instanceof Node || Array.isArray(x) || x == null || !(typeof x === "function" || typeof x === "object");
const toNode = (x) => {
  if (x[isMetaNode])
    return x.node;
  if (x instanceof Node)
    return x;
  return document.createTextNode(x);
};
const childrenToNodes = (children) => children.flat(Infinity).flatMap((child) => {
  if (!child[isReactive])
    return [toNode(child)];
  if (Array.isArray(child.value)) {
    const liveFragment2 = new LiveFragment();
    child.addReaction(() => {
      liveFragment2.replaceChildren(...childrenToNodes(child.value));
    });
    return [liveFragment2.startMarker, ...childrenToNodes(child.value), liveFragment2.endMarker];
  }
  let node = toNode(child.value);
  child.addReaction(() => {
    const oldNode = node;
    node = toNode(child.value);
    oldNode.replaceWith(node);
  });
  return [node];
});
class MetaTextNode {
  constructor(textContent) {
    __publicField(this, _c, true);
    __publicField(this, _d, true);
    __publicField(this, "node");
    if (!textContent[isReactive]) {
      this.node = document.createTextNode(textContent);
      return;
    }
    this.node = document.createTextNode(textContent.value);
    textContent.addReaction(() => {
      this.node.textContent = textContent.value;
    });
  }
  addProperties(properties = {}) {
    Object.assign(this.node, properties);
    return this;
  }
}
_c = isMetaNode, _d = isMetaTextNode;
class MetaElement {
  constructor(name, namespace) {
    __publicField(this, _e, true);
    __publicField(this, _f2, true);
    __publicField(this, "node");
    this.node = namespace ? document.createElementNS(namespace, name) : document.createElement(name);
  }
  static from(element) {
    const result = new this("div");
    result.node = element;
    return result;
  }
  addProperties(properties = {}) {
    Object.assign(this.node, properties);
    return this;
  }
  addAttributes(attributes = {}) {
    for (const name in attributes)
      reactiveDo(attributes[name], maybeDo((value) => this.node.setAttribute(name, value), () => this.node.removeAttribute(name)));
    return this;
  }
  addDataAttributes(dataAttributes = {}) {
    for (const name in dataAttributes)
      reactiveDo(dataAttributes[name], maybeDo((value) => this.node.dataset[name] = value, () => delete this.node.dataset[name]));
    return this;
  }
  addStyles(styles = {}) {
    for (const property in styles)
      reactiveDo(styles[property], maybeDo((value) => this.node.style.setProperty(property, value), () => this.node.style.removeProperty(property)));
    return this;
  }
  toggleClasses(classes = {}) {
    for (const name in classes)
      reactiveDo(classes[name], (value) => this.node.classList.toggle(name, value));
    return this;
  }
  before(...xs) {
    this.node.before(...childrenToNodes(xs));
  }
  prepend(...xs) {
    this.node.prepend(...childrenToNodes(xs));
  }
  append(...xs) {
    this.node.append(...childrenToNodes(xs));
  }
  after(...xs) {
    this.node.after(...childrenToNodes(xs));
  }
  replaceChildren(...xs) {
    this.node.replaceChildren(...childrenToNodes(xs));
  }
  replaceWith(...xs) {
    this.node.replaceWith(...childrenToNodes(xs));
  }
}
_e = isMetaNode, _f2 = isMetaElement;
const hydrateTextNodes = () => {
  const tagged = {};
  const bruhTextNodes = document.getElementsByTagName("bruh-textnode");
  for (const bruhTextNode of bruhTextNodes) {
    const textNode = document.createTextNode(bruhTextNode.textContent);
    if (bruhTextNode.dataset.tag)
      tagged[bruhTextNode.dataset.tag] = textNode;
    bruhTextNode.replaceWith(textNode);
  }
  return tagged;
};
const createMetaTextNode = (textContent) => new MetaTextNode(textContent);
const createMetaElement = (name, namespace) => (...variadic) => {
  const meta = new MetaElement(name, namespace);
  if (!isMetaNodeChild(variadic[0])) {
    const [attributes, ...children] = variadic;
    meta.addAttributes(attributes);
    meta.append(children);
  } else {
    meta.append(variadic);
  }
  return meta;
};
const createMetaElementJSX = (nameOrComponent, attributesOrProps, ...children) => {
  if (typeof nameOrComponent == "string") {
    const meta = new MetaElement(nameOrComponent);
    meta.addAttributes(attributesOrProps || {});
    meta.append(children);
    return meta;
  }
  return nameOrComponent(Object.assign({}, attributesOrProps, { children }));
};
const JSXFragment = ({ children }) => children;
var index_browser = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  childrenToNodes,
  MetaTextNode,
  MetaElement,
  hydrateTextNodes,
  t: createMetaTextNode,
  e: createMetaElement,
  h: createMetaElementJSX,
  JSXFragment
});
export { index_browser as dom, liveFragment, index$1 as reactive, index as util };
//# sourceMappingURL=bruh.es.js.map
