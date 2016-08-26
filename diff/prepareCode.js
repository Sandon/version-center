import path from 'path'
import fs from 'mz/fs'
import error from '../common/error'
import {execCmd} from '../util/util'
import later from './responce/later'

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
  if (ctx.error) {
    await next()
  }

  if (!await getRepoAddr(ctx)) {
    ctx.error = true
    await next()
  }

  var gitName = (/^.*\/(.+)\.git$/).exec(ctx.repoAddr)
  gitName && (gitName = gitName[1])
  if (!gitName) {
    error(ctx, 'git name is not valid')
    ctx.error = true
    await next()
  }

  ctx.gitName = gitName
  ctx.codeDirName = ctx.gitName + '_' + ctx.query.oldVersion + '-' + ctx.query.newVersion
  ctx.codeDir = path.join(CODE_BASE, ctx.codeDirName)
  ctx.newCode = path.join(ctx.codeDir, NEW_CODE_DIR_NAME)
  ctx.oldCode = path.join(ctx.codeDir, OLD_CODE_DIR_NAME)

  // code dir existing means all the code and dirs in it are ready and fine,
  // otherwise we should prepare them
  // if code dir exists, we should return and tell the client to retrieve it from CDN
  try {
    fs.statSync(ctx.codeDir)

    later(ctx)
    return
  } catch (e) {
    try {
      fs.mkdirSync(ctx.codeDir)
    } catch (e) {
      error(ctx, 'get error when mkdir ' + ctx.codeDir)
      ctx.error = true
      await next()
    }
    if ( !await prepareCodeRepo (ctx) ) {
      ctx.error = true
      await next()
    }
  }

  // update old version and new version
  if ( await updateVersion(ctx, ctx.oldCode, ctx.query.oldVersion) &&
    await updateVersion(ctx, ctx.newCode, ctx.query.newVersion) ) {
  } else {
    ctx.error = true
  }
  await next()
}

/**
 * prepare code repo
 * just exec commands bellow:
 * git clone {{ctx.repoAddr}} {{ctx.newCode}}
 * git clone {{ctx.repoAddr}} {{ctx.oldCode}}
 *
 * @param ctx
 * @returns {Boolean}
 */
async function prepareCodeRepo (ctx) {
  if (await execCmd(ctx, 'git clone ' + ctx.repoAddr + ' ' + ctx.newCode) &&
      await execCmd(ctx, 'git clone ' + ctx.repoAddr + ' ' + ctx.oldCode)) {
    return true
  }

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