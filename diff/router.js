import Router from 'koa-router'
import prepareCode from './prepareCode'
import diffCode from './diffCode'
import genRsltPkg from './genRsltPkg'

var router = new Router()
router.get('diff', '/diff/', checkParams, prepareCode, diffCode, genRsltPkg, final)
//router.get('diff', '/diff/', genRsltPkg, final)

async function checkParams (ctx, next) {
  if (!ctx.query.oldVersion || !ctx.query.newVersion) {
    ctx.status = 200
    ctx.body = {
      'code': 1,
      'codeMsg': 'wrong params'
    }
    return
  }

  await next()
}

async function final (ctx, next) {
  ctx.body = 'diff'
  ctx.status = 200
}

export default router