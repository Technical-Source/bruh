const hydrateOptimizedPictures = (className = "bruh-optimized-picture") =>
  document.querySelectorAll<HTMLImageElement>(`.${className} > img`)
    .forEach(img => {
      const removeLQIP = () => img.removeAttribute("style")

      if (img.complete)
        removeLQIP()
      else
        img.addEventListener("load", removeLQIP, { once: true })
    })

export default hydrateOptimizedPictures
