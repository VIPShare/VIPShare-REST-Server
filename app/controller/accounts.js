const createRule = {
  pageNumber: 'integer',
  pageSize: 'integer',
};
exports.index = function* (ctx) {
  const result = yield ctx.service.accounts.index(ctx.request.body);

  ctx.body = result;
  ctx.status = 200;
};

exports.show = function* (ctx) {
  const result = yield ctx.service.accounts.show(ctx.params.id);
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

exports.viewable = function* (ctx) {
  const id = +ctx.params.id;
  const viewable = yield ctx.service.accounts.viewable(id, ctx.request.body.password);
  ctx.body = {
    id,
    viewable,
  };
  ctx.status = 200;
}

exports.create = function* (ctx) {
  const result = yield ctx.service.accounts.create(ctx.request.body);
  ctx.body = {
    msg: 'create success',
  }
  ctx.status = 201;
}
