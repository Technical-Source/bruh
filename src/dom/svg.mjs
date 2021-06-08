import { e } from "./meta-node.mjs"

/*
Notes:
From https://www.w3.org/TR/SVG2/eltindex.html
I ran this:

copy(
  "export const\n" +
  [...document.querySelectorAll(".element-index > li")]
    .map(li => li.textContent.match(/\w+/)[0])
    .map(name => `  ${name} = e("${name}", "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/${name}`)
    .join("\n")
)

The <switch> tag is exported as `svgSwitch` because `switch` is reserved
*/

export const
  svg      = (...xs) => e("svg",                 "http://www.w3.org/2000/svg")  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
                          (...xs)
                          .addAttributes({
                            xmlns: "http://www.w3.org/2000/svg"
                          }),
  a                   = e("a",                   "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/a
  animate             = e("animate",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate
  animateMotion       = e("animateMotion",       "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion
  animateTransform    = e("animateTransform",    "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateTransform
  audio               = e("audio",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/audio
  canvas              = e("canvas",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/canvas
  circle              = e("circle",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
  clipPath            = e("clipPath",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
  defs                = e("defs",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
  desc                = e("desc",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/desc
  discard             = e("discard",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/discard
  ellipse             = e("ellipse",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
  feBlend             = e("feBlend",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feBlend
  feColorMatrix       = e("feColorMatrix",       "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix
  feComponentTransfer = e("feComponentTransfer", "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer
  feComposite         = e("feComposite",         "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite
  feConvolveMatrix    = e("feConvolveMatrix",    "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feConvolveMatrix
  feDiffuseLighting   = e("feDiffuseLighting",   "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting
  feDisplacementMap   = e("feDisplacementMap",   "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap
  feDistantLight      = e("feDistantLight",      "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDistantLight
  feDropShadow        = e("feDropShadow",        "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow
  feFlood             = e("feFlood",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood
  feFuncA             = e("feFuncA",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncA
  feFuncB             = e("feFuncB",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncB
  feFuncG             = e("feFuncG",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncG
  feFuncR             = e("feFuncR",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncR
  feGaussianBlur      = e("feGaussianBlur",      "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur
  feImage             = e("feImage",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feImage
  feMerge             = e("feMerge",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMerge
  feMergeNode         = e("feMergeNode",         "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMergeNode
  feMorphology        = e("feMorphology",        "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMorphology
  feOffset            = e("feOffset",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feOffset
  fePointLight        = e("fePointLight",        "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/fePointLight
  feSpecularLighting  = e("feSpecularLighting",  "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting
  feSpotLight         = e("feSpotLight",         "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpotLight
  feTile              = e("feTile",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTile
  feTurbulence        = e("feTurbulence",        "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence
  filter              = e("filter",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter
  foreignObject       = e("foreignObject",       "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject
  g                   = e("g",                   "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g
  iframe              = e("iframe",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/iframe
  image               = e("image",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image
  line                = e("line",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
  linearGradient      = e("linearGradient",      "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient
  marker              = e("marker",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
  mask                = e("mask",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask
  metadata            = e("metadata",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/metadata
  mpath               = e("mpath",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mpath
  path                = e("path",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
  pattern             = e("pattern",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern
  polygon             = e("polygon",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon
  polyline            = e("polyline",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline
  radialGradient      = e("radialGradient",      "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient
  rect                = e("rect",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
  script              = e("script",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script
  set                 = e("set",                 "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set
  stop                = e("stop",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop
  style               = e("style",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style
  svgSwitch           = e("switch",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/switch
  symbol              = e("symbol",              "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol
  text                = e("text",                "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
  textPath            = e("textPath",            "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath
  title               = e("title",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/title
  tspan               = e("tspan",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan
  unknown             = e("unknown",             "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/unknown
  use                 = e("use",                 "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use
  video               = e("video",               "http://www.w3.org/2000/svg"), // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/video
  view                = e("view",                "http://www.w3.org/2000/svg")  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/view
