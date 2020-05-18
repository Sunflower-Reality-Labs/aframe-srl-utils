## aframe-srl-utils

[![Version](http://img.shields.io/npm/v/aframe-srl-utils.svg?style=flat-square)](https://npmjs.org/package/aframe-srl-utils)
[![License](http://img.shields.io/npm/l/aframe-srl-utils.svg?style=flat-square)](https://npmjs.org/package/aframe-srl-utils)

Sunflower Reality Labs Utils for A-Frame.

For [A-Frame](https://aframe.io).

### API

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|          |             |               |

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-srl-utils@1.0.0/dist/aframe-srl-utils.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity srl="foo: bar"></a-entity>
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install aframe-srl-utils
```

Then require and use.

```js
require('aframe');
require('aframe-srl-utils');
```
