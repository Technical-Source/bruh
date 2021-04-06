import { pipe } from "../util/index.mjs"
import { run, zipWith } from "../util/iterable/sync.mjs"
import { TextNodeBuilder } from "./builder.mjs"

// Unless specified, just bind to the first node in
// the document with the `data-bruh` attribute
// The node builder has to have a meta element
const rebind = (nodeBuilder, node = document.querySelector("[data-bruh]")) => {
  const { metaNode } = nodeBuilder

  // TODO: make this element replacement check have solid requirements
  const shouldReplace =
    nodeBuilder instanceof TextNodeBuilder ||
    node.localName != metaNode.name

  if (shouldReplace) {
    const replacement = nodeBuilder.toNode()
    node.replaceWith(replacement)
    node = replacement
  }
  else {
    node.bruh = metaNode.bruhFunction(node)
    Object.assign(node, metaNode.properties)

    pipe(
      [
        metaNode.childNodeBuilders
          .filter(cnb => typeof cnb != "string"), // Ignore bare text nodes
        node.children
      ],
      zipWith((cnb, cn) => rebind(cnb, cn)),
      run
    )
  }

  // Delete the meta node so that it can be garbage collected
  delete nodeBuilder.metaNode

  // Give a reference to the rebound node
  nodeBuilder.node = node
}

export default rebind
