import { nodeResolve } from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default {
  input: "./src/app/hydrate.mjs",
  output: {
    file: "./dist/index.mjs",
    format: "es",
    plugins: [terser()],
    sourcemap: true
  },
  plugins: [nodeResolve()]
};
