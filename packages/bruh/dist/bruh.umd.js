var ne=Object.defineProperty,se=Object.defineProperties;var oe=Object.getOwnPropertyDescriptors;var W=Object.getOwnPropertySymbols;var ae=Object.prototype.hasOwnProperty,ie=Object.prototype.propertyIsEnumerable;var C=(n,s,i)=>s in n?ne(n,s,{enumerable:!0,configurable:!0,writable:!0,value:i}):n[s]=i,R=(n,s)=>{for(var i in s||(s={}))ae.call(s,i)&&C(n,i,s[i]);if(W)for(var i of W(s))ie.call(s,i)&&C(n,i,s[i]);return n},F=(n,s)=>se(n,oe(s));var E=(n,s,i)=>(C(n,typeof s!="symbol"?s+"":s,i),i),O=(n,s,i)=>{if(!s.has(n))throw TypeError("Cannot "+i)};var a=(n,s,i)=>(O(n,s,"read from private field"),i?i.call(n):s.get(n)),u=(n,s,i)=>{if(s.has(n))throw TypeError("Cannot add the same private member more than once");s instanceof WeakSet?s.add(n):s.set(n,i)},m=(n,s,i,l)=>(O(n,s,"write to private field"),l?l.call(n,i):s.set(n,i),i);var P=(n,s,i)=>(O(n,s,"access private method"),i);(function(n,s){typeof exports=="object"&&typeof module!="undefined"?s(exports):typeof define=="function"&&define.amd?define(["exports"],s):(n=typeof globalThis!="undefined"?globalThis:n||self,s(n.bruh={}))})(this,function(n){var ce,y,g,de,p,S,k,b,A,f,M,N,j,q;"use strict";class s{constructor(){E(this,"startMarker",document.createTextNode(""));E(this,"endMarker",document.createTextNode(""))}static from(e,t){const o=new this;return e.before(o.startMarker),t.after(o.endMarker),o}before(...e){this.startMarker.before(...e)}prepend(...e){this.startMarker.after(...e)}append(...e){this.endMarker.before(...e)}after(...e){this.endMarker.after(...e)}remove(){const e=document.createRange();e.setStartBefore(this.startMarker),e.setEndAfter(this.endMarker),e.deleteContents()}replaceChildren(...e){const t=document.createRange();t.setStartAfter(this.startMarker),t.setEndBefore(this.endMarker),t.deleteContents(),this.startMarker.after(...e)}replaceWith(...e){this.endMarker.after(...e),this.remove()}get childNodes(){const e=[];for(let t=this.startMarker.nextSibling;t!=this.endMarker&&t;t=t.nextSibling)e.push(t);return e}get children(){return this.childNodes.filter(e=>e instanceof HTMLElement)}}var i=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",LiveFragment:s});const l=Symbol.for("bruh reactive");class J{constructor(e){E(this,ce,!0);u(this,y,void 0);u(this,g,new Set);m(this,y,e)}get value(){return a(this,y)}set value(e){if(e!==a(this,y)){m(this,y,e);for(const t of a(this,g))t()}}addReaction(e){return a(this,g).add(e),()=>a(this,g).delete(e)}}ce=l,y=new WeakMap,g=new WeakMap;const c=class{constructor(e,t){u(this,j);E(this,de,!0);u(this,p,void 0);u(this,S,new Set);u(this,k,void 0);u(this,b,0);u(this,A,new Set);if(!t){m(this,p,e);return}m(this,p,t()),m(this,k,t),m(this,b,Math.max(...e.map(o=>a(o,b)))+1),e.forEach(o=>a(o,A).add(this))}get value(){return a(c,f).size&&(a(this,b)!==0||a(c,f).has(this))&&c.applyUpdates(),a(this,p)}set value(e){a(this,b)===0&&(a(c,f).size||queueMicrotask(c.applyUpdates),a(c,f).set(this,e))}addReaction(e){return a(this,S).add(e),()=>a(this,S).delete(e)}static applyUpdates(){var e,t,o;if(!!a(c,f).size){for(const[d,h]of a(c,f).entries())P(e=d,j,q).call(e,h);a(c,f).clear();for(const d of a(c,M))if(d)for(const h of d)P(o=h,j,q).call(o,a(t=h,k).call(t));a(c,M).length=0;for(const d of a(c,N))d();a(c,N).length=0}}};let v=c;de=l,p=new WeakMap,S=new WeakMap,k=new WeakMap,b=new WeakMap,A=new WeakMap,f=new WeakMap,M=new WeakMap,N=new WeakMap,j=new WeakSet,q=function(e){if(e===a(this,p))return;m(this,p,e),a(c,N).push(...a(this,S));const t=a(c,M);for(const o of a(this,A)){const d=a(o,b);t[d]||(t[d]=new Set),t[d].add(o)}},u(v,f,new Map),u(v,M,[]),u(v,N,[]);const X=(r,e)=>new v(r,e),w=(r,e)=>{if(r==null?void 0:r[l])return e(r.value),r.addReaction(()=>e(r.value));e(r)};var H=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",isReactive:l,SimpleReactive:J,FunctionalReactive:v,r:X,reactiveDo:w});const I=r=>(r==null?void 0:r[l])||r instanceof Node||Array.isArray(r)||r==null||!(typeof r=="function"||typeof r=="object"),z=r=>r instanceof Node?r:document.createTextNode(r),T=(...r)=>r.flat(1/0).flatMap(e=>{if(!e[l])return[z(e)];if(Array.isArray(e.value)){const o=new s;return e.addReaction(()=>{o.replaceChildren(...T(...e.value))}),[o.startMarker,...T(...e.value),o.endMarker]}let t=z(e.value);return e.addReaction(()=>{const o=t;t=z(e.value),o.replaceWith(t)}),[t]}),_=(r,e)=>{for(const t in e)w(e[t],o=>{o!==void 0?r.style.setProperty(t,o):r.style.removeProperty(t)})},B=(r,e)=>{for(const t in e)w(e[t],o=>{r.classList.toggle(t,o)})},D=(r,e)=>{for(const t in e)w(e[t],o=>{o!==void 0?r.setAttribute(t,o):r.removeAttribute(t)})},$=r=>{if(!r[l])return document.createTextNode(r);const e=document.createTextNode(r.value);return r.addReaction(()=>{e.textContent=r.value}),e},L=r=>(...e)=>{var U;if(I(e[0])){const Q=document.createElement(r);return Q.append(...T(...e)),Q}const[t,...o]=e,{namespace:d}=(U=t.bruh)!=null?U:{};delete t.bruh;const h=d?document.createElementNS(d,r):document.createElement(r);return typeof t.style=="object"&&(_(h,t.style),delete t.style),typeof t.class=="object"&&(B(h,t.class),delete t.class),D(h,t),h.append(...T(...o)),h},G=(r,e,...t)=>{if(typeof r=="string"){const o=L(r);return e?o(e,...t):o(...t)}return r(F(R({},e),{children:t}))},K=({children:r})=>r,Y=()=>{const r={},e=document.getElementsByTagName("bruh-textnode");for(const t of e){const o=document.createTextNode(t.textContent),d=t.getAttribute("tag");d&&(r[d]=o),t.replaceWith(o)}return r};var Z=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",bruhChildrenToNodes:T,applyStyles:_,applyClasses:B,applyAttributes:D,t:$,e:L,h:G,JSXFragment:K,hydrateTextNodes:Y});const V=(r,...e)=>e.reduce((t,o)=>o(t),r),x=(r,e,t)=>r.dispatchEvent(new CustomEvent(e,R({bubbles:!0,cancelable:!0,composed:!0},t))),ee=(r,e)=>{const t=F(R({},r),{[Symbol.iterator]:()=>e[Symbol.iterator]()});return Object.defineProperty(t,Symbol.iterator,{enumerable:!1}),t},te=r=>new Proxy({},{get:(e,t)=>r(t)});var re=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",pipe:V,dispatch:x,createDestructable:ee,functionAsObject:te});n.dom=Z,n.liveFragment=i,n.reactive=H,n.util=re,Object.defineProperty(n,"__esModule",{value:!0}),n[Symbol.toStringTag]="Module"});
//# sourceMappingURL=bruh.umd.js.map
