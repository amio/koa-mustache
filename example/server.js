const Koa = require('koa')
const koaStatic = require('koa-static')
const koaMustache = require('..')

function serve (rootdir, port) {
  const app = new Koa()

  app.use(koaMustache(rootdir, { extension: 'mustache', debug: true }))
  app.use(koaStatic(rootdir))
  app.listen(port, () => {
    console.log('Listen on port', port)
  })
}

serve(__dirname + '/public', 3000)
