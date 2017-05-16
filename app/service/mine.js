module.exports = app => {
  class MineService extends app.Service {
    constructor(ctx) {
      super(ctx);
    }
    * login({ username, password }) {
      const crypto = require('crypto');
      const user = yield app.mysql.get('sys_user', {
        username,
        password: crypto.createHmac('sha1', username).update(password).digest().toString('base64'),
      });
      if (user == null) {
        return false;
      }

      // 判断是否存在一个对应userid的token
      const token = yield app.mysql.get('sys_token', {
        user_id: user.id,
      });
      if (token != null) {
        // 存在一个token，判断客户端是否相同
        if (this.ctx.auth.client_id === token.client_id) {
          return {
            result: true,
            access_token: token.token,
          };
        }
      }

      // 客户端不同或者不存在userid对应的token，则创建一个新的token
      const access_token_raw = `${crypto.randomBytes(8).toString("hex")}${user.id}`;
      const access_token = new Buffer(`${user.id}_${crypto.createHmac('sha1', app.config.keys).update(`${user.id}:${access_token_raw}:${this.ctx.auth.client_id}`).digest().toString('base64')}`).toString('base64');
      yield app.mysql.insert('sys_token', {
        access_token: access_token_raw,
        user_id: user.id,
        client_id: this.ctx.auth.client_id,
        token: access_token,
      });

      return {
        result: true,
        access_token,
      };
    }
    * signup({ username, password, nick, email, invite_code }) {
      // 验证邀请码
      const code = yield app.mysql.get('vip_invite_code', {
        invite_code,
        is_use: 0,
      });
      if (code == null) {
        return {
          result: false,
          msg: 'invite code have been used',
        };
      }

      // 开始事务
      const conn = yield app.mysql.beginTransaction();
      try {
        yield conn.update('vip_invite_code', {
          is_use: 1,
        }, {
            where: { invite_code },
          });

        const crypto = require('crypto');
        const now = new Date();
        const { insertId } = yield conn.insert('sys_user', {
          create_date: now,
          modify_date: now,
          username,
          password: crypto.createHmac('sha1', username).update(password).digest().toString('base64'),
          passkey: username,
        });
        yield conn.insert('sys_user_detail', {
          id: insertId,
          create_date: now,
          modify_date: now,
          nickname: nick,
          sex: 0,
          email,
        });
        yield conn.commit();
        return true;
      } catch (err) {
        // error, rollback
        yield conn.rollback()
        throw err;
      }
    }
    * info(userId) {
      return yield app.mysql.get('sys_user_detail', {
        id: userId,
      });
    }
    * update(account) {
      const temp = yield app.mysql.get('sys_user_detail', {
        id: account.id,
      });
      const result = yield app.mysql.update('sys_user_detail', {
        id: account.id,
        nickname: account.nickname || temp.nickname,
        sex: account.sex || temp.sex,
        birthday: account.birthday || temp.birthday,
        email: account.email || temp.email,
        address: account.address || temp.address,
      }, {
          where: { id: account.id },
          columns: ['nickname', 'sex', 'birthday', 'email', 'address']
        });
      
      return result.affectedRows > 0;
    }
    * accounts(userId) {
      return yield app.mysql.select('vip_account', {
        source_id: userId,
      });
    }
  }
  return MineService;
};
