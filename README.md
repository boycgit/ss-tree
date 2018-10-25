# ss-tree

[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php) [![npm version](https://badge.fury.io/js/ss-tree.svg)](https://badge.fury.io/js/ss-tree)

Data Structure Serial -  Tree

 - written in Typescript
 - fully tested


## Installation

### Node.js / Browserify

```bash
npm install ss-tree --save
```

```javascript
var {Tree, TreeNode} = require('ss-tree');
```

### Global object

Include the pre-built script.

```html
<script src="./dist/index.umd.min.js"></script>

```

## Build & test

```bash
npm run build
```

```bash
npm test
```

## document

主要注意空树（tree.root = null） 和 根节点为空 (tree.root = new TreeNode()) 的差别；

```bash
npm run doc
```

then open the generated `out/index.html` file in your browser.

## License

[MIT](LICENSE).
