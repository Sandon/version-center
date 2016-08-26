import {remove} from '../util/util'
export default async function removeCode (ctx, next) {
  await remove(ctx.codeDir)

  await next()
}