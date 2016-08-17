import fse from 'fs-extra'
import bluebird from 'bluebird'
import shell from 'shelljs'
import error from '../common/error'

export var fsePromise = bluebird.promisifyAll(fse)


/**
 * execute a command
 * @param cmd: the command to be executed
 * @returns {Promise}
 */
export function execCmd (ctx, cmd) {
  return new Promise((resolve, reject) => {
    console.log('exec command: ' + cmd)
    shell.exec(cmd, function (code, stdout, stderr) {
      stdout && console.log('Program output:', stdout);
      stderr && console.log('Program stderr:', stderr);
      if (0 === code) {
        resolve(true)
      } else {
        reject(false)
        error(ctx, 'inner error')
        console.error('error when exec command: ' + cmd)
      }
    })
  })
}