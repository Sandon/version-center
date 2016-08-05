var Router = require('koa-router')
var router = new Router()

router.get('versions', '/versions/', function(ctx, next) {
  ctx.body = 'versions'
  ctx.status = 200
})

module.exports = router