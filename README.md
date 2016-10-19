# koa-mustache [![npm-version][npm-badge]][npm-link]

> NOTE: for koa@2.0.0 + only.

## Feature

- Visit `/`, `/index` will get resolved to `/index.mustache`
- Visit `/home` will get resolved to `/home.mustache` or `/home/index.mustache`
- If there is a `.json` or `.data.js` (which exports a object) file with same
  name beside the template file, it will be used as it's data source.

## Usage

```javascript
const Koa = require('koa')
const koaMustache = require('koa-mustache')

const app = new Koa()
app.use(koaMustache(__dirname + '/public', {
  extension: 'html'
}))

app.listen(3000)
```

## Options

- **`partialsDir`**(="_partials"): a directory inside public folder, for partial files.
- **`extension`**(="mustache"): custom file extension to be recognized as mustache template.
- **`debug`**(=false): enable debug log.

## License

ISC © [Amio][author]

[npm-badge]:https://img.shields.io/npm/v/koa-mustache.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/koa-mustache
[author]:   https://github.com/amio
