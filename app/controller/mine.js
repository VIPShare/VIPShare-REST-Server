exports.login = function* (ctx) {
  const result = yield ctx.service.mine.login(ctx.request.body);
  if (!result) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: `please check your username and password`,
    }
    return;
  }
  ctx.body = {
    msg: 'login success',
  };
  ctx.status = 200;
}

exports.signup = function* (ctx) {
  const result = yield ctx.service.mine.signup(ctx.request.body);
  if (!result.result) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      msg: result.msg,
    }
    return;
  }
  ctx.body = {
    msg: 'success',
  }
  ctx.status = 201;
}

exports.info = function* (ctx) {
  console.log(ctx.auth.user_id);
  const info = yield ctx.service.mine.info(ctx.auth.user_id);
  if (info == null) {
    ctx.status = 200;
    ctx.body = {
      status: 200,
      msg: 'there is no info for current user',
    }
    return;
  }
  ctx.body = info;
  ctx.status = 200;
}