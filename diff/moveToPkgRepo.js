export default async function moveToPkgRepo (ctx, next) {
  if (ctx.error) {
    await next()
  }
}