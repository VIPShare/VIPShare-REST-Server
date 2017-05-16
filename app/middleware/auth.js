module.exports = options => {
  return function* auth(next) {
    // http basic 认证
    const authorization = this.request.header.authorization || this.request.header.Authorization || '';
    if (authorization.startsWith('Bearer') || this.request.query.access_token || this.request.body.access_token) {
      let access_token = authorization.substring('Bearer'.length).trim();
      if (this.isBlank(access_token)) {
        access_token = this.request.query.access_token || this.request.body.access_token;
      }
      access_token = new String(Buffer.from(access_token, 'base64'))
      if (this.isBlank(access_token)) {
        this.body = {
          status: 401,
          msg: 'you have no permission to do that',
        }
        this.status = 401;
        return;
      }
      if (access_token.indexOf('_') == -1) {
        this.body = {
          status: 401,
          msg: 'you have no permission to do that',
        }
        this.status = 401;
        return;
      }
      const userid = access_token.split('_')[0];
      const token = yield this.app.mysql.get('sys_token', {
        user_id: userid,
      });
      if (token != null) {
        // 校验发送过来的access_token是否合法
        const crypto = require('crypto');
        const result = new Buffer(`${userid}_${crypto.createHmac('sha1', this.app.config.keys).update(`${userid}:${token.access_token}:${token.client_id}`).digest().toString('base64')}`).toString('base64');
        if (result === token.token) {
          // 相匹配
          this.auth = {
            user_id: userid,
            client_id: token.client_id,
            access_token_raw: token.access_token,
            access_token,
          };

          yield next;
          return;
        }
      }
      // 不存在该token，则判断为非法请求
      this.body = {
        status: 401,
        msg: 'you have no permission to do that',
      }
      this.status = 401;
      return;
    } else if (authorization.startsWith('Basic')) {
      // starts with basic
      const clientid = new String(Buffer.from(authorization.substring('Basic'.length).trim(), 'base64'));
      if (this.isBlank(clientid)) {
        this.body = {
          status: 401,
          msg: 'you have no permission to do that',
        }
        this.status = 401;
        return;
      }
      const client = yield this.app.mysql.get('sys_client', {
        client_id: clientid.substring(0, clientid.length - 1),
      });
      if (client == null) {
        this.body = {
          status: 401,
          msg: 'you have no permission to do that',
        }
        this.status = 401;
        return;
      }

      this.auth = {
        client_id: client.client_id,
      }
      yield next;
      return;
    }

    this.body = {
      status: 401,
      msg: 'you have no permission to do that',
    }
    this.status = 401;
    return;
  };
};
