export default async ({
  title = "",
  description = "",
  InHead = () => [],
  InBody = () => [],
  css = [],
  js = []
}) =>
  "<!doctype html>" +
  <html lang="en-US">
    <head>
      <title>{ title }</title>
      <meta name="description" content={ description } />

      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {
        css.map(href =>
          <link rel="stylesheet" href={ href } />
        )
      }

      {
        js.map(src =>
          <script type="module" src={ src } />
        )
      }

      <InHead />
    </head>

    <body>
      <InBody />
    </body>
  </html>
