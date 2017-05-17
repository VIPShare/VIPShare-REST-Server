const moment = require('moment');

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
          sex: '男',
          avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
          email,
        });
        yield conn.insert('vip_user_statistics', {
          id: insertId,
          create_date: now,
          modify_date: now,
          shares_count: 0,
          friends_count: 0,
          helpful_count: 0,
        });
        const { nums } = conn.query('select count(*) as nums from sys_user')[0];
        yield conn.update('vip_user_statistics', {
          friends_count: nums - 1,
        }, {
          columns: ['friends_count'],
        });
        yield conn.commit();
        return {
          result: true,
        };
      } catch (err) {
        // error, rollback
        yield conn.rollback()
        throw err;
      }
    }
    * info(userId) {
      const profile = yield app.mysql.get('sys_user_detail', {
        id: userId,
      });
      return {
        id: profile.id,
        nickname: profile.nickname,
        avatar: profile.avatar,
        sex: profile.sex,
        birthday: moment(profile.birthday).format('YYYY-MM-DD'),
        email: profile.email,
        address: profile.address,
      }
    }
    * statistics(userId) {
      return yield app.mysql.get('vip_user_statistics', {
        id: userId,
      });
    }
    * update(profile) {
      const temp = yield app.mysql.get('sys_user_detail', {
        id: profile.id,
      });
      const result = yield app.mysql.update('sys_user_detail', {
        id: profile.id,
        nickname: profile.nickname || temp.nickname,
        sex: profile.sex || temp.sex,
        birthday: profile.birthday || temp.birthday,
        email: profile.email || temp.email,
        address: profile.address || temp.address,
      }, {
          where: { id: profile.id },
          columns: ['nickname', 'sex', 'birthday', 'email', 'address']
        });

      return result.affectedRows > 0;
    }
    * avatar(parts, group) {
      const { filename, error } = yield this.ctx.uploadFile(parts, group);
      if (error) {
        return {
          error: 'update avatar failed',
        };
      }

      // save url to user
      const result = yield app.mysql.update('sys_user_detail', {
        id: this.ctx.auth.user_id,
        avatar: filename,
      }, {
          where: { id: this.ctx.auth.user_id },
          columns: ['avatar'],
        });

      if (result.affectedRows > 0) {
        return {
          filename,
        };
      }
      return {
        error: 'update avatar failed',
      };
    }
    * accounts(userId) {
      const accounts = yield app.mysql.select('vip_account', {
        where: { source_id: userId },
      });
      return accounts.map(account => {
        return {
          id: account.id,
          type: account.type,
          username: account.username,
          source_id: account.source_id,
          editable: true,
        };
      })
    }
  }
  return MineService;
};
