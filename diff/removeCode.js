import {fsePromise} from '../util/util'
export default async function removeCode (ctx, next) {
  /*let rm = fsePromise.remove(ctx.codeDir)
    .catch(function (e) {

    })
  await rm*/
  await next()
}