import { e } from "./metaNode.mjs"
export { t, e } from "./metaNode.mjs"

/*
Notes:
From https://developer.mozilla.org/en-US/docs/Web/HTML/Element
I ran this:

copy(
  "export const\n" +
  [...document.querySelectorAll("#content > article h2, #content > article h2 + div")].slice(0, -2)
    .reduce((acc, element, i) => {
      if (i % 2 == 0) {
        acc.push([element])
        return acc
      }
      else {
        acc[acc.length - 1].push(element)
        return acc
      }
    }, [])
    .map(([h2, div]) => ({
      title: h2.textContent,
      description: div.querySelector("p").textContent,
      elements: [...div.querySelectorAll("tbody tr")]
        .map(tr => [
          tr.querySelector("td:nth-child(1) a").href,
          tr.querySelector("td:nth-child(1)").textContent.match(/\w+/)[0],
          tr.querySelector("td:nth-child(2)").textContent
        ])
        .map(([link, name, description]) =>
          `  ${name} = e("${name}"), // ${link} - ${description}`
        ).join("\n")
    }))
    .map(({ title, description, elements }) => `  // ${title}${description && `\n  // ${description}`}
${elements}
`).join("\n\n")
)

The <var> tag is exported as `htmlVar` because `var` is reserved
MathML is removed because it is a failed standard
<portal> is removed because it is not on a standards track
<svg> is removed and replaced by ./svg.mjs - it also has
default xmlns attribute and correct document.createElementNS
*/

