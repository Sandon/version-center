import fse from 'fs-extra'
import bluebird from 'bluebird'
import shell from 'shelljs'
import error from '../common/error'
import fs from 'mz/fs'

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
        error(ctx, 'error when exec command: ' + cmd)
      }
    })
  })
}

/**
 * remove, like rm -r
 * @param ctx
 * @param path
 * @returns {Promise}
 */
export function remove (ctx, path) {
  return new Promise((resolve, reject) => {
    fse.remove(path,  (err) => {
      console.log('rm ', path, ' complete')
      if (err) {
        error(ctx, 'get error when remove ' + path + '.error info: ' + err)
        reject(false)
        return
      }
      resolve(true)
    })
  })
}

/**
 * copy, like cp -r
 * @param ctx
 * @param src
 * @param des
 * @returns {Promise}
 */
export function copy (ctx, src, des) {
  return new Promise((resolve, reject) => {
    fse.copy(src, des, (err) => {
      if (err) {
        error(ctx, 'get error when coping ' + src + ' to ' + des)
        reject(false)
        return
      }
      resolve(true)
    })
  })
}

/**
 * mkdir
 * @param ctx
 * @param path
 * @returns {boolean}
 */
export async function mkdir (ctx, path) {
  try {
    await fs.mkdir(path)
    return true
  } catch (e) {
    error(ctx, 'get error when doing mkdir ' + path )
    return false
  }
}

export async function writeFile (ctx, file, data) {
  try {
    await fs.writeFile(file, data)
    return true
  } catch (e) {
    error(ctx, 'get error when doing writeFile to ' + file)
    return false
  }
}