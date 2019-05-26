/**
 * post install script
 */
const { cp, rm, exec } = require('shelljs')
const { existsSync } = require('fs')
const { resolve } = require('path')
const prePushPath = resolve(__dirname, '../.git/hooks/pre-push')
const prePushPathFrom = resolve(__dirname, 'pre-push')

exec(resolve('./node_modules/.bin/electron-rebuild'))

if (!existsSync(prePushPath)) {
  cp(prePushPathFrom, prePushPath)
}

// fix spectron's electron-chromedriver deps
rm('-rf', './node_modules/spectron/node_modules')
