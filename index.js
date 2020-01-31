const fs = require('fs');
const path = require('path');
const Styledown = require('styledown');
const CachingWriter = require('broccoli-caching-writer'); // Can be done "manually", see https://broccoli.build/plugins.html#caching
const Plugin = require('broccoli-plugin');
const walkSync = require('walk-sync');

const FS_OPTIONS = { encoding: 'utf8' };
const EXTENSIONS = '(less|css|sass|scss|styl)';
const WHITELIST_REGEXP = new RegExp('\.' + EXTENSIONS + '$');
const MD_REGEXP = new RegExp('\.md$');

function getPath(srcPath, fileName) {
  return path.join(srcPath, fileName);
}

function checkFileExists(path) {
  try {
    if (!fs.statSync(path).isFile()) {
      return false;
    }
  } catch(err) {
    return false;
  }

  return true;
}
class StyledownCompiler extends Plugin {
  constructor (inputNode, options) {
    options = options || {};
    options.persistentOutput = false;
    options.needsCache = true;
    options.name = options.name || 'StyledownCompiler';
    super(inputNode, options);
  
    this.configMd = options.configMd || 'config.md';
    this.destFile = options.destFile || 'index.html';
    this.styledownOpts = options.styledown || {};
  }

  async build() {

    let extractDataPromises = this.inputPaths.map(inputPath => this.getSourceFileData(inputPath));
    let outputFile = path.join(this.outputPath, this.destFile)
    let sourceData = await Promise.all(extractDataPromises);
      
    // Combine file data arrays from all inputPaths
    sourceData = sourceData.reduce((result, data) => result.concat(data), []);
    try {

      let html = Styledown.parse(sourceData, this.styledownOpts);

      return fs.writeFileSync(outputFile, html, FS_OPTIONS);
    } catch (error) {
      console.error(`Styledown failed to create the file ${this.destFile}.`)
      console.info('Files used: ')
      sourceData.forEach(({ name }) => console.info(`  - ${name}`))
      throw error
    }
  }

  /**
   * Get all data for files in srcPath.
   *
   * @param {String} srcPath Path to read for files
   * @return {Promise} Array of all files [{ name: 'fileName', data: String }]
   */
  getSourceFileData(srcPath) {

    let filePaths = walkSync(srcPath).filter(function(fileName) {
      if (fileName.match(WHITELIST_REGEXP)) {
        return true;
      }

      return false;
    });

    // Todo: Use sort
    let filePathsMd = walkSync(srcPath)
      .filter((fileName) => (fileName !== this.configMd && fileName.match(MD_REGEXP)));

    // For some reason, Styledown chokes if the md files comes before any
    // of the CSS files
    filePaths = filePaths.concat(filePathsMd);

    // If available, add configMd at the end of the list
    if (this.configMd) {
      let configPath = getPath(srcPath, this.configMd);
      let configExists = checkFileExists(configPath);

      if (configExists) {
        filePaths = filePaths.concat(this.configMd);
      }
    }

    try {

      return filePaths.map((filePath) => ({
        data: fs.readFileSync(getPath(srcPath, filePath), FS_OPTIONS),
        name: filePath
      }));
    } catch(err) {
      console.log('Error reading source file data');
      console.error(err);
      throw(err);
    }
  };

}

module.exports = StyledownCompiler;
