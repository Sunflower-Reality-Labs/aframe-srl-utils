## aframe-slr-template-component

[![Version](http://img.shields.io/npm/v/aframe-slr-template-component.svg?style=flat-square)](https://npmjs.org/package/aframe-slr-template-component)
[![License](http://img.shields.io/npm/l/aframe-slr-template-component.svg?style=flat-square)](https://npmjs.org/package/aframe-slr-template-component)

A SLR Template component for A-Frame.

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
  <script src="https://unpkg.com/aframe-slr-template-component@1.0.0/dist/aframe-slr-template-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity slr-template="foo: bar"></a-entity>
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install aframe-slr-template-component
```

Then require and use.

```js
require('aframe');
require('aframe-slr-template-component');
```
