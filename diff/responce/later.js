export default function later (ctx) {
  let res = {code: 1, msg: 'try to retrieve it from CDN later', success: true}
  ctx.status = 200
  ctx.body = JSON.stringify(res)
}