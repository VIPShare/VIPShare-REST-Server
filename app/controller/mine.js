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
    access_token: result.access_token,
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
  ctx.status = 201;
  ctx.body = {
    status: 201,
    msg: 'success',
  }
}

exports.info = function* (ctx) {
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

exports.accounts = function* (ctx) {
  const accounts = yield ctx.service.mine.accounts(ctx.auth.user_id);
  ctx.body = accounts;
  ctx.status = 200;
}

exports.update = function* (ctx) {
  const result = yield ctx.service.mine.update(ctx.request.body);
  if (result) {
    ctx.status = 204;
    ctx.body = {
      msg: 'success',
    };
    return;
  }
  ctx.status = 500;
  ctx.body = {
    msg: 'update profile failed',
  }
}
