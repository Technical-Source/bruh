<header>
  <h1 align="center">
    <a href="https://technicalsource.dev/bruh">Bruh</a>
  </h1>
  <p align="center">The thinnest possible layer between development and production for the modern web.</p>
  <p align="center">
    <a href="https://github.com/Technical-Source/bruh/blob/main/LICENSE">
      <img
        alt="MIT License"
        src="https://img.shields.io/badge/license-MIT-blue"
      >
    </a>
    <a href="https://www.npmjs.com/package/bruh">
      <img
        alt="NPM Version"
        src="https://img.shields.io/npm/v/bruh"
      >
    </a>
    <a href="https://github.com/Technical-Source/bruh/discussions">
      <img
        alt="Github Discussions"
        src="https://img.shields.io/badge/Discussion-Welcome-blue"
      >
    </a>
  </p>
</header>

<hr>

# What's This?

A js library for the web that places your control on a pedestal.
It packs flexible SSR (Server-Side HTML Rendering),
an awesome DOM interface,
and elegant functional reactivity in a tiny code size.

_As of version 1.10.2, its [browser-specific code](https://unpkg.com/bruh@1.10.2/dist/bruh.umd.js)
is ~2.6kb minified+brotli with everything included and transpiled._

Along with modern build tooling integration ([vite](https://vitejs.dev)), you're one step away from:
- JSX and MDX (markdown with JSX instead of HTML) for both HTML rendering and DOM element creation
- Instant HMR (Hot Module Reloading) for both server rendered HTML and client CSS/JS/TS
- [Everything else vite provides](https://vitejs.dev/guide/features.html) - CSS modules, PostCSS, production builds, nearly 0 config, _&c_.

<br>

<p>
  It looks like this, which is pretty epic:

  <a href="https://codepen.io/pen/?template=eYEvQmy&editors=0010">
    <img
      alt="Open in CodePen"
      align="right"
      src="https://img.shields.io/badge/Open_in_CodePen-blue?logo=codepen"
    >
  </a>
</p>

```jsx
const Counter = () => {
  const count = r(0) // A reactive value
  const counter =
    <button class="counter">
      Click to increment: { count }
    </button>

  counter.addEventListener("click", () => count.value++)

  return counter
}

// Yes, all of these are vanilla DOM nodes!
document.body.append(
  <main>
    <h1>Bruh</h1>
    <Counter />
  </main>
)
```

# How do I Get It?

`npm init bruh` and pick [the "vite" template](https://github.com/Technical-Source/bruh/tree/main/packages/create-bruh/vite)

<p>
  Think that's too hard? 👉

  <a href="https://codesandbox.io/s/github/Technical-Source/bruh/tree/main/packages/create-bruh/vite">
    <img
      alt="Open in CodeSandbox"
      valign="middle"
      src="https://img.shields.io/badge/Preview_the_template_in_CodeSandbox-blue?logo=codesandbox"
    >
  </a>
</p>

# Where is the documentation?

[Right here](https://technicalsource.dev/bruh) - but it's not really complete.
The best way to use this project is to just read the code, it's pretty short.
If you have any questions, even without reading the code first, feel free to [ask all of them in the discussions](https://github.com/Technical-Source/bruh/discussions).
