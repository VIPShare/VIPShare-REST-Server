module.exports = options => {
  return function* auth(next) {
    // 执行认证
    const access_token = this.request.header.access_token || this.request.query.access_token || this.request.body.access_token;
    if ('undefined' === typeof access_token || access_token == null) {
      this.body = {
        status: 401,
        msg: 'you have no permission to do that',
      }
      this.status = 401;
      return;
    }
    // 验证access_token
    const result = yield this.app.mysql.get('sys_token', {
      access_token,
    });
    if (result == null) {
      this.body = {
        status: 401,
        msg: 'bad access_token you have been sent',
      }
      this.status = 401;
      return;
    }
    // 存在则附加到context对象中
    this.auth = {
      access_token: result.access_token,
      user_id: result.user_id,
    };

    yield next;
  };
};