export const
  // Main root
  html       = e("html"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html             - The HTML <html> element represents the root (top-level element) of an HTML document, so it is also referred to as the root element. All other elements must be descendants of this element.


  // Document metadata
  // Metadata contains information about the page. This includes information about styles, scripts and data to help software (search engines, browsers, etc.) use and render the page. Metadata for styles and scripts may be defined in the page or link to another file that has the information. 
  base       = e("base"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base             - The HTML <base> element specifies the base URL to use for all relative URLs in a document.
  head       = e("head"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head             - The HTML <head> element contains machine-readable information (metadata) about the document, like its title, scripts, and style sheets.
  link       = e("link"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link             - The HTML External Resource Link element (<link>) specifies relationships between the current document and an external resource. This element is most commonly used to link to CSS, but is also used to establish site icons (both "favicon" style icons and icons for the home screen and apps on mobile devices) among other things.
  meta       = e("meta"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta             - The HTML <meta> element represents Metadata that cannot be represented by other HTML meta-related elements, like base, link, script, style or title.
  style      = e("style"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style            - The HTML <style> element contains style information for a document, or part of a document.
  title      = e("title"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title            - The HTML Title element (<title>) defines the document's title that is shown in a Browser's title bar or a page's tab.


  // Sectioning root
  body       = e("body"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body             - The HTML <body> Element represents the content of an HTML document. There can be only one <body> element in a document.


  // Content sectioning
  // Content sectioning elements allow you to organize the document content into logical pieces. Use the sectioning elements to create a broad outline for your page content, including header and footer navigation, and heading elements to identify sections of content.   
  address    = e("address"),    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/address          - The HTML <address> element indicates that the enclosed HTML provides contact information for a person or people, or for an organization.
  article    = e("article"),    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article          - The HTML <article> element represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable (e.g., in syndication).
  aside      = e("aside"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/aside            - The HTML <aside> element represents a portion of a document whose content is only indirectly related to the document's main content.
  footer     = e("footer"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/footer           - The HTML <footer> element represents a footer for its nearest sectioning content or sectioning root element. A footer typically contains information about the author of the section, copyright data or links to related documents.
  header     = e("header"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header           - The HTML <header> element represents introductory content, typically a group of introductory or navigational aids. It may contain some heading elements but also a logo, a search form, an author name, and other elements.
  h1         = e("h1"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements - The HTML <h1>–<h6> elements represent six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
  h2         = e("h2"),
  h3         = e("h3"),
  h4         = e("h4"),
  h5         = e("h5"),
  h6         = e("h6"),
  hgroup     = e("hgroup"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hgroup           - The HTML <hgroup> element represents a multi-level heading for a section of a document. It groups a set of <h1>–<h6> elements.
  main       = e("main"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main             - The HTML <main> element represents the dominant content of the body of a document. The main content area consists of content that is directly related to or expands upon the central topic of a document, or the central functionality of an application.
  nav        = e("nav"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav              - The HTML <nav> element represents a section of a page whose purpose is to provide navigation links, either within the current document or to other documents. Common examples of navigation sections are menus, tables of contents, and indexes.
  section    = e("section"),    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section          - The HTML <section> element represents a generic standalone section of a document, which doesn't have a more specific semantic element to represent it.


  // Text content
  // Use HTML text content elements to organize blocks or sections of content placed between the opening <body> and closing </body> tags. Important for accessibility and SEO, these elements identify the purpose or structure of that content.     
  blockquote = e("blockquote"), // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blockquote       - The HTML <blockquote> Element (or HTML Block Quotation Element) indicates that the enclosed text is an extended quotation. Usually, this is rendered visually by indentation (see Notes for how to change it). A URL for the source of the quotation may be given using the cite attribute, while a text representation of the source can be given using the cite element.
  dd         = e("dd"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dd               - The HTML <dd> element provides the description, definition, or value for the preceding term (dt) in a description list (dl).
  div        = e("div"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div              - The HTML Content Division element (<div>) is the generic container for flow content. It has no effect on the content or layout until styled in some way using CSS (e.g. styling is directly applied to it, or some kind of layout model like Flexbox is applied to its parent element).
  dl         = e("dl"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl               - The HTML <dl> element represents a description list. The element encloses a list of groups of terms (specified using the dt element) and descriptions (provided by dd elements). Common uses for this element are to implement a glossary or to display metadata (a list of key-value pairs).
  dt         = e("dt"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dt               - The HTML <dt> element specifies a term in a description or definition list, and as such must be used inside a dl element.
  figcaption = e("figcaption"), // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption       - The HTML <figcaption> or Figure Caption element represents a caption or legend describing the rest of the contents of its parent figure element.
  figure     = e("figure"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure           - The HTML <figure> (Figure With Optional Caption) element represents self-contained content, potentially with an optional caption, which is specified using the (figcaption) element.
  hr         = e("hr"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr               - The HTML <hr> element represents a thematic break between paragraph-level elements: for example, a change of scene in a story, or a shift of topic within a section.
  li         = e("li"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li               - The HTML <li> element is used to represent an item in a list.
  ol         = e("ol"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol               - The HTML <ol> element represents an ordered list of items — typically rendered as a numbered list.
  p          = e("p"),          // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p                - The HTML <p> element represents a paragraph.
  pre        = e("pre"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/pre              - The HTML <pre> element represents preformatted text which is to be presented exactly as written in the HTML file.
  ul         = e("ul"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul               - The HTML <ul> element represents an unordered list of items, typically rendered as a bulleted list.


  // Inline text semantics
  // Use the HTML inline text semantic to define the meaning, structure, or style of a word, line, or any arbitrary piece of text.
  a          = e("a"),          // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a                - The HTML <a> element (or anchor element), with its href attribute, creates a hyperlink to web pages, files, email addresses, locations in the same page, or anything else a URL can address.
  abbr       = e("abbr"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/abbr             - The HTML Abbreviation element (<abbr>) represents an abbreviation or acronym; the optional title attribute can provide an expansion or description for the abbreviation.
  b          = e("b"),          // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/b                - The HTML Bring Attention To element (<b>) is used to draw the reader's attention to the element's contents, which are not otherwise granted special importance.
  bdi        = e("bdi"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdi              - The HTML Bidirectional Isolate element (<bdi>)  tells the browser's bidirectional algorithm to treat the text it contains in isolation from its surrounding text.
  bdo        = e("bdo"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdo              - The HTML Bidirectional Text Override element (<bdo>) overrides the current directionality of text, so that the text within is rendered in a different direction.
  br         = e("br"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br               - The HTML <br> element produces a line break in text (carriage-return). It is useful for writing a poem or an address, where the division of lines is significant.
  cite       = e("cite"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/cite             - The HTML Citation element (<cite>) is used to describe a reference to a cited creative work, and must include the title of that work.
  code       = e("code"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code             - The HTML <code> element displays its contents styled in a fashion intended to indicate that the text is a short fragment of computer code.
  data       = e("data"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/data             - The HTML <data> element links a given piece of content with a machine-readable translation. If the content is time- or date-related, the time element must be used.
  dfn        = e("dfn"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dfn              - The HTML Definition element (<dfn>) is used to indicate the term being defined within the context of a definition phrase or sentence.
  em         = e("em"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em               - The HTML <em> element marks text that has stress emphasis. The <em> element can be nested, with each level of nesting indicating a greater degree of emphasis.
  i          = e("i"),          // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i                - The HTML Idiomatic Text element (<i>) represents a range of text that is set off from the normal text for some reason, such as idiomatic text, technical terms, taxonomical designations, among others.
  kbd        = e("kbd"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/kbd              - The HTML Keyboard Input element (<kbd>) represents a span of inline text denoting textual user input from a keyboard, voice input, or any other text entry device.
  mark       = e("mark"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark             - The HTML Mark Text element (<mark>) represents text which is marked or highlighted for reference or notation purposes, due to the marked passage's relevance or importance in the enclosing context.
  q          = e("q"),          // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/q                - The HTML <q> element indicates that the enclosed text is a short inline quotation. Most modern browsers implement this by surrounding the text in quotation marks.
  rb         = e("rb"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rb               - The HTML Ruby Base (<rb>) element is used to delimit the base text component of a  ruby annotation, i.e. the text that is being annotated.
  rp         = e("rp"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rp               - The HTML Ruby Fallback Parenthesis (<rp>) element is used to provide fall-back parentheses for browsers that do not support display of ruby annotations using the ruby element.
  rt         = e("rt"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rt               - The HTML Ruby Text (<rt>) element specifies the ruby text component of a ruby annotation, which is used to provide pronunciation, translation, or transliteration information for East Asian typography. The <rt> element must always be contained within a ruby element.
  rtc        = e("rtc"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rtc              - The HTML Ruby Text Container (<rtc>) element embraces semantic annotations of characters presented in a ruby of rb elements used inside of ruby element. rb elements can have both pronunciation (rt) and semantic (rtc) annotations.
  ruby       = e("ruby"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby             - The HTML <ruby> element represents small annotations that are rendered above, below, or next to base text, usually used for showing the pronunciation of East Asian characters. It can also be used for annotating other kinds of text, but this usage is less common.
  s          = e("s"),          // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/s                - The HTML <s> element renders text with a strikethrough, or a line through it. Use the <s> element to represent things that are no longer relevant or no longer accurate. However, <s> is not appropriate when indicating document edits; for that, use the del and ins elements, as appropriate.
  samp       = e("samp"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/samp             - The HTML Sample Element (<samp>) is used to enclose inline text which represents sample (or quoted) output from a computer program.
  small      = e("small"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/small            - The HTML <small> element represents side-comments and small print, like copyright and legal text, independent of its styled presentation. By default, it renders text within it one font-size smaller, such as from small to x-small.
  span       = e("span"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/span             - The HTML <span> element is a generic inline container for phrasing content, which does not inherently represent anything. It can be used to group elements for styling purposes (using the class or id attributes), or because they share attribute values, such as lang.
  strong     = e("strong"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong           - The HTML Strong Importance Element (<strong>) indicates that its contents have strong importance, seriousness, or urgency. Browsers typically render the contents in bold type.
  sub        = e("sub"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/sub              - The HTML Subscript element (<sub>) specifies inline text which should be displayed as subscript for solely typographical reasons.
  sup        = e("sup"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/sup              - The HTML Superscript element (<sup>) specifies inline text which is to be displayed as superscript for solely typographical reasons.
  time       = e("time"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time             - The HTML <time> element represents a specific period in time.
  u          = e("u"),          // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/u                - The HTML Unarticulated Annotation element (<u>) represents a span of inline text which should be rendered in a way that indicates that it has a non-textual annotation.
  htmlVar    = e("var"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/var              - The HTML Variable element (<var>) represents the name of a variable in a mathematical expression or a programming context.
  wbr        = e("wbr"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/wbr              - The HTML <wbr> element represents a word break opportunity—a position within text where the browser may optionally break a line, though its line-breaking rules would not otherwise create a break at that location.


  // Image and multimedia
  // HTML supports various multimedia resources such as images, audio, and video.
  area       = e("area"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/area             - The HTML <area> element defines an area inside an image map that has predefined clickable areas. An image map allows geometric areas on an image to be associated with Hyperlink.
  audio      = e("audio"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio            - The HTML <audio> element is used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the source element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.
  img        = e("img"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img              - The HTML <img> element embeds an image into the document.
  map        = e("map"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map              - The HTML <map> element is used with area elements to define an image map (a clickable link area).
  track      = e("track"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track            - The HTML <track> element is used as a child of the media elements, audio and video. It lets you specify timed text tracks (or time-based data), for example to automatically handle subtitles.
  video      = e("video"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video            - The HTML Video element (<video>) embeds a media player which supports video playback into the document. You can use <video> for audio content as well, but the audio element may provide a more appropriate user experience.


  // Embedded content
  // In addition to regular multimedia content, HTML can include a variety of other content, even if it's not always easy to interact with.
  embed      = e("embed"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/embed            - The HTML <embed> element embeds external content at the specified point in the document. This content is provided by an external application or other source of interactive content such as a browser plug-in.
  iframe     = e("iframe"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe           - The HTML Inline Frame element (<iframe>) represents a nested browsing context, embedding another HTML page into the current one.
  object     = e("object"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object           - The HTML <object> element represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin.
  param      = e("param"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/param            - The HTML <param> element defines parameters for an object element.
  picture    = e("picture"),    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture          - The HTML <picture> element contains zero or more source elements and one img element to offer alternative versions of an image for different display/device scenarios.
  source     = e("source"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source           - The HTML <source> element specifies multiple media resources for the picture, the audio element, or the video element.


  // Scripting
  // In order to create dynamic content and Web applications, HTML supports the use of scripting languages, most prominently JavaScript. Certain elements support this capability.
  canvas     = e("canvas"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas           - Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.
  noscript   = e("noscript"),   // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript         - The HTML <noscript> element defines a section of HTML to be inserted if a script type on the page is unsupported or if scripting is currently turned off in the browser.
  script     = e("script"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script           - The HTML <script> element is used to embed executable code or data; this is typically used to embed or refer to JavaScript code.


  // Demarcating edits
  // These elements let you provide indications that specific parts of the text have been altered.
  del        = e("del"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/del              - The HTML <del> element represents a range of text that has been deleted from a document.
  ins        = e("ins"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ins              - The HTML <ins> element represents a range of text that has been added to a document.


  // Table content
  // The elements here are used to create and handle tabular data.
  caption    = e("caption"),    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption          - The HTML <caption> element specifies the caption (or title) of a table.
  col        = e("col"),        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col              - The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a colgroup element.
  colgroup   = e("colgroup"),   // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup         - The HTML <colgroup> element defines a group of columns within a table.
  table      = e("table"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table            - The HTML <table> element represents tabular data — that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data.
  tbody      = e("tbody"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody            - The HTML Table Body element (<tbody>) encapsulates a set of table rows (tr elements), indicating that they comprise the body of the table (table).
  td         = e("td"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td               - The HTML <td> element defines a cell of a table that contains data. It participates in the table model.
  tfoot      = e("tfoot"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tfoot            - The HTML <tfoot> element defines a set of rows summarizing the columns of the table.
  th         = e("th"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th               - The HTML <th> element defines a cell as header of a group of table cells. The exact nature of this group is defined by the scope and headers attributes.
  thead      = e("thead"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead            - The HTML <thead> element defines a set of rows defining the head of the columns of the table.
  tr         = e("tr"),         // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr               - The HTML <tr> element defines a row of cells in a table. The row's cells can then be established using a mix of td (data cell) and th (header cell) elements.


  // Forms
  // HTML provides a number of elements which can be used together to create forms which the user can fill out and submit to the Web site or application. There's a great deal of further information about this available in the HTML forms guide.
  button     = e("button"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button           - The HTML <button> element represents a clickable button, used to submit forms or anywhere in a document for accessible, standard button functionality.
  datalist   = e("datalist"),   // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist         - The HTML <datalist> element contains a set of option elements that represent the permissible or recommended options available to choose from within other controls.
  fieldset   = e("fieldset"),   // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset         - The HTML <fieldset> element is used to group several controls as well as labels (label) within a web form.
  form       = e("form"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form             - The HTML <form> element represents a document section containing interactive controls for submitting information.
  input      = e("input"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input            - The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.
  label      = e("label"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label            - The HTML <label> element represents a caption for an item in a user interface.
  legend     = e("legend"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend           - The HTML <legend> element represents a caption for the content of its parent fieldset.
  meter      = e("meter"),      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter            - The HTML <meter> element represents either a scalar value within a known range or a fractional value.
  optgroup   = e("optgroup"),   // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup         - The HTML <optgroup> element creates a grouping of options within a select element.
  option     = e("option"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option           - The HTML <option> element is used to define an item contained in a select, an optgroup, or a datalist element. As such, <option> can represent menu items in popups and other lists of items in an HTML document.
  output     = e("output"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output           - The HTML Output element (<output>) is a container element into which a site or app can inject the results of a calculation or the outcome of a user action.
  progress   = e("progress"),   // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress         - The HTML <progress> element displays an indicator showing the completion progress of a task, typically displayed as a progress bar.
  select     = e("select"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select           - The HTML <select> element represents a control that provides a menu of options
  textarea   = e("textarea"),   // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea         - The HTML <textarea> element represents a multi-line plain-text editing control, useful when you want to allow users to enter a sizeable amount of free-form text, for example a comment on a review or feedback form.


  // Interactive elements
  // HTML offers a selection of elements which help to create interactive user interface objects.
  details    = e("details"),    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details          - The HTML Details Element (<details>) creates a disclosure widget in which information is visible only when the widget is toggled into an "open" state.
  dialog     = e("dialog"),     // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog           - The HTML <dialog> element represents a dialog box or other interactive component, such as a dismissible alert, inspector, or subwindow.
  menu       = e("menu"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menu             - The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.
  summary    = e("summary"),    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary          - The HTML Disclosure Summary element (<summary>) element specifies a summary, caption, or legend for a details element's disclosure box.


  // Web Components
  // Web Components is an HTML-related technology which makes it possible to, essentially, create and use custom elements as if it were regular HTML. In addition, you can create custom versions of standard HTML elements.
  slot       = e("slot"),       // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot             - The HTML <slot> element—part of the Web Components technology suite—is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.
  template   = e("template")    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template         - The HTML Content Template (<template>) element is a mechanism for holding HTML that is not to be rendered immediately when a page is loaded but may be instantiated subsequently during runtime using JavaScript.
