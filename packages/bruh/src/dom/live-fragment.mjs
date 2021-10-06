// Lightweight and performant DOM fragment that keeps its place,
// useful for grouping siblings without making a parent element.
// Not a true analog of the DocumentFragment, because the implementation
// would be infeasible with that scope, adding a performance penalty as well.
// Works as long as the start & end placeholders are siblings in that order
// and they do not overlap other LiveFragment's:
// Works: (start A)(start B)(end B)(end A)
// Fails: (start A)(start B)(end A)(end B)
// Also, make sure not to call .normalize() on the parent element,
// because that would ruin the placeholders.
export class LiveFragment {
  startMarker = document.createTextNode("")
  endMarker   = document.createTextNode("")

  static from(firstNode, lastNode) {
    const liveFragment = new this()
    firstNode.before(liveFragment.startMarker)
    lastNode.after(liveFragment.endMarker)
    return liveFragment
  }

  before(...xs) {
    this.startMarker.before(...xs)
  }

  prepend(...xs) {
    this.startMarker.after(...xs)
  }

  append(...xs) {
    this.endMarker.before(...xs)
  }

  after(...xs) {
    this.endMarker.after(...xs)
  }

  remove() {
    const range = document.createRange()
    range.setStartBefore(this.startMarker)
    range.setEndAfter(this.endMarker)
    range.deleteContents()
  }

  replaceChildren(...xs) {
    const range = document.createRange()
    range.setStartAfter(this.startMarker)
    range.setEndBefore(this.endMarker)
    range.deleteContents()
    this.startMarker.after(...xs)
  }

  replaceWith(...xs) {
    this.endMarker.after(...xs)
    this.remove()
  }

  get childNodes() {
    const childNodes = []

    for (
      let currentNode = this.startMarker.nextSibling;
      currentNode != this.endMarker && currentNode;
      currentNode = currentNode.nextSibling
    )
      childNodes.push(currentNode)

    return childNodes
  }

  get children() {
    return this.childNodes
      .filter(node => node instanceof HTMLElement)
  }
}
