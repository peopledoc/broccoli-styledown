const Styledown = require('@peopledoc/styledown');
const Plugin = require('broccoli-plugin');
const walkSync = require('walk-sync');
const FSTree = require('fs-tree-diff');

const FS_OPTIONS = { encoding: 'utf8' };
const EXTENSIONS = ['less', 'css', 'sass', 'scss', 'styl'];
const WHITELIST_GLOB_REGEXP = `**/*.{${EXTENSIONS.join(',')}}`;


class StyledownCompiler extends Plugin {
  constructor (inputNode, options) {
    options = options || {};
    options.persistentOutput = true;
    options.needsCache = true;
    options.name = options.displayName ? `StyledownCompiler - ${options.displayName}` : 'StyledownCompiler';
    super(inputNode, options);

    this.configMd = options.configMd || 'config.md';
    this.destFile = options.destFile || 'index.html';
    this.styledownOpts = options.styledown || {};
    if (options.onBuildError) {
      if (typeof options.onBuildError !== "function") {
        throw new TypeError('Option onBuildError should be a function')
      }
      this.onBuildError = options.onBuildError;
    }
    this._cached = [];
  }
  _hasChanged() {
    let changed = false;
    for (let inputPath of this.inputPaths) {
      const current = FSTree.fromEntries(walkSync.entries(inputPath));
      const patch = current.calculatePatch(this._cached[inputPath] || []);
      this._cached[inputPath] = current;

      if (patch.length) {
        changed = true;
      }
    }

    return changed;
  }

  async build() {
    if (!this._hasChanged()) { // do this for each transformations
      return;
    }
    let sourceFileData = this.getSourceFileData()
    let sourceData = sourceFileData.reduce((result, data) => result.concat(data), []);
    try {
      let html = Styledown.parse(sourceData, this.styledownOpts);
      return this.output.writeFileSync(this.destFile, html, FS_OPTIONS);
    } catch (error) {
      if (this.onBuildError) {
        this.onBuildError(
          error, {
            destFile: this.destFile,
            inputPaths: sourceFileData.map(({ name }) => name)
          })
      }
      throw error
    }
  }

  /**
   * Get all data for files in srcPath.
   *
   * @return {Promise} Array of all files [{ name: 'fileName', data: String }]
   */
  getSourceFileData() {

    let filePaths = this.input.entries('', { globs: [WHITELIST_GLOB_REGEXP]})
      .map(file => file.relativePath);


    // Todo: Use sort
    let filePathsMd = this.input.entries('', { globs: ["**/*.md"]})
      .filter(({ relativePath }) => (relativePath !== this.configMd))
      .map(file => file.relativePath);
    // For some reason, Styledown chokes if the md files comes before any
    // of the CSS files
    filePaths = filePaths.concat(filePathsMd);

    // If available, add configMd at the end of the list
    if (this.input.existsSync(this.configMd)) {
      filePaths = filePaths.concat(this.configMd);
    }
    try {
      return filePaths.map((filePath) => ({
        data: this.input.readFileSync(filePath, FS_OPTIONS),
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
