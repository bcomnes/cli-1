'use strict'

const BB = require('bluebird')

const React = require('react')
const readline = require('readline')
const { render, AppContext, StdinContext } = require('ink')
const npmConfig = require('./config/figgy-config.js')
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
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({
                '@babel/core': {
                  'current': '7.2.2',
                  'wanted': '7.3.3',
                  'latest': '7.3.3',
                  'location': 'node_modules/@babel/core',
                  'type': 'devDependencies',
                  'homepage': 'https://babeljs.io/'
                },
                'ink': {
                  'current': '2.0.0-12',
                  'wanted': '2.0.0-12',
                  'latest': '0.5.1',
                  'location': 'node_modules/ink',
                  'type': 'dependencies',
                  'homepage': 'https://github.com/vadimdemedes/ink#readme'
                },
                'ink-spinner': {
                  'current': '2.0.0',
                  'wanted': 'git',
                  'latest': 'git',
                  'location': 'node_modules/ink-spinner',
                  'type': 'dependencies',
                  'homepage': 'https://github.com/vadimdemedes/ink-spinner#readme'
                },
                'standard-version': {
                  'current': 'MISSING',
                  'wanted': '5.0.0',
                  'latest': '5.0.0',
                  'location': 'node_modules/standard-version',
                  'type': 'devDependencies',
                  'homepage': 'https://github.com/conventional-changelog/standard-version#readme'
                },
                'tap': {
                  'current': '12.5.2',
                  'wanted': '12.5.3',
                  'latest': '12.5.3',
                  'location': 'node_modules/tap',
                  'type': 'devDependencies',
                  'homepage': 'http://node-tap.org/'
                }
              })
            }, 1500)
          })
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
