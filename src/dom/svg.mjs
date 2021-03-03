import { h } from "./builder.mjs"
export { t, h } from "./builder.mjs"

/*
Notes:
From https://www.w3.org/TR/SVG2/eltindex.html
I ran this:

copy(
  "export const\n" +
  [...document.querySelectorAll(".element-index > li")]
    .map(li => li.textContent.match(/\w+/)[0])
    .map(name => `  ${name} = h("${name}", "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/${name}`)
    .join("\n")
)

The <switch> tag is exported as `svgSwitch` because `switch` is reserved
*/

export const
  svg      = (...xs) => h("svg",                 "http://www.w3.org/2000/svg")  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
                          (...xs)
                          .attributes({ xmlns: "http://www.w3.org/2000/svg" }),
  a                   = h("a",                   "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/a
  animate             = h("animate",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate
  animateMotion       = h("animateMotion",       "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion
  animateTransform    = h("animateTransform",    "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateTransform
  audio               = h("audio",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/audio
  canvas              = h("canvas",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/canvas
  circle              = h("circle",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
  clipPath            = h("clipPath",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
  defs                = h("defs",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
  desc                = h("desc",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/desc
  discard             = h("discard",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/discard
  ellipse             = h("ellipse",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
  feBlend             = h("feBlend",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feBlend
  feColorMatrix       = h("feColorMatrix",       "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix
  feComponentTransfer = h("feComponentTransfer", "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer
  feComposite         = h("feComposite",         "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite
  feConvolveMatrix    = h("feConvolveMatrix",    "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feConvolveMatrix
  feDiffuseLighting   = h("feDiffuseLighting",   "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting
  feDisplacementMap   = h("feDisplacementMap",   "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap
  feDistantLight      = h("feDistantLight",      "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDistantLight
  feDropShadow        = h("feDropShadow",        "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow
  feFlood             = h("feFlood",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood
  feFuncA             = h("feFuncA",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncA
  feFuncB             = h("feFuncB",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncB
  feFuncG             = h("feFuncG",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncG
  feFuncR             = h("feFuncR",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncR
  feGaussianBlur      = h("feGaussianBlur",      "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur
  feImage             = h("feImage",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feImage
  feMerge             = h("feMerge",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMerge
  feMergeNode         = h("feMergeNode",         "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMergeNode
  feMorphology        = h("feMorphology",        "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMorphology
  feOffset            = h("feOffset",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feOffset
  fePointLight        = h("fePointLight",        "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/fePointLight
  feSpecularLighting  = h("feSpecularLighting",  "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting
  feSpotLight         = h("feSpotLight",         "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpotLight
  feTile              = h("feTile",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTile
  feTurbulence        = h("feTurbulence",        "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence
  filter              = h("filter",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter
  foreignObject       = h("foreignObject",       "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject
  g                   = h("g",                   "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g
  iframe              = h("iframe",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/iframe
  image               = h("image",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image
  line                = h("line",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
  linearGradient      = h("linearGradient",      "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient
  marker              = h("marker",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
  mask                = h("mask",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask
  metadata            = h("metadata",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/metadata
  mpath               = h("mpath",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mpath
  path                = h("path",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
  pattern             = h("pattern",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern
  polygon             = h("polygon",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon
  polyline            = h("polyline",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline
  radialGradient      = h("radialGradient",      "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient
  rect                = h("rect",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
  script              = h("script",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script
  set                 = h("set",                 "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set
  stop                = h("stop",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop
  style               = h("style",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style
  svg                 = h("svg",                 "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
  svgSwitch           = h("switch",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/switch
  symbol              = h("symbol",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol
  text                = h("text",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
  textPath            = h("textPath",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath
  title               = h("title",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/title
  tspan               = h("tspan",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan
  unknown             = h("unknown",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/unknown
  use                 = h("use",                 "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use
  video               = h("video",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/video
  view                = h("view",                "http://www.w3.org/2000/svg")  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/view