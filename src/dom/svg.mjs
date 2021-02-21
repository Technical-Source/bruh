import { h } from "./builder.mjs"
export { t, h } from "./builder.mjs"

/*
Notes:
From https://developer.mozilla.org/en-US/docs/Web/SVG/Element
I ran this:
copy(
  [...document.querySelectorAll(".element-index > li")]
    .map(li => li.textContent.match(/\w+/)[0])
    .map(name => `${name} = (...xs) => h("${name}", "http://www.w3.org/2000/svg").append(...xs)`)
    .join(",\n")
)

The <switch> tag is exported as `svgSwitch` because `switch` is reserved
*/
export const
  a = (...xs) => h("a", "http://www.w3.org/2000/svg").append(...xs),
  animate = (...xs) => h("animate", "http://www.w3.org/2000/svg").append(...xs),
  animateMotion = (...xs) => h("animateMotion", "http://www.w3.org/2000/svg").append(...xs),
  animateTransform = (...xs) => h("animateTransform", "http://www.w3.org/2000/svg").append(...xs),
  audio = (...xs) => h("audio", "http://www.w3.org/2000/svg").append(...xs),
  canvas = (...xs) => h("canvas", "http://www.w3.org/2000/svg").append(...xs),
  circle = (...xs) => h("circle", "http://www.w3.org/2000/svg").append(...xs),
  clipPath = (...xs) => h("clipPath", "http://www.w3.org/2000/svg").append(...xs),
  defs = (...xs) => h("defs", "http://www.w3.org/2000/svg").append(...xs),
  desc = (...xs) => h("desc", "http://www.w3.org/2000/svg").append(...xs),
  discard = (...xs) => h("discard", "http://www.w3.org/2000/svg").append(...xs),
  ellipse = (...xs) => h("ellipse", "http://www.w3.org/2000/svg").append(...xs),
  feBlend = (...xs) => h("feBlend", "http://www.w3.org/2000/svg").append(...xs),
  feColorMatrix = (...xs) => h("feColorMatrix", "http://www.w3.org/2000/svg").append(...xs),
  feComponentTransfer = (...xs) => h("feComponentTransfer", "http://www.w3.org/2000/svg").append(...xs),
  feComposite = (...xs) => h("feComposite", "http://www.w3.org/2000/svg").append(...xs),
  feConvolveMatrix = (...xs) => h("feConvolveMatrix", "http://www.w3.org/2000/svg").append(...xs),
  feDiffuseLighting = (...xs) => h("feDiffuseLighting", "http://www.w3.org/2000/svg").append(...xs),
  feDisplacementMap = (...xs) => h("feDisplacementMap", "http://www.w3.org/2000/svg").append(...xs),
  feDistantLight = (...xs) => h("feDistantLight", "http://www.w3.org/2000/svg").append(...xs),
  feDropShadow = (...xs) => h("feDropShadow", "http://www.w3.org/2000/svg").append(...xs),
  feFlood = (...xs) => h("feFlood", "http://www.w3.org/2000/svg").append(...xs),
  feFuncA = (...xs) => h("feFuncA", "http://www.w3.org/2000/svg").append(...xs),
  feFuncB = (...xs) => h("feFuncB", "http://www.w3.org/2000/svg").append(...xs),
  feFuncG = (...xs) => h("feFuncG", "http://www.w3.org/2000/svg").append(...xs),
  feFuncR = (...xs) => h("feFuncR", "http://www.w3.org/2000/svg").append(...xs),
  feGaussianBlur = (...xs) => h("feGaussianBlur", "http://www.w3.org/2000/svg").append(...xs),
  feImage = (...xs) => h("feImage", "http://www.w3.org/2000/svg").append(...xs),
  feMerge = (...xs) => h("feMerge", "http://www.w3.org/2000/svg").append(...xs),
  feMergeNode = (...xs) => h("feMergeNode", "http://www.w3.org/2000/svg").append(...xs),
  feMorphology = (...xs) => h("feMorphology", "http://www.w3.org/2000/svg").append(...xs),
  feOffset = (...xs) => h("feOffset", "http://www.w3.org/2000/svg").append(...xs),
  fePointLight = (...xs) => h("fePointLight", "http://www.w3.org/2000/svg").append(...xs),
  feSpecularLighting = (...xs) => h("feSpecularLighting", "http://www.w3.org/2000/svg").append(...xs),
  feSpotLight = (...xs) => h("feSpotLight", "http://www.w3.org/2000/svg").append(...xs),
  feTile = (...xs) => h("feTile", "http://www.w3.org/2000/svg").append(...xs),
  feTurbulence = (...xs) => h("feTurbulence", "http://www.w3.org/2000/svg").append(...xs),
  filter = (...xs) => h("filter", "http://www.w3.org/2000/svg").append(...xs),
  foreignObject = (...xs) => h("foreignObject", "http://www.w3.org/2000/svg").append(...xs),
  g = (...xs) => h("g", "http://www.w3.org/2000/svg").append(...xs),
  iframe = (...xs) => h("iframe", "http://www.w3.org/2000/svg").append(...xs),
  image = (...xs) => h("image", "http://www.w3.org/2000/svg").append(...xs),
  line = (...xs) => h("line", "http://www.w3.org/2000/svg").append(...xs),
  linearGradient = (...xs) => h("linearGradient", "http://www.w3.org/2000/svg").append(...xs),
  marker = (...xs) => h("marker", "http://www.w3.org/2000/svg").append(...xs),
  mask = (...xs) => h("mask", "http://www.w3.org/2000/svg").append(...xs),
  metadata = (...xs) => h("metadata", "http://www.w3.org/2000/svg").append(...xs),
  mpath = (...xs) => h("mpath", "http://www.w3.org/2000/svg").append(...xs),
  path = (...xs) => h("path", "http://www.w3.org/2000/svg").append(...xs),
  pattern = (...xs) => h("pattern", "http://www.w3.org/2000/svg").append(...xs),
  polygon = (...xs) => h("polygon", "http://www.w3.org/2000/svg").append(...xs),
  polyline = (...xs) => h("polyline", "http://www.w3.org/2000/svg").append(...xs),
  radialGradient = (...xs) => h("radialGradient", "http://www.w3.org/2000/svg").append(...xs),
  rect = (...xs) => h("rect", "http://www.w3.org/2000/svg").append(...xs),
  script = (...xs) => h("script", "http://www.w3.org/2000/svg").append(...xs),
  set = (...xs) => h("set", "http://www.w3.org/2000/svg").append(...xs),
  stop = (...xs) => h("stop", "http://www.w3.org/2000/svg").append(...xs),
  style = (...xs) => h("style", "http://www.w3.org/2000/svg").append(...xs),
  svg = (...xs) => h("svg", "http://www.w3.org/2000/svg").append(...xs),
  svgSwitch = (...xs) => h("switch", "http://www.w3.org/2000/svg").append(...xs),
  symbol = (...xs) => h("symbol", "http://www.w3.org/2000/svg").append(...xs),
  text = (...xs) => h("text", "http://www.w3.org/2000/svg").append(...xs),
  textPath = (...xs) => h("textPath", "http://www.w3.org/2000/svg").append(...xs),
  title = (...xs) => h("title", "http://www.w3.org/2000/svg").append(...xs),
  tspan = (...xs) => h("tspan", "http://www.w3.org/2000/svg").append(...xs),
  unknown = (...xs) => h("unknown", "http://www.w3.org/2000/svg").append(...xs),
  use = (...xs) => h("use", "http://www.w3.org/2000/svg").append(...xs),
  video = (...xs) => h("video", "http://www.w3.org/2000/svg").append(...xs),
  view = (...xs) => h("view", "http://www.w3.org/2000/svg".append(...xs))
