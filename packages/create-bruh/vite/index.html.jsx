import shell from "./shell"
import Counter from "./components/counter/render"

const InBody = () =>
  <main>
    <h1>Bruh</h1>
    <Counter />
  </main>

export default () =>
  shell({
    title: "Bruh...",
    description: "Bruh Moment",
    js:  ["./index.mjs"],
    InBody
  })
