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

      const result = yield app.mysql.update('sys_token', {
        user_id: user.id,
      }, {
          where: { access_token: this.ctx.auth.access_token }
        });
        
      return result.affectedRows > 0;
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
    * accounts(userId) {
      return yield app.mysql.select('vip_account', {
        source_id: userId,
      });
    }
  }
  return MineService;
};
