import Router from 'koa-router'
import prepareCode from './prepareCode'
import diffCode from './diffCode'

var router = new Router()
router.get('diff', '/diff/', checkParams, prepareCode, diffCode, final)

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

/*async function getCode (ctx, next) {
  await new Promise((resolve, reject) => {
    console.log('get code: ' + ctx.repoAddr)
    console.log()
    var task = childProcess.exec('git clone ' + ctx.repoAddr + ' ' )
    task.stdout.on('data', function (data) {
      data = data.slice(0, data.length - 1);
      console.log( data.toString() );
    });

    task.stderr.on('data', function (data) {
      console.log( data.toString() );
    });

    task.on('close', function (code) {
      if ( code !== 0 ) {
        console.error( 'get code ' + ctx.repoAddr + ' failed, child process exited with code ' + code );
        reject()
      } else {
        console.log( 'get code ' + ctx.repoAddr + ' finished' )
        resolve()
      }
    });
  })

  await next()
}*/

async function final (ctx, next) {
  ctx.body = 'diff'
  ctx.status = 200
}

export default router