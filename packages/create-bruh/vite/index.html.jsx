import Shell from "./shell"
import Counter from "./components/counter/render"

export default () =>
  <Shell
    title="Bruh..."
    description="Bruh Moment"
    js={ ["./index.mjs"] }
  >
    <main>
      <h1>Bruh</h1>
      <Counter />
    </main>
  </Shell>
