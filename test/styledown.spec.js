var assert = require('assert');
var path = require('path');
var builder = require('./builder');
var RSVP = require('rsvp');
var fs = require('fs');
var readFile = RSVP.denodeify(fs.readFile);
var debug = require('debug')('broccoli-styledown');

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
    tree = builder('./test', {
      configMd: 'test/config.md',
      destFile: 'index.html'
    });

    tree.build()
      .then(function(result) {
        var promises = [
          readFile(getPath('expected/index.html'), { encoding: 'utf8' }),
          readFile(result.directory + '/index.html', { encoding: 'utf8' })
        ];

        return RSVP.all(promises);
      })
      .then(function(results) {
        assert.equal(results[0].trim(), results[1].trim());
      });
  });
});
