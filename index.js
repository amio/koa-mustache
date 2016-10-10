const fs = require('fs')
const path = require('path')
const attempts = require('attempts')
const Mustache = require('mustache')

const defaultOptions = {
  extension: 'mustache',
  debug: false
}

module.exports = function (rootpath, opts = defaultOptions) {
  return function mustache (ctx, next) {
    if (ctx.method === 'GET') {
      const p = path.join(rootpath, ctx.path)
      const content = render(p, opts.extension, opts.debug)
      if (content) {
        ctx.body = content
      } else {
        return next()
      }
    }
  }
}

/**
 * Try to render given path
 *
 * @param  {String} pathname
 * @param  {String} ext
 * @param  {Boolean} debug
 * @return {String|undefined}
 */
function render (pathname, ext, debug) {
  const p = resolveAvailableTemplate(pathname, ext)
  if (!p) return ''
  debug && console.log('FOUND TEMPLATE:', p + ext)

  const tmpl = fs.readFileSync(p + ext, 'utf-8')
  const data = attempts.sync(p => require(p), [p + 'json', p + 'data.js'])
  debug && console.log('FOUND DATA:', data)
  return Mustache.render(tmpl, data)
}

/**
 * resolveAvailableTemplate
 *
 * Visit '/', '/index', '/index.mustache' will resolved to 'views/index.mustache'
 *
 * @param  {String} pathname
 * @return {String|undefined}
 */
function resolveAvailableTemplate (pathname, ext) {
  const tmplPattern = new RegExp(ext + '$')
  return attempts.sync(p => {
    if (tmplPattern.test(p)) {
      fs.accessSync(p, fs.R_OK)
      return p.replace(new RegExp(ext + '$'), '')
    }
  }, [
    path.join(pathname + '.' + ext),
    path.join(pathname, 'index.' + ext),
    pathname
  ])
}
