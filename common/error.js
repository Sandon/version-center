export default function error (ctx, msg) {
  ctx.status = 500
  ctx.body = msg
  console.error(msg)
}