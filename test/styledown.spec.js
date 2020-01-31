var assert = require('assert');
var path = require('path');
var builder = require('./builder');
var fs = require('fs');

function getPath(fileName) {
  return path.join(__dirname, fileName);
}

describe('Styledown compiler', function() {

  it('should write styledown html', function() {
    let tree = builder(['./test/fixtures/valid'], {
      configMd: 'config.md',
      destFile: 'index.html'
    });

    return tree.build()
      .then(function() {
        var promises = [
          fs.readFileSync(getPath('expected/index.html'), { encoding: 'utf8' }),
          fs.readFileSync(tree.outputPath + '/index.html', { encoding: 'utf8' })
        ];

        return Promise.all(promises);
      })
      .then(function(results) {
        var expected = results[0].trim();
        var result = results[1].trim();

        assert.ok(expected, 'expected exists');
        assert.ok(result, 'generated exists');
        assert.equal(expected, result, 'matches expected');
      });
  });

  it('Build should fail when passing errored files to Styledown', function() {

    let tree = builder(['./test/fixtures/invalid'], {
      configMd: 'config.md',
      destFile: 'index.html'
    });
    assert.rejects(tree.build());
  })

  it('Provide buildError hook that is called on build error', function(done) {
    let tree = builder(['./test/fixtures/invalid'], {
      configMd: 'config.md',
      destFile: 'index.html',
      onBuildError(error, infos) {
        assert.ok(true, 'onBuildError is called')
        assert.equal(infos.destFile, 'index.html')
        assert.ok(infos.inputPaths)
        done();
      }
    });
    tree.build().catch(() => {})
  })
});
