export default async function pushToCDN (ctx, next) {
  if (ctx.error) {
    await next()
  }


  await next()
}