/** @jsxImportSource bruh/server */
import { t } from "bruh/server"

const counterNumber = t(0).setTag("counterNumber")

export default () =>
  <button class="counter">
    Click to increment: { counterNumber }
  </button>
