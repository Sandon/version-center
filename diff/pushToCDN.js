export default async function pushToCDN (ctx, next) {
  await next()
}