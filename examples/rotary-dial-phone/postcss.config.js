const presetEnv = require("postcss-preset-env")

module.exports = {
  plugins: [
    presetEnv({
      features: {
        "nesting-rules": true,
        "custom-selectors": true,
        "custom-media-queries": true
      }
    })
  ]
}
