import fs from 'mz/fs'
import path from 'path'
import error from '../common/error'
import fileFilterRules from '../config/fileFilterRules'

const DEL_ID = '-'
const ADD_ID = '+'
const MODIFY_ID = 'm'

export default async function diffCode (ctx, next) {
  /*ctx.gitName = gitName
  ctx.codeDir = path.join(CODE_BASE, ctx.gitName)
  ctx.newCode = path.join(ctx.codeDir, NEW_CODE_DIR_NAME)
  ctx.oldCode = path.join(ctx.codeDir, OLD_CODE_DIR_NAME)*/

  ctx.diffResult = await del(ctx, ctx.oldCode, ctx.newCode, ctx.gitName)
  ctx.diffResult = ctx.diffResult.concat(await addAndChange(ctx, ctx.oldCode, ctx.newCode, ctx.gitName))

  await next()
}

/**
 * diff the code to get deletion items information
 * @param ctx
 * @param oldDir
 * @param newDir
 * @param prefix
 * @returns Array
 */
async function del (ctx, oldDir, newDir, prefix) {
  let result = []
  // check whether ${oldDir} is dir
  if ('dir' !== await getType(ctx, oldDir)) {
    return result
  }

  // loop the ${oldDir} to find deletion
  let files = await readdir(ctx, oldDir)
  if (!files) {
    return result
  }

  let len = files.length
  for (let i = 0; i != len; i++) {
    let item = files[i]
    if (fileFilter(item))
      continue

    let tmpPathOld = path.join(oldDir, item)
    let tmpPathNew = path.join(newDir, item)
    let typeOld = await getType(ctx, tmpPathOld)
    let prefixNew = path.join(prefix, item)

    if (!typeOld) {
      continue
    }

    if ( !await fs.exists(tmpPathNew) ||  await getType(ctx, tmpPathNew) !== typeOld ) {
      // old thing not exists in new
      result.push(DEL_ID + ' ' + typeOld + ' ' + prefixNew)
      if ('dir' == typeOld) {
        result = result.concat(await getAllDels(ctx, tmpPathOld, prefixNew, DEL_ID))
      }
    } else if ('dir' == typeOld) {
      // old thing exists in new, and they are dir
      result = result.concat(await del(ctx, tmpPathOld, tmpPathNew, prefixNew))
    }
  }

  return result
}

/**
 * diff the code to get adding and changing information
 * @param ctx
 * @param oldDir
 * @param newDir
 * @param prefix
 * @returns Array
 */
async function addAndChange (ctx, oldDir, newDir, prefix) {
  let result = []
  // check whether ${newDir} is dir
  if ('dir' !== await getType(ctx, newDir)) {
    return result
  }

  // loop the ${newDir} to find adding and changing
  let files = await readdir(ctx, newDir)
  if (!files) {
    return result
  }

  const len = files.length
  for (let i = 0; i != len; i++) {
    let item = files[i]
    if (fileFilter(item))
      continue

    let tmpPathOld = path.join(oldDir, item)
    let tmpPathNew = path.join(newDir, item)
    let typeNew = await getType(ctx, tmpPathNew)
    let prefixNew = path.join(prefix, item)

    if (!typeNew) {
      continue
    }

    if ( !await fs.exists(tmpPathOld) || await getType(ctx, tmpPathOld) !== typeNew ) {
      // new thing not exists in old
      result.push(ADD_ID + ' ' + typeNew + ' ' + prefixNew)
      console.log(result)
      if ('dir' == typeNew) {
        result = result.concat(await getAllDels(ctx, tmpPathNew, prefixNew, ADD_ID))
      }
    } else if ('dir' == typeNew) {
      // new thing exists in old, and they are dir
      result = result.concat(await addAndChange(ctx, tmpPathOld, tmpPathNew, prefixNew))
    } else {
      // new thing exists in old, and they are file
      let isSame = await compareFiles(ctx, tmpPathOld, tmpPathNew)
      if (!isSame) {
        result.push(MODIFY_ID + ' ' + typeNew + ' ' + prefixNew)
      }
    }
  }

  return result
}

/**
 * readdir
 */
async function readdir (ctx, path) {
  try {
    return await fs.readdir(path)
  } catch (e) {
    console.error('readdir ' + path + ' error')
    error(ctx, 'inner error')
    return false
  }
}

/**
 * readFile
 */
async function readFile (ctx, path, options) {
  try {
    return await fs.readFile(path, options)
  } catch (e) {
    console.error('readFile ' + path + ' error')
    error(ctx, 'inner error')
    return false
  }
}

/**
 * get the type of path
 * @param ctx
 * @param path
 * @returns 'dir'/'file'/false
 */
async function getType (ctx, path) {
  // 'dir' or 'file'
  let stat
  try {
    stat = await fs.stat(path)
  } catch (e) {
    console.error('get type of ' + path + ' error')
    error(ctx, 'inner error')
    return false
  }

  if (stat.isFile()) {
    return 'file'
  } else if (stat.isDirectory()) {
    return 'dir'
  }

  console.error('type of ' + path + ' is\'t dir nor file')
  error(ctx, 'inner error')
  return false
}

/**
 * get all deletions item of a deleted dir
 * @param ctx
 * @param path
 * @param prefix, the prefix in diff result item
 * @param stateId, one of {DEL_ID}, {ADD_ID} and {MODIFY_ID}
 * @returns {Array}
 */
async function getAllDels (ctx, targetPath, prefix, stateId) {
  let result = []

  let files = await readdir(ctx, targetPath)
  if (!files) {
    return result
  }

  const len = files.length
  for (let i = 0; i != len; i++) {
    let item = files[i]
    let pathNew = path.join(targetPath, item)
    let prefixNew = path.join(prefix, item)
    let typeNew = await getType(ctx, pathNew)

    if (!typeNew)
      continue

    result.push(stateId + ' ' + typeNew + ' ' + prefixNew)
    if ('dir' === typeNew) {
      result = result.concat(await getAllDels(ctx, pathNew, prefixNew, stateId))
    }
  }

  return result
}

/**
 * compare two files to check whether they have same content
 * @param ctx
 * @param path1
 * @param path2
 * @returns Boolean
 */
async function compareFiles (ctx, path1, path2) {
  let file1 = await readFile(ctx, path1, 'utf8')
  let file2 = await readFile(ctx, path2, 'utf8')

  return file1 === file2
}

/**
 * check whether the file should be filtered
 * @param filename
 * @param path
 * @returns {boolean} true: filtered; false: not filtered
 */
function fileFilter (filename, path) {
  if (!filename && !path)
    return true

  if (filename) {
    for (let rule of fileFilterRules.filenameRules) {
      if (rule.test(filename)) {
        return true
      }
    }
  }

  if (path) {
    for (let rule of fileFilterRules.pathRules) {
      if (rule.test(path)) {
        return true
      }
    }
  }

  return false
}