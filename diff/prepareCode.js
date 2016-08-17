import path from 'path'
import fs from 'mz/fs'
import error from '../common/error'
import {execCmd} from '../util/util'
//var error = require('../common/error')

var TEMP_DIR_NAME = '/temp-codes/'
var CODE_BASE = path.join(__dirname, '..', TEMP_DIR_NAME)
var NEW_CODE_DIR_NAME = 'new-code'
var OLD_CODE_DIR_NAME = 'old-code'

/**
 * a koa middleware to exported, prepare the code for diff
 * @param ctx
 * @param next
 */
export default async function prepareCode (ctx, next) {
  if (!await getRepoAddr(ctx)) {
    error(ctx, 'inner error')
    console.error('get repo address error')
    return
  }

  var gitName = (/^.*\/(.+)\.git$/).exec(ctx.repoAddr)
  gitName && (gitName = gitName[1])
  if (!gitName) {
    error(ctx, 'inner error')
    console.error('git name is not valid')
    return
  }

  ctx.gitName = gitName
  ctx.codeDir = path.join(CODE_BASE, ctx.gitName + '_' + ctx.query.oldVersion + '-' + ctx.query.newVersion)
  ctx.newCode = path.join(ctx.codeDir, NEW_CODE_DIR_NAME)
  ctx.oldCode = path.join(ctx.codeDir, OLD_CODE_DIR_NAME)

  if (!await fs.exists(ctx.codeDir)) {
    // code dir existing means all the code and dirs in it are ready and fine,
    // otherwise we should prepare them
    if ( !await prepareCodeRepo (ctx) ) {
      return
    }
  }

  // update old version and new version
  if ( await updateVersion(ctx, ctx.oldCode, ctx.query.oldVersion) &&
    await updateVersion(ctx, ctx.newCode, ctx.query.newVersion) ) {
    await next()
  }

}

/**
 * prepare code repo
 * just exec commands bellow:
 * mkdir {{ctx.codeDir}};
 * git clone {{ctx.repoAddr}} {{ctx.newCode}}
 * git clone {{ctx.repoAddr}} {{ctx.oldCode}}
 *
 * @param ctx
 * @returns {Boolean}
 */
async function prepareCodeRepo (ctx) {
  if (await execCmd(ctx, 'mkdir ' + ctx.codeDir) &&
      await execCmd(ctx, 'git clone ' + ctx.repoAddr + ' ' + ctx.newCode) &&
      await execCmd(ctx, 'git clone ' + ctx.repoAddr + ' ' + ctx.oldCode)) {
    return true
  }

  console.log('prepare code repo failed, now try to remove the dir "' +
    ctx.codeDir + '" which was built when preparing code repo')
  if (await execCmd(ctx, 'rm -rf ' + ctx.codeDir)) {
    console.log('remove the dir successfully')
  }
  console.log('remove the dir failed, please remove it manually')

  return false
}

/**
 * get git address from app's name(package's name)
 * @param ctx
 */
async function getRepoAddr (ctx) {
  ctx.repoAddr = 'https://github.com/Sandon/git-test.git'

  return true
}

/**
 * checkout out the code with specified tag
 * execute commands bellow: cd {{path}}; git checkout {{version}};
 * @param path
 * @param version
 * @returns {Boolean}
 */
async function updateVersion (ctx, path, version) {
  if (await execCmd(ctx, 'cd ' + path + ';git checkout master;git pull origin master;git checkout ' + version)) {
    return true
  }

  return false
}


