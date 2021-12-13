let assert = require('assert')
let path = require('path')
let builder = require('./builder')
let fs = require('fs')

function getPath(fileName) {
  return path.join(__dirname, fileName)
}

describe('Styledown compiler', function() {

  it('should write styledown html', async function() {
    let tree = builder(['./test/fixtures/valid'], {
      configMd: 'config.md',
      destFile: 'index.html'
    })

    await tree.build()
    let expected = fs.readFileSync(getPath('expected/index.html'), { encoding: 'utf8' })
    let result = fs.readFileSync(`${tree.outputPath  }/index.html`, { encoding: 'utf8' })
  

    assert.ok(expected, 'expected exists')
    assert.ok(result, 'generated exists')
    assert.equal(expected.trim(), result.trim(), 'matches expected')
  }).timeout(5000)

  it('Build should fail when passing errored files to Styledown', function() {

    let tree = builder(['./test/fixtures/invalid'], {
      configMd: 'config.md',
      destFile: 'index.html'
    })
    assert.rejects(tree.build())
  })

  it('Provide buildError hook that is called on build error', function(done) {
    let tree = builder(['./test/fixtures/invalid'], {
      configMd: 'config.md',
      destFile: 'index.html',
      onBuildError(error, infos) {
        assert.ok(true, 'onBuildError is called')
        assert.equal(infos.destFile, 'index.html')
        assert.ok(infos.inputPaths)
        done()
      }
    })
    tree.build().catch(() => {})
  })

  it('Throw an error when "onBuildError" option is not a function', function() {

    assert.throws(
      () => builder(['./test/fixtures/valid'], {
        configMd: 'config.md',
        destFile: 'index.html',
        onBuildError: 'foo'
      }),
      new TypeError('Option onBuildError should be a function')
    )
  })
})
