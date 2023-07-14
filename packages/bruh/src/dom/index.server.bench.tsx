/** @jsxImportSource bruh/server */
import { describe, bench } from "vitest"
import {
  applyStyles,
  applyClasses,
  applyAttributes,
  rawString,
  t,
  MetaDocument
} from "./index.server.mts"
import { Readable } from 'node:stream'

describe("Server DOM", () => {
  const smallDocument = new MetaDocument(
    <html>
      <head></head>
      <body></body>
    </html>
  )

  const smallDeferredDocument = new MetaDocument(({ defer, deferred, replaceDeferredScript }) =>
    <html>
      <head>
        {replaceDeferredScript}
      </head>
      <body>
        {
          defer({
            placeholder: id =>
              <span id={id}>loading...</span>,

            content: Promise.resolve(<>loaded content</>)
          })
        }

        {deferred}
      </body>
    </html>
  )

  const bigDocument = new MetaDocument(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My Sample Website</title>
        <link rel="stylesheet" href="styles.css" />
      </head>
      <body>
        <header class="main-header">
          <nav aria-label="Main navigation">
            <ul class="nav-list">
              <li><a href="/" class="nav-link" aria-current="page">Home</a></li>
              <li><a href="/about" class="nav-link">About</a></li>
              <li><a href="/contact" class="nav-link">Contact</a></li>
            </ul>
          </nav>
        </header>

        <main>
          <article class="featured-article">
            <header>
              <h1>Welcome to Our Website</h1>
              <p class="article-meta">Published on <time datetime="2023-06-15">June 15, 2023</time></p>
            </header>

            <section class="intro-section">
              <h2>Getting Started</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

              <figure>
                <img src="/images/sample.jpg" alt="Descriptive image caption" width="800" height="400" />
                <figcaption>An example image showing our product in action</figcaption>
              </figure>
            </section>

            {Array.from(new Array(50), (() =>
              <section class="features">
                <h2>Key Features</h2>
                <ul>
                  <li>Responsive design</li>
                  <li>Semantic HTML structure</li>
                  <li>Accessibility features</li>
                </ul>
              </section>
            ))}

            <aside class="related-content">
              <h3>Related Articles</h3>
              <ul>
                <li><a href="/article-1">Understanding Web Standards</a></li>
                <li><a href="/article-2">Modern CSS Techniques</a></li>
              </ul>
            </aside>
          </article>

          <section class="cta-section">
            <h2>Join Our Newsletter</h2>
            <form class="newsletter-form" action="/subscribe" method="POST">
              <label for="email">Email Address:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
              />
              <button type="submit" class="btn-primary">Subscribe</button>
            </form>
          </section>
        </main>

        <footer class="site-footer">
          <div class="footer-content">
            <section class="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/sitemap">Sitemap</a></li>
              </ul>
            </section>

            <section class="social-links">
              <h4>Follow Us</h4>
              <ul>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </li>
              </ul>
            </section>

            <p class="copyright">
              © {new Date().getFullYear()} My Sample Website. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )

  describe.each([
    { document: smallDocument, name: "small" },
    { document: smallDeferredDocument, name: "small deferred" },
    { document: bigDocument, name: "big" },
  ])("$name document", ({ document }) => {
    describe("string", () => {
      bench("sync", () => {
        document.toString()
      })

      bench("async", async () => {
        await document.toStringPromise()
      })
    })

    describe("Stream", () => {
      bench("ReadableStream.from() with TextEncoderStream", async () => {
        const stream =
          // @ts-ignore
          ReadableStream.from(document)
            .pipeThrough(new TextEncoderStream())

        for await (const _ of stream) {}
      })

      bench("Document toStream()", async () => {
        const stream = document.toStream()

        // @ts-ignore
        for await (const _ of stream) {}
      })

      bench("node Readable stream", async () => {
        const asyncIterator = document[Symbol.asyncIterator]()
        const stream = new Readable({
          async read() {
            const { value, done } = await asyncIterator.next()
            if (done) {
              this.push(null)
              return
            }

            this.push(value)
          }
        })

        for await (const _ of stream) {}
      })

      bench("node Readable.from()", async () => {
        const stream = Readable.from(document)

        for await (const _ of stream) {}
      })
    })
  })
})
