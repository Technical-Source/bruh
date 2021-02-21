import { h } from "./builder.mjs"
export { t, h } from "./builder.mjs"

/*
Notes:
From https://developer.mozilla.org/en-US/docs/Web/HTML/Element
I ran this:
copy(
  [...document.querySelectorAll("#content > article table")].slice(0, -1)
    .flatMap(table => [...table.querySelectorAll("td:first-of-type")])
    .map(td => td.textContent.match(/\w+/)[0])
    .flatMap(x => x.split(", "))
    .map(name => `${name} = h("${name}")`)
    .join(",\n")
)

The <var> tag is exported as `variable` because `var` is reserved
MathML is removed because it is a failed standard
*/
export const
  // Main root
  html = h("html"),
  // Document metadata
  base = h("base"),
  head = h("head"),
  link = h("link"),
  meta = h("meta"),
  style = h("style"),
  title = h("title"),
  // Sectioning root
  body = h("body"),
  // Content sectioning
  address = h("address"),
  article = h("article"),
  aside = h("aside"),
  footer = h("footer"),
  header = h("header"),
  h1 = h("h1"),
  h2 = h("h2"),
  h3 = h("h3"),
  h4 = h("h4"),
  h5 = h("h5"),
  h6 = h("h6"),
  hgroup = h("hgroup"),
  main = h("main"),
  nav = h("nav"),
  section = h("section"),
  // Text content
  blockquote = h("blockquote"),
  dd = h("dd"),
  div = h("div"),
  dl = h("dl"),
  dt = h("dt"),
  figcaption = h("figcaption"),
  figure = h("figure"),
  hr = h("hr"),
  li = h("li"),
  ol = h("ol"),
  p = h("p"),
  pre = h("pre"),
  ul = h("ul"),
  // Inline text semantics
  a = h("a"),
  abbr = h("abbr"),
  b = h("b"),
  bdi = h("bdi"),
  bdo = h("bdo"),
  br = h("br"),
  cite = h("cite"),
  code = h("code"),
  data = h("data"),
  dfn = h("dfn"),
  em = h("em"),
  i = h("i"),
  kbd = h("kbd"),
  mark = h("mark"),
  q = h("q"),
  rb = h("rb"),
  rp = h("rp"),
  rt = h("rt"),
  rtc = h("rtc"),
  ruby = h("ruby"),
  s = h("s"),
  samp = h("samp"),
  small = h("small"),
  span = h("span"),
  strong = h("strong"),
  sub = h("sub"),
  sup = h("sup"),
  time = h("time"),
  u = h("u"),
  variable = h("var"),
  wbr = h("wbr"),
  // Image and multimedia
  area = h("area"),
  audio = h("audio"),
  img = h("img"),
  map = h("map"),
  track = h("track"),
  video = h("video"),
  // Embedded content
  embed = h("embed"),
  iframe = h("iframe"),
  object = h("object"),
  param = h("param"),
  picture = h("picture"),
  portal = h("portal"),
  source = h("source"),
  // SVG
  svg = h("svg"),
  // Scripting
  canvas = h("canvas"),
  noscript = h("noscript"),
  script = h("script"),
  // Demarcating edits
  del = h("del"),
  ins = h("ins"),
  // Table content
  caption = h("caption"),
  col = h("col"),
  colgroup = h("colgroup"),
  table = h("table"),
  tbody = h("tbody"),
  td = h("td"),
  tfoot = h("tfoot"),
  th = h("th"),
  thead = h("thead"),
  tr = h("tr"),
  // Forms
  button = h("button"),
  datalist = h("datalist"),
  fieldset = h("fieldset"),
  form = h("form"),
  input = h("input"),
  label = h("label"),
  legend = h("legend"),
  meter = h("meter"),
  optgroup = h("optgroup"),
  option = h("option"),
  output = h("output"),
  progress = h("progress"),
  select = h("select"),
  textarea = h("textarea"),
  // Interactive elements
  details = h("details"),
  dialog = h("dialog"),
  menu = h("menu"),
  summary = h("summary"),
  // Web Components
  slot = h("slot"),
  template = h("template")
