import { pipe } from "../util/index.mjs"
import { run, zipWith } from "../util/iterable/sync.mjs"

// Unless specified, just bind to the first node in
// the document with the `data-bruh` attribute
// The node builder has to have a meta element
const rebind = (nodeBuilder, node = document.querySelector("[data-bruh]")) => {
  const { meta } = nodeBuilder

  // TODO: make this element replacement check have solid requirements
  const shouldReplace =
    nodeBuilder.hasMetaTextNode ||
    node.localName != meta.name

  if (shouldReplace) {
    const replacement = nodeBuilder.toNode()
    node.replaceWith(replacement)
    node = replacement
  }
  else {
    node.bruh = meta.bruhFunction(node)
    Object.assign(node, meta.properties)

    pipe(
      [
        meta.childNodeBuilders
          .filter(cnb => typeof cnb != "string"), // Ignore bare text nodes
        node.children
      ],
      zipWith(([cnb, cn]) => rebind(cnb, cn)),
      run
    )
  }

  // Delete the keys so that they can be garbage collected because
  // they are no longer needed but would otherwise still have references
  for (const key of Object.keys(nodeBuilder))
    delete nodeBuilder[key]

  // Give a reference to the rebound node
  nodeBuilder.node = node
}

export default rebind
