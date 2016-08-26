import fstream from 'fstream'
import tar from 'tar'
import zlib from 'zlib'
import path from 'path'
import error from '../common/error'
import fs from 'mz/fs'
import {copy, mkdir, writeFile} from '../util/util'

export default async function genRsltPkg (ctx, next) {
  if (ctx.error) {
    await next()
  }

  let codePath = path.join(ctx.codeDir, '/diff-result')
  let gzipPath = path.join(ctx.codeDir, '/' + ctx.codeDirName + '.tar.gz')

  // create target dir
  if ( !await mkdir(ctx, codePath) )
    return

  // copy the increment code to target dir
  if ( !await copy(ctx, ctx.newCode, path.join(codePath, '/diff-code')) )
    return

  // generate the diff description json file
  if ( !await writeFile(ctx, path.join(codePath, '/diff-description.json'), JSON.stringify(ctx.diffResult)) )
    return

  // generate result package as zip
  try {
    fstream.Reader({ 'path': codePath, 'type': 'Directory' }) // Read the source directory
      .pipe(tar.Pack()) // Convert the directory to a .tar file
      .pipe(zlib.Gzip()) // Compress the .tar file
      .pipe(fstream.Writer({ 'path': gzipPath })); // Give the output file name
  } catch (e) {
    error(ctx, 'error happens when generating .tar.gz file for ' + ctx.codeDir)
    return
  }

  await next()
}