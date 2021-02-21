import { h } from "./builder.mjs"
export { t, h } from "./builder.mjs"

/*
Notes:
From https://developer.mozilla.org/en-US/docs/Web/SVG/Element
I ran this:
copy(
  [...document.querySelectorAll(".element-index > li")]
    .map(li => li.textContent.match(/\w+/)[0])
    .map(name => `${name} = h("${name}", "http://www.w3.org/2000/svg")`)
    .join(",\n")
)

The <switch> tag is exported as `svgSwitch` because `switch` is reserved
*/
export const
  svg = (...xs) => h("svg", "http://www.w3.org/2000/svg")(...xs).attributes({ xmlns: "http://www.w3.org/2000/svg" }),
  a = h("a", "http://www.w3.org/2000/svg"),
  animate = h("animate", "http://www.w3.org/2000/svg"),
  animateMotion = h("animateMotion", "http://www.w3.org/2000/svg"),
  animateTransform = h("animateTransform", "http://www.w3.org/2000/svg"),
  audio = h("audio", "http://www.w3.org/2000/svg"),
  canvas = h("canvas", "http://www.w3.org/2000/svg"),
  circle = h("circle", "http://www.w3.org/2000/svg"),
  clipPath = h("clipPath", "http://www.w3.org/2000/svg"),
  defs = h("defs", "http://www.w3.org/2000/svg"),
  desc = h("desc", "http://www.w3.org/2000/svg"),
  discard = h("discard", "http://www.w3.org/2000/svg"),
  ellipse = h("ellipse", "http://www.w3.org/2000/svg"),
  feBlend = h("feBlend", "http://www.w3.org/2000/svg"),
  feColorMatrix = h("feColorMatrix", "http://www.w3.org/2000/svg"),
  feComponentTransfer = h("feComponentTransfer", "http://www.w3.org/2000/svg"),
  feComposite = h("feComposite", "http://www.w3.org/2000/svg"),
  feConvolveMatrix = h("feConvolveMatrix", "http://www.w3.org/2000/svg"),
  feDiffuseLighting = h("feDiffuseLighting", "http://www.w3.org/2000/svg"),
  feDisplacementMap = h("feDisplacementMap", "http://www.w3.org/2000/svg"),
  feDistantLight = h("feDistantLight", "http://www.w3.org/2000/svg"),
  feDropShadow = h("feDropShadow", "http://www.w3.org/2000/svg"),
  feFlood = h("feFlood", "http://www.w3.org/2000/svg"),
  feFuncA = h("feFuncA", "http://www.w3.org/2000/svg"),
  feFuncB = h("feFuncB", "http://www.w3.org/2000/svg"),
  feFuncG = h("feFuncG", "http://www.w3.org/2000/svg"),
  feFuncR = h("feFuncR", "http://www.w3.org/2000/svg"),
  feGaussianBlur = h("feGaussianBlur", "http://www.w3.org/2000/svg"),
  feImage = h("feImage", "http://www.w3.org/2000/svg"),
  feMerge = h("feMerge", "http://www.w3.org/2000/svg"),
  feMergeNode = h("feMergeNode", "http://www.w3.org/2000/svg"),
  feMorphology = h("feMorphology", "http://www.w3.org/2000/svg"),
  feOffset = h("feOffset", "http://www.w3.org/2000/svg"),
  fePointLight = h("fePointLight", "http://www.w3.org/2000/svg"),
  feSpecularLighting = h("feSpecularLighting", "http://www.w3.org/2000/svg"),
  feSpotLight = h("feSpotLight", "http://www.w3.org/2000/svg"),
  feTile = h("feTile", "http://www.w3.org/2000/svg"),
  feTurbulence = h("feTurbulence", "http://www.w3.org/2000/svg"),
  filter = h("filter", "http://www.w3.org/2000/svg"),
  foreignObject = h("foreignObject", "http://www.w3.org/2000/svg"),
  g = h("g", "http://www.w3.org/2000/svg"),
  iframe = h("iframe", "http://www.w3.org/2000/svg"),
  image = h("image", "http://www.w3.org/2000/svg"),
  line = h("line", "http://www.w3.org/2000/svg"),
  linearGradient = h("linearGradient", "http://www.w3.org/2000/svg"),
  marker = h("marker", "http://www.w3.org/2000/svg"),
  mask = h("mask", "http://www.w3.org/2000/svg"),
  metadata = h("metadata", "http://www.w3.org/2000/svg"),
  mpath = h("mpath", "http://www.w3.org/2000/svg"),
  path = h("path", "http://www.w3.org/2000/svg"),
  pattern = h("pattern", "http://www.w3.org/2000/svg"),
  polygon = h("polygon", "http://www.w3.org/2000/svg"),
  polyline = h("polyline", "http://www.w3.org/2000/svg"),
  radialGradient = h("radialGradient", "http://www.w3.org/2000/svg"),
  rect = h("rect", "http://www.w3.org/2000/svg"),
  script = h("script", "http://www.w3.org/2000/svg"),
  set = h("set", "http://www.w3.org/2000/svg"),
  stop = h("stop", "http://www.w3.org/2000/svg"),
  style = h("style", "http://www.w3.org/2000/svg"),
  svgSwitch = h("switch", "http://www.w3.org/2000/svg"),
  symbol = h("symbol", "http://www.w3.org/2000/svg"),
  text = h("text", "http://www.w3.org/2000/svg"),
  textPath = h("textPath", "http://www.w3.org/2000/svg"),
  title = h("title", "http://www.w3.org/2000/svg"),
  tspan = h("tspan", "http://www.w3.org/2000/svg"),
  unknown = h("unknown", "http://www.w3.org/2000/svg"),
  use = h("use", "http://www.w3.org/2000/svg"),
  video = h("video", "http://www.w3.org/2000/svg"),
  view = h("view", "http://www.w3.org/2000/svg")
