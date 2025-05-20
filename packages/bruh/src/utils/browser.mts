import { r, type SourceNode } from "../reactive/index.mts"

export const currentUrl = r() as SourceNode<URL>

const reflectUrl = () => {
  currentUrl.value = new URL(location.href)
}
reflectUrl()

addEventListener("hashchange", reflectUrl)

declare var navigation: EventTarget
if ("navigation" in window)
  navigation.addEventListener("navigate", reflectUrl)
else {
  const replacedPushState = history.pushState
  history.pushState = function() {
    const result = replacedPushState.apply(this, arguments as any)
    reflectUrl()
    return result
  }

  const replacedReplaceState = history.replaceState
  history.replaceState = function() {
    const result = replacedReplaceState.apply(this, arguments as any)
    reflectUrl()
    return result
  }
}
