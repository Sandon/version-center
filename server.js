import Koa from 'koa'
import diffRouter from './diff/diffRouter'

var app = new Koa()

//var versionsRouter = require('./versions/versionsRouter')

app
  .use(diffRouter.routes())
  .use(diffRouter.allowedMethods())
  /*.use(versionsRouter.routes())
  .use(versionsRouter.allowedMethods());*/

/*app.use(async (ctx, next) => {
  try {
    await next()
    console.log(1)
  } catch (err) {
    ctx.body = 'inner error'
    ctx.status = 500
  }
})

app.use(async (ctx) => {
  var rslt = await timeout(1000)
  console.log(2)
  ctx.body = rslt
})

function timeout (time) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      console.log('time out')
      resolve('good')
    }, time)
  })
}*/

app.listen(3000)