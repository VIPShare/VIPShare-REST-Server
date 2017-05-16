exports.index = function* (ctx) {
  const users = yield ctx.service.users.index();
  ctx.body = users;
  ctx.status = 200;
}
