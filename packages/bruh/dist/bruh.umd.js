var __defProp=Object.defineProperty,__defProps=Object.defineProperties,__getOwnPropDescs=Object.getOwnPropertyDescriptors,__getOwnPropSymbols=Object.getOwnPropertySymbols,__hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable,__defNormalProp=(e,t,r)=>t in e?__defProp(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,__spreadValues=(e,t)=>{for(var r in t||(t={}))__hasOwnProp.call(t,r)&&__defNormalProp(e,r,t[r]);if(__getOwnPropSymbols)for(var r of __getOwnPropSymbols(t))__propIsEnum.call(t,r)&&__defNormalProp(e,r,t[r]);return e},__spreadProps=(e,t)=>__defProps(e,__getOwnPropDescs(t));!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).bruh={})}(this,(function(e){"use strict";class t{constructor(){this.startMarker=document.createTextNode(""),this.endMarker=document.createTextNode("")}static from(e,t){const r=new this;return e.before(r.startMarker),t.after(r.endMarker),r}before(...e){this.startMarker.before(...e)}prepend(...e){this.startMarker.after(...e)}append(...e){this.endMarker.before(...e)}after(...e){this.endMarker.after(...e)}remove(){const e=document.createRange();e.setStartBefore(this.startMarker),e.setEndAfter(this.endMarker),e.deleteContents()}replaceChildren(...e){const t=document.createRange();t.setStartAfter(this.startMarker),t.setEndBefore(this.endMarker),t.deleteContents(),this.startMarker.after(...e)}replaceWith(...e){this.endMarker.after(...e),this.remove()}get childNodes(){const e=[];for(let t=this.startMarker.nextSibling;t!=this.endMarker&&t;t=t.nextSibling)e.push(t);return e}get children(){return this.childNodes.filter((e=>e instanceof HTMLElement))}}var r=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",LiveFragment:t});const o=Symbol.for("bruh reactive");class n{constructor(e){this[o]=!0,this._value=e,this._reactors=new Set}get value(){return this._value}set value(e){if(e!==this._value)return this._value=e,this.wasUpdated(),e}wasUpdated(){for(const e of this._reactors)e()}react(e){return this._reactors.add(e),()=>this._reactors.delete(e)}}const a=(e,t)=>{e[o]?e.react((()=>t(e.value))):t(e)};var s=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",Reactive:n,r:(e,t)=>{if(!t)return new n(e);const r=new n(t()),o=()=>r.value=t();for(const n of e)n.react(o);return r},reactiveDo:a});const i=(e,t)=>r=>{Array.isArray(r)?r.length?e(r[0]):t():e(r)};var d=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",pipe:(e,...t)=>t.reduce(((e,t)=>t(e)),e),dispatch:(e,t,r)=>e.dispatchEvent(new CustomEvent(t,__spreadValues({bubbles:!0,cancelable:!0,composed:!0},r))),createDestructable:(e,t)=>{const r=__spreadProps(__spreadValues({},e),{[Symbol.iterator]:()=>t[Symbol.iterator]()});return Object.defineProperty(r,Symbol.iterator,{enumerable:!1}),r},maybeDo:i,functionAsObject:e=>new Proxy({},{get:(t,r)=>e(r)})});const c=Symbol.for("bruh reactive"),l=Symbol.for("bruh meta node"),u=Symbol.for("bruh meta text node"),p=Symbol.for("bruh meta element"),h=e=>e[l]?e.node:e instanceof Node?e:document.createTextNode(e),f=e=>e.flat(1/0).flatMap((e=>{if(!e[c])return[h(e)];if(Array.isArray(e.value)){const r=new t;return e.react((()=>{r.replaceChildren(...f(e.value))})),[r.startMarker,...f(e.value),r.endMarker]}let r=h(e.value);return e.react((()=>{const t=r;r=h(e.value),t.replaceWith(r)})),[r]}));class b{constructor(e){this[l]=this[u]=!0,e[c]?(this.node=document.createTextNode(e.value),e.react((()=>{this.node.textContent=e.value}))):this.node=document.createTextNode(e)}addProperties(e={}){return Object.assign(this.node,e),this}}class _{constructor(e,t){this[l]=this[p]=!0,this.node=t?document.createElementNS(t,e):document.createElement(e)}static from(e){const t=new this("div");return t.node=e,t}addProperties(e={}){return Object.assign(this.node,e),this}addAttributes(e={}){for(const t in e)a(e[t],i((e=>this.node.setAttribute(t,e)),(()=>this.node.removeAttribute(t))));return this}addDataAttributes(e={}){for(const t in e)a(e[t],i((e=>this.node.dataset[t]=e),(()=>delete this.node.dataset[t])));return this}before(...e){this.node.before(...f(e))}prepend(...e){this.node.prepend(...f(e))}append(...e){this.node.append(...f(e))}after(...e){this.node.after(...f(e))}replaceChildren(...e){this.node.replaceChildren(...f(e))}replaceWith(...e){this.node.replaceWith(...f(e))}}var m=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",childrenToNodes:f,MetaTextNode:b,MetaElement:_,hydrateTextNodes:()=>{const e={},t=document.getElementsByTagName("bruh-textnode");for(const r of t){const t=document.createTextNode(r.textContent);r.dataset.tag&&(e[r.dataset.tag]=t),r.replaceWith(t)}return e},t:e=>new b(e),e:(e,t)=>(...r)=>{const o=new _(e,t);if("object"==typeof(n=r[0])&&null!==n?n[l]||n[c]||n instanceof Node||Array.isArray(n):"function"!=typeof n)o.append(r);else{const[e,...t]=r;o.addAttributes(e),o.append(t)}var n;return o},h:(e,t,...r)=>{if("string"==typeof e){const o=new _(e);return o.addAttributes(t||{}),o.append(r),o}return e(Object.assign({},t,{children:r}))},JSXFragment:({children:e})=>e});e.dom=m,e.liveFragment=r,e.reactive=s,e.util=d,Object.defineProperty(e,"__esModule",{value:!0}),e[Symbol.toStringTag]="Module"}));
//# sourceMappingURL=bruh.umd.js.map
