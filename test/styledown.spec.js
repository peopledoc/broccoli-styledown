var assert = require('assert');
var path = require('path');
var builder = require('./builder');
var fs = require('fs');

function getPath(fileName) {
  return path.join(__dirname, fileName);
}

describe('Styledown compiler', function() {
  var tree;

  afterEach(function() {
    if (tree) {
      tree.cleanup();
    }
  });

  it('should write styledown html', function() {
    tree = builder(['./test'], {
      configMd: 'config.md',
      destFile: 'index.html'
    });

    return tree.build()
      .then(function(result) {
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
});
