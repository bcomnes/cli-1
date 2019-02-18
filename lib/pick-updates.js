'use strict'

const BB = require('bluebird')

const React = require('react')
const readline = require('readline')
const { render, StdinContext } = require('ink')
const npmConfig = require('./config/figgy-config.js')
const pudding = require('figgy-pudding')
const UpdateInteractiveComponent = require('libpickupdates')
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
  return new Promise((resolve, reject) => {
    let unmount = () => {}
    unmount = render(React.createElement(StdinPicker, {
      shutdown () {
        unmount()
        resolve()
      },
      opts
    }))
  })
}

function StdinPicker ({ shutdown, opts }) {
  React.useEffect(() => shutdown)
  return React.createElement(
    StdinContext.Consumer,
    {},
    ({ stdin, setRawMode }) => {
      readline.emitKeypressEvents(stdin)
      setRawMode(true)
      return React.createElement(UpdateInteractiveComponent, {
        stdin,
        onDone: shutdown,
        unicode: opts.unicode
      })
    }
  )
}
