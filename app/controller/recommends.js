const createRule = {
  pageNumber: 'integer',
  pageSize: 'integer',
};
exports.index = function* (ctx) {
  // 校验 `ctx.request.body` 是否符合我们预期的格式
  // 如果参数校验未通过，将会抛出一个 status = 422 的异常
  // ctx.app.validator.validate(createRule);
  const result = yield ctx.service.recommends.index();

  ctx.body = result;
  ctx.status = 200;
};

exports.tops = function* (ctx) {
  const result = yield ctx.service.recommends.tops(ctx.request.body);
  ctx.body = result;
  ctx.status = 200;
}

exports.show = function* (ctx) {
  const result = yield ctx.service.recommends.show(ctx.params.id);
  if (result == null) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: `not found id:${ctx.params.id} in database`,
    }
    return;
  }
  ctx.body = result;
  ctx.status = 200;
}
