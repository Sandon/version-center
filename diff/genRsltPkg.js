import fstream from 'fstream'
import tar from 'tar'
import zlib from 'zlib'
import path from 'path'
import error from '../common/error'

export default async function genRsltPkg (ctx, next) {
  let codePath = ctx.newCode
  let gzipPath = path.join(ctx.codeDir, '/target.tar.gz')

  // generate result package as zip
  try {
    fstream.Reader({ 'path': codePath, 'type': 'Directory' }) // Read the source directory
      .pipe(tar.Pack()) // Convert the directory to a .tar file
      .pipe(zlib.Gzip()) // Compress the .tar file
      .pipe(fstream.Writer({ 'path': gzipPath })); // Give the output file name
  } catch (e) {
    error(ctx, 'error happens when generating .tar.gz file for ' + ctx.codeDir)
  }

  await next()
}