var oe=Object.defineProperty,se=Object.defineProperties;var ae=Object.getOwnPropertyDescriptors;var B=Object.getOwnPropertySymbols;var ie=Object.prototype.hasOwnProperty,de=Object.prototype.propertyIsEnumerable;var P=(o,s,i)=>s in o?oe(o,s,{enumerable:!0,configurable:!0,writable:!0,value:i}):o[s]=i,_=(o,s)=>{for(var i in s||(s={}))ie.call(s,i)&&P(o,i,s[i]);if(B)for(var i of B(s))de.call(s,i)&&P(o,i,s[i]);return o},J=(o,s)=>se(o,ae(s));var l=(o,s,i)=>(P(o,typeof s!="symbol"?s+"":s,i),i),C=(o,s,i)=>{if(!s.has(o))throw TypeError("Cannot "+i)};var a=(o,s,i)=>(C(o,s,"read from private field"),i?i.call(o):s.get(o)),u=(o,s,i)=>{if(s.has(o))throw TypeError("Cannot add the same private member more than once");s instanceof WeakSet?s.add(o):s.set(o,i)},m=(o,s,i,v)=>(C(o,s,"write to private field"),v?v.call(o,i):s.set(o,i),i);var W=(o,s,i)=>(C(o,s,"access private method"),i);(function(o,s){typeof exports=="object"&&typeof module!="undefined"?s(exports):typeof define=="function"&&define.amd?define(["exports"],s):(o=typeof globalThis!="undefined"?globalThis:o||self,s(o.bruh={}))})(this,function(o){var ce,b,M,ue,p,S,w,g,E,f,N,T,j,Q,le,he,fe,pe;"use strict";class s{constructor(){l(this,"startMarker",document.createTextNode(""));l(this,"endMarker",document.createTextNode(""))}static from(e,t){const n=new this;return e.before(n.startMarker),t.after(n.endMarker),n}before(...e){this.startMarker.before(...e)}prepend(...e){this.startMarker.after(...e)}append(...e){this.endMarker.before(...e)}after(...e){this.endMarker.after(...e)}remove(){const e=document.createRange();e.setStartBefore(this.startMarker),e.setEndAfter(this.endMarker),e.deleteContents()}replaceChildren(...e){const t=document.createRange();t.setStartAfter(this.startMarker),t.setEndBefore(this.endMarker),t.deleteContents(),this.startMarker.after(...e)}replaceWith(...e){this.endMarker.after(...e),this.remove()}get childNodes(){const e=[];for(let t=this.startMarker.nextSibling;t!=this.endMarker&&t;t=t.nextSibling)e.push(t);return e}get children(){return this.childNodes.filter(e=>e instanceof HTMLElement)}}var i=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",LiveFragment:s});const v=Symbol.for("bruh reactive");class X{constructor(e){l(this,ce,!0);u(this,b,void 0);u(this,M,new Set);m(this,b,e)}get value(){return a(this,b)}set value(e){if(e!==a(this,b)){m(this,b,e);for(const t of a(this,M))t()}}addReaction(e){return a(this,M).add(e),()=>a(this,M).delete(e)}}ce=v,b=new WeakMap,M=new WeakMap;const d=class{constructor(e,t){u(this,j);l(this,ue,!0);u(this,p,void 0);u(this,S,new Set);u(this,w,void 0);u(this,g,0);u(this,E,new Set);if(!t){m(this,p,e);return}m(this,p,t()),m(this,w,t),m(this,g,Math.max(...e.map(n=>a(n,g)))+1),e.forEach(n=>a(n,E).add(this))}get value(){return a(d,f).size&&d.applyUpdates(),a(this,p)}set value(e){a(this,g)===0&&(a(d,f).size||queueMicrotask(d.applyUpdates),a(d,f).set(this,e))}addReaction(e){return a(this,S).add(e),()=>a(this,S).delete(e)}static applyUpdates(){var e,t,n;if(!!a(d,f).size){for(const[c,k]of a(d,f).entries())W(e=c,j,Q).call(e,k);a(d,f).clear();for(const c of a(d,N))if(c)for(const k of c)W(n=k,j,Q).call(n,a(t=k,w).call(t));a(d,N).length=0;for(const c of a(d,T))c();a(d,T).length=0}}};let y=d;ue=v,p=new WeakMap,S=new WeakMap,w=new WeakMap,g=new WeakMap,E=new WeakMap,f=new WeakMap,N=new WeakMap,T=new WeakMap,j=new WeakSet,Q=function(e){if(e===a(this,p))return;m(this,p,e),a(d,T).push(...a(this,S));const t=a(d,N);for(const n of a(this,E)){const c=a(n,g);t[c]||(t[c]=new Set),t[c].add(n)}},u(y,f,new Map),u(y,N,[]),u(y,T,[]);const q=(r,e)=>new y(r,e),A=(r,e)=>{if(r==null?void 0:r[v])return e(r.value),r.addReaction(()=>e(r.value));e(r)};var $=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",SimpleReactive:X,FunctionalReactive:y,r:q,reactiveDo:A});const H=(r,...e)=>e.reduce((t,n)=>n(t),r),I=(r,e,t)=>r.dispatchEvent(new CustomEvent(e,_({bubbles:!0,cancelable:!0,composed:!0},t))),G=(r,e)=>{const t=J(_({},r),{[Symbol.iterator]:()=>e[Symbol.iterator]()});return Object.defineProperty(t,Symbol.iterator,{enumerable:!1}),t},R=(r,e)=>t=>{Array.isArray(t)?t.length?r(t[0]):e():r(t)},K=r=>new Proxy({},{get:(e,t)=>r(t)});var Y=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",pipe:H,dispatch:I,createDestructable:G,maybeDo:R,functionAsObject:K});const z=Symbol.for("bruh reactive"),O=Symbol.for("bruh meta node"),L=Symbol.for("bruh meta element"),Z=r=>(r==null?void 0:r[O])||(r==null?void 0:r[z])||r instanceof Node||Array.isArray(r)||r==null||!(typeof r=="function"||typeof r=="object"),D=r=>r[O]?r.node:r instanceof Node?r:document.createTextNode(r),h=r=>r.flat(1/0).flatMap(e=>{if(!e[z])return[D(e)];if(Array.isArray(e.value)){const n=new s;return e.addReaction(()=>{n.replaceChildren(...h(e.value))}),[n.startMarker,...h(e.value),n.endMarker]}let t=D(e.value);return e.addReaction(()=>{const n=t;t=D(e.value),n.replaceWith(t)}),[t]});class U{constructor(e){l(this,le,!0);l(this,he,!0);l(this,"node");if(!e[z]){this.node=document.createTextNode(e);return}this.node=document.createTextNode(e.value),e.addReaction(()=>{this.node.textContent=e.value})}addProperties(e={}){return Object.assign(this.node,e),this}}le=O,he=L;class F{constructor(e,t){l(this,fe,!0);l(this,pe,!0);l(this,"node");this.node=t?document.createElementNS(t,e):document.createElement(e)}static from(e){const t=new this("div");return t.node=e,t}addProperties(e={}){return Object.assign(this.node,e),this}addAttributes(e={}){for(const t in e)A(e[t],R(n=>this.node.setAttribute(t,n),()=>this.node.removeAttribute(t)));return this}addDataAttributes(e={}){for(const t in e)A(e[t],R(n=>this.node.dataset[t]=n,()=>delete this.node.dataset[t]));return this}addStyles(e={}){for(const t in e)A(e[t],R(n=>this.node.style.setProperty(t,n),()=>this.node.style.removeProperty(t)));return this}toggleClasses(e={}){for(const t in e)A(e[t],n=>this.node.classList.toggle(t,n));return this}before(...e){this.node.before(...h(e))}prepend(...e){this.node.prepend(...h(e))}append(...e){this.node.append(...h(e))}after(...e){this.node.after(...h(e))}replaceChildren(...e){this.node.replaceChildren(...h(e))}replaceWith(...e){this.node.replaceWith(...h(e))}}fe=O,pe=L;const V=()=>{const r={},e=document.getElementsByTagName("bruh-textnode");for(const t of e){const n=document.createTextNode(t.textContent);t.dataset.tag&&(r[t.dataset.tag]=n),t.replaceWith(n)}return r},x=r=>new U(r),ee=(r,e)=>(...t)=>{const n=new F(r,e);if(Z(t[0]))n.append(t);else{const[c,...k]=t;n.addAttributes(c),n.append(k)}return n},te=(r,e,...t)=>{if(typeof r=="string"){const n=new F(r);return n.addAttributes(e||{}),n.append(t),n}return r(Object.assign({},e,{children:t}))},re=({children:r})=>r;var ne=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",childrenToNodes:h,MetaTextNode:U,MetaElement:F,hydrateTextNodes:V,t:x,e:ee,h:te,JSXFragment:re});o.dom=ne,o.liveFragment=i,o.reactive=$,o.util=Y,Object.defineProperty(o,"__esModule",{value:!0}),o[Symbol.toStringTag]="Module"});
//# sourceMappingURL=bruh.umd.js.map
