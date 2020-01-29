var fs = require('fs');
var path = require('path');
var Styledown = require('styledown');
var CachingWriter = require('broccoli-caching-writer'); // Can be done "manually", see https://broccoli.build/plugins.html#caching
const Plugin = require('broccoli-plugin');
var walkSync = require('walk-sync');
var debug = require('debug')('broccoli-styledown');

var FS_OPTIONS = { encoding: 'utf8' };
var EXTENSIONS = '(less|css|sass|scss|styl)';
var WHITELIST_REGEXP = new RegExp('\.' + EXTENSIONS + '$');
var MD_REGEXP = new RegExp('\.md$');

function getPath(srcPath, fileName) {
  return path.join(srcPath, fileName);
}

function checkFileExists(path) {
  try {
    if (!fs.statSync(path).isFile()) {
      debug('Path is not a file');
      return false;
    }
  } catch(err) {
    debug('File not found', path);
    return false;
  }

  return true;
}
class StyledownCompiler extends Plugin {
  constructor (inputNode, options) {
    options = options || {};
    options.persistentOutput = false;
    options.needsCache = true;
    options.name = 'StyledownCompiler';
    super(inputNode, options);
  
    this.options = options;
    this.configMd = options.configMd || 'config.md';
    this.destFile = options.destFile || 'index.html';
    this.styledown = options.styledown || {};
  }

  build() {
  
    var styledownOpts = this.styledown || {};
    var destFile = this.destFile;
    var outputPath = this.outputPath;
  
    var srcDataPromises = this.inputPaths.map(function(inputPath) {
      return this.getSourceFileData(inputPath);
    }, this);
  
    return Promise.all(srcDataPromises).then(function(srcDataArrays) {
      // Combine file data arrays from all inputPaths
      var srcData = srcDataArrays.reduce(function(result, srcDataArray) {
        return result.concat(srcDataArray);
      }, []);
  
      var html = Styledown.parse(srcData, styledownOpts);
  
      return fs.writeFileSync(path.join(outputPath, destFile), html, FS_OPTIONS);
    })
    .catch(function(err) {
      debug(err);
    });
  }

  /**
   * Get all data for files in srcPath.
   *
   * @param {String} srcPath Path to read for files
   * @return {Promise} Array of all files [{ name: 'fileName', data: String }]
   */
  getSourceFileData(srcPath) {
    var configMd = this.configMd;
    debug('srcPath', srcPath);

    var filePaths = walkSync(srcPath).filter(function(fileName) {
      if (fileName.match(WHITELIST_REGEXP)) {
        return true;
      }

      return false;
    });

    var filePathsMd = walkSync(srcPath).filter(function(fileName) {
      if (fileName !== configMd && fileName.match(MD_REGEXP)) {
        debug('detected markdown', fileName);
        return true;
      }

      return false;
    });

    // For some reason, Styledown chokes if the md files comes before any
    // of the CSS files
    filePaths = filePaths.concat(filePathsMd);

    // If available, add configMd at the end of the list
    if (configMd) {
      var configPath = getPath(srcPath, configMd);
      var configExists = checkFileExists(configPath);

      if (configExists) {
        debug('Config file found', configPath);
        filePaths = filePaths.concat(configMd);
      }
    }


    let readPromises = filePaths.map(function(filePath) {
      let data = fs.readFileSync(getPath(srcPath, filePath), FS_OPTIONS)
      return { name: filePath, data: data };
    });

    return Promise.all(readPromises)
      .catch(function(err) {
        console.log('Error reading source file data');
        console.error(err);
        throw(err);
      });
  };

}

module.exports = StyledownCompiler;
