'use strict'

const BB = require('bluebird')

const React = require('react')
const readline = require('readline')
const { render, AppContext, StdinContext } = require('ink')
const npm = require('./npm.js')
const npmConfig = require('./config/figgy-config.js')
let outdated = null
const path = require('path')
const pudding = require('figgy-pudding')
const PickUpdatesComponent = require('libpickupdates')
const validate = require('aproba')

pickUpdates.usage = [
  'npm pick-updates'
].join('\n')

pickUpdates.completion = (opts, cb) => {
  validate('OF', [opts, cb])
  return cb(null, []) // fill in this array with completion values
}

const PickUpdatesConfig = pudding({
  unicode: {}
})

module.exports = (args, cb) => BB.try(() => {
  return pickUpdates(args)
}).then(
  val => cb(null, val),
  err => err.code === 'EUSAGE' ? cb(err.message) : cb(err)
)
function pickUpdates (args) {
  npm.config.set('long', true)
  outdated = BB.promisify(require('./outdated.js'))
  const opts = PickUpdatesConfig(npmConfig())
  const app = render(React.createElement(AppContext.Consumer, {}, ({ exit }) => {
    return React.createElement(StdinPicker, { exit, opts })
  }), {
    exitOnCtrlC: false
  })
  return app.waitUntilExit()
}

function StdinPicker ({ exit, opts }) {
  return React.createElement(
    StdinContext.Consumer,
    {},
    ({ stdin, setRawMode }) => {
      readline.emitKeypressEvents(stdin)
      setRawMode(true)
      stdin.on('keypress', key => {
        if (key === '\u0003') {
          exit()
        }
      })
      return React.createElement(PickUpdatesComponent, {
        stdin,
        unicode: process.platform === 'darwin',
        onDone () { exit() },
        getOutdated () {
          return outdated([], true).then(makeJSON)
        },
        installUpdates (names) {
          return new Promise((resolve, reject) => {
            if (names.length) {
              setTimeout(resolve, 1500)
            } else {
              resolve()
            }
          })
        }
      })
    }
  )
}

function makeJSON (list, opts) {
  var out = {}
  list.forEach(function (p) {
    var dep = p[0]
    var depname = p[1]
    var dir = dep.path
    var has = p[2]
    var want = p[3]
    var latest = p[4]
    var type = p[6]
    dir = path.relative(process.cwd(), dir)
    out[depname] = { current: has,
      wanted: want,
      latest: latest,
      location: dir
    }
    out[depname].type = type
    out[depname].homepage = dep.package.homepage
  })
  return out
}
