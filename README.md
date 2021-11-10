# broccoli-styledown

Broccoli plugin for generating styleguide HTML with [@peopledoc/Styledown](https://github.com/peopledoc/styledown)

ℹ️ This package is forked from [kmiyashiro/broccoli-styledown](https://github.com/kmiyashiro/broccoli-styledown).

## Installation

Add the github registry in your `.npmrc` for @peopledoc scoped package:

```
# Points to Github NPM registry
@peopledoc:registry=https://npm.pkg.github.com
````

Then you can install it:

```bash
npm install --save-dev @peopledoc/broccoli-styledown
```

## Usage

```js
var compileStyledown = require('@peopledoc/broccoli-styledown');

var outputTree = compileStyledown([inputTrees], options)
```

* **`inputTree`**: An array of nodes, `['styles', 'styleguide']`. Only CSS-like files and your config MD file will be passed to Styledown.
* **`options`**: Hash of options
  * **`configMd`**: (Default: `config.md`) Styledown config markdown file. Path relative to any inputNode. *NOTE*: If there are multiple config files with the same name in different inputNodes, bad things will probably happen.
  * **`destFile`**: File to output generated styleguide HTML in build directory.
  * **`styledown`**: A hash of options for [`Styledown.parse`](https://github.com/styledown/styledown/blob/master/index.js)

## Development

### Tests

```bash
npm install
npm test
```

## Contributors

<!-- readme: contributors -start -->
<table>
<tr>
    <td align="center">
        <a href="https://github.com/KamiKillertO">
            <img src="https://avatars.githubusercontent.com/u/9579729?v=4" width="100;" alt="KamiKillertO"/>
            <br />
            <sub><b>KamiKillertO</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/kmiyashiro">
            <img src="https://avatars.githubusercontent.com/u/71852?v=4" width="100;" alt="kmiyashiro"/>
            <br />
            <sub><b>kmiyashiro</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ryuran">
            <img src="https://avatars.githubusercontent.com/u/1309340?v=4" width="100;" alt="ryuran"/>
            <br />
            <sub><b>ryuran</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/GreatWizard">
            <img src="https://avatars.githubusercontent.com/u/1322081?v=4" width="100;" alt="GreatWizard"/>
            <br />
            <sub><b>GreatWizard</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/MrChocolatine">
            <img src="https://avatars.githubusercontent.com/u/47531779?v=4" width="100;" alt="MrChocolatine"/>
            <br />
            <sub><b>MrChocolatine</b></sub>
        </a>
    </td></tr>
</table>
<!-- readme: contributors -end -->

## License

MIT
