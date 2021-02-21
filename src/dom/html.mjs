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
    .map(name => `${name} = (...xs) => h("${name}").append(...xs)`)
    .join(",\n")
)

The <var> tag is exported as `variable` because `var` is reserved
MathML is removed because it is a failed standard
*/
export const
  // Main root
  html = (...xs) => h("html").append(...xs),
  // Document metadata
  base = (...xs) => h("base").append(...xs),
  head = (...xs) => h("head").append(...xs),
  link = (...xs) => h("link").append(...xs),
  meta = (...xs) => h("meta").append(...xs),
  style = (...xs) => h("style").append(...xs),
  title = (...xs) => h("title").append(...xs),
  // Sectioning root
  body = (...xs) => h("body").append(...xs),
  // Content sectioning
  address = (...xs) => h("address").append(...xs),
  article = (...xs) => h("article").append(...xs),
  aside = (...xs) => h("aside").append(...xs),
  footer = (...xs) => h("footer").append(...xs),
  header = (...xs) => h("header").append(...xs),
  h1 = (...xs) => h("h1").append(...xs),
  h2 = (...xs) => h("h2").append(...xs),
  h3 = (...xs) => h("h3").append(...xs),
  h4 = (...xs) => h("h4").append(...xs),
  h5 = (...xs) => h("h5").append(...xs),
  h6 = (...xs) => h("h6").append(...xs),
  hgroup = (...xs) => h("hgroup").append(...xs),
  main = (...xs) => h("main").append(...xs),
  nav = (...xs) => h("nav").append(...xs),
  section = (...xs) => h("section").append(...xs),
  // Text content
  blockquote = (...xs) => h("blockquote").append(...xs),
  dd = (...xs) => h("dd").append(...xs),
  div = (...xs) => h("div").append(...xs),
  dl = (...xs) => h("dl").append(...xs),
  dt = (...xs) => h("dt").append(...xs),
  figcaption = (...xs) => h("figcaption").append(...xs),
  figure = (...xs) => h("figure").append(...xs),
  hr = (...xs) => h("hr").append(...xs),
  li = (...xs) => h("li").append(...xs),
  ol = (...xs) => h("ol").append(...xs),
  p = (...xs) => h("p").append(...xs),
  pre = (...xs) => h("pre").append(...xs),
  ul = (...xs) => h("ul").append(...xs),
  // Inline text semantics
  a = (...xs) => h("a").append(...xs),
  abbr = (...xs) => h("abbr").append(...xs),
  b = (...xs) => h("b").append(...xs),
  bdi = (...xs) => h("bdi").append(...xs),
  bdo = (...xs) => h("bdo").append(...xs),
  br = (...xs) => h("br").append(...xs),
  cite = (...xs) => h("cite").append(...xs),
  code = (...xs) => h("code").append(...xs),
  data = (...xs) => h("data").append(...xs),
  dfn = (...xs) => h("dfn").append(...xs),
  em = (...xs) => h("em").append(...xs),
  i = (...xs) => h("i").append(...xs),
  kbd = (...xs) => h("kbd").append(...xs),
  mark = (...xs) => h("mark").append(...xs),
  q = (...xs) => h("q").append(...xs),
  rb = (...xs) => h("rb").append(...xs),
  rp = (...xs) => h("rp").append(...xs),
  rt = (...xs) => h("rt").append(...xs),
  rtc = (...xs) => h("rtc").append(...xs),
  ruby = (...xs) => h("ruby").append(...xs),
  s = (...xs) => h("s").append(...xs),
  samp = (...xs) => h("samp").append(...xs),
  small = (...xs) => h("small").append(...xs),
  span = (...xs) => h("span").append(...xs),
  strong = (...xs) => h("strong").append(...xs),
  sub = (...xs) => h("sub").append(...xs),
  sup = (...xs) => h("sup").append(...xs),
  time = (...xs) => h("time").append(...xs),
  u = (...xs) => h("u").append(...xs),
  variable = (...xs) => h("var").append(...xs),
  wbr = (...xs) => h("wbr").append(...xs),
  // Image and multimedia
  area = (...xs) => h("area").append(...xs),
  audio = (...xs) => h("audio").append(...xs),
  img = (...xs) => h("img").append(...xs),
  map = (...xs) => h("map").append(...xs),
  track = (...xs) => h("track").append(...xs),
  video = (...xs) => h("video").append(...xs),
  // Embedded content
  embed = (...xs) => h("embed").append(...xs),
  iframe = (...xs) => h("iframe").append(...xs),
  object = (...xs) => h("object").append(...xs),
  param = (...xs) => h("param").append(...xs),
  picture = (...xs) => h("picture").append(...xs),
  portal = (...xs) => h("portal").append(...xs),
  source = (...xs) => h("source").append(...xs),
  // SVG
  svg = (...xs) => h("svg").append(...xs),
  // Scripting
  canvas = (...xs) => h("canvas").append(...xs),
  noscript = (...xs) => h("noscript").append(...xs),
  script = (...xs) => h("script").append(...xs),
  // Demarcating edits
  del = (...xs) => h("del").append(...xs),
  ins = (...xs) => h("ins").append(...xs),
  // Table content
  caption = (...xs) => h("caption").append(...xs),
  col = (...xs) => h("col").append(...xs),
  colgroup = (...xs) => h("colgroup").append(...xs),
  table = (...xs) => h("table").append(...xs),
  tbody = (...xs) => h("tbody").append(...xs),
  td = (...xs) => h("td").append(...xs),
  tfoot = (...xs) => h("tfoot").append(...xs),
  th = (...xs) => h("th").append(...xs),
  thead = (...xs) => h("thead").append(...xs),
  tr = (...xs) => h("tr").append(...xs),
  // Forms
  button = (...xs) => h("button").append(...xs),
  datalist = (...xs) => h("datalist").append(...xs),
  fieldset = (...xs) => h("fieldset").append(...xs),
  form = (...xs) => h("form").append(...xs),
  input = (...xs) => h("input").append(...xs),
  label = (...xs) => h("label").append(...xs),
  legend = (...xs) => h("legend").append(...xs),
  meter = (...xs) => h("meter").append(...xs),
  optgroup = (...xs) => h("optgroup").append(...xs),
  option = (...xs) => h("option").append(...xs),
  output = (...xs) => h("output").append(...xs),
  progress = (...xs) => h("progress").append(...xs),
  select = (...xs) => h("select").append(...xs),
  textarea = (...xs) => h("textarea").append(...xs),
  // Interactive elements
  details = (...xs) => h("details").append(...xs),
  dialog = (...xs) => h("dialog").append(...xs),
  menu = (...xs) => h("menu").append(...xs),
  summary = (...xs) => h("summary").append(...xs),
  // Web Components
  slot = (...xs) => h("slot").append(...xs),
  template = (...xs) => h("template".append(...xs))
