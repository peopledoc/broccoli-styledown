let broccoli = require('broccoli')
let StyledownWriter = require('..')

module.exports = function (inputTrees, options) {
  let styledownCompiler = new StyledownWriter(inputTrees, options)

  return new broccoli.Builder(styledownCompiler)
}
