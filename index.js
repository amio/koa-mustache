const fs = require('fs')
const path = require('path')
const attempts = require('attempts')
const Mustache = require('mustache')

const defaultOptions = {
  partialsDir: '_partials', // A directory inside rootpath, for partial files.
  extension: 'mustache',    // The file extension for mustache templates.
  debug: false              // Disable debug mode.
}

module.exports = function (rootpath, opts) {
  opts = Object.assign(opts, { root: rootpath })
  return function mustache (ctx, next) {
    if (ctx.method === 'GET') {
      const p = path.join(rootpath, ctx.path)
      const content = render(p, Object.assign(defaultOptions, opts))
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
function render (pathname, opts) {
  const p = resolveAvailableTemplate(pathname, opts.extension)
  if (!p) return ''

  opts.debug && console.log('\nFOUND TEMPLATE:', p + opts.extension)

  const template = fs.readFileSync(p + opts.extension, 'utf-8')
  const partials = parsePartials(template, opts)
  const data = attempts.sync(p => require(p), [p + 'json', p + 'data.js'])

  opts.debug && console.log('FOUND DATA:', data)

  return Mustache.render(template, data, partials)
}

/**
 * resolveAvailableTemplate
 *
 * Visit '/', '/index' will get resolved to '/index.mustache'
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
    path.join(pathname, 'index.' + ext)
  ])
}

function parsePartials (tmpl, opts) {
  const partialMatches = tmpl.match(/({{> )\w+(}})/g)

  if (!partialMatches) {
    return {}
  } else {
    const partials = {}
    attempts.sync(part => {
      const name = part.match(/\w+/)[0]
      const filename = name + '.' + opts.extension
      const filepath = path.join(opts.root, opts.partialsDir, filename)
      partials[name] = fs.readFileSync(filepath, { encoding: 'utf8' })

      opts.debug && console.log('USE PARTIAL:', filename) // todo
    }, partialMatches)
    return partials
  }
}
