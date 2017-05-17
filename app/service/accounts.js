module.exports = app => {
  class AccountService extends app.Service {
    constructor(ctx) {
      super(ctx);
    }
    * index() {
      const { pageNumber = 1, pageSize = 5 } = this.ctx.query;
      // const result = yield this.ctx.pagination(app.mysql, 'id, type, username, source_id', 'from vip_account order by modify_date desc', pageNumber, pageSize);
      const accounts = yield app.mysql.select('vip_account', {
        columns: ['id', 'type', 'username', 'source_id'],
        order: [['modify_date', 'desc'], ['id', 'desc']],
      });
      // return {
      //   list: result.list.map(account => {
      //     return {
      //       id: account.id,
      //       type: account.type,
      //       username: account.username,
      //       source_id: account.source_id,
      //     }
      //   }),
      //   pageInfo: {
      //     pageNumber: result.pageNumber,
      //     pageSize: result.pageSize,
      //   },
      // };
      return accounts.map(account => {
        return {
          id: account.id,
          type: account.type,
          username: this.ctx.hideStr(account.username, account.username.length >= 5 ? 2 : 0, account.username.length >= 5 ? account.username.length - 4 : account.username.length),
          source_id: account.source_id,
          editable: this.ctx.auth.user_id == account.source_id,
        }
      });
    }
    * show(id) {
      const account = yield app.mysql.get('vip_account', {
        id,
      });

      // view + 1
      if (account.source_id != this.ctx.auth.user_id) {
        yield app.mysql.query(`update vip_user_statistics set helpful_count = helpful_count + 1 where id = ${account.source_id}`)
        // todo alarm while updating vip_user_statistics failed.
      }
      return account;
    }
    * viewable(id, password) {
      const account = yield app.mysql.get('vip_account', {
        id,
        sharePass: password,
      });
      if (account == null) {
        return false;
      }
      return true;
    }
    * create(account) {
      const date = new Date();
      const conn = yield app.mysql.beginTransaction();
      try {
        const result = yield conn.insert('vip_account', {
          create_date: date,
          modify_date: date,
          source_id: this.ctx.auth.user_id,
          type: account.type,
          username: account.username,
          password: account.password,
          sharePass: account.sharePass,
        });
        if (result.affectedRows !== 1) {
          return false;
        }

        const result2 = yield conn.query(`update vip_user_statistics set shares_count = shares_count + 1 where id = ${result.insertId}`);
        if (result.affectedRows !== 1) {
          throw new Error('update statistics failed');
        }

        yield conn.commit();
      } catch (error) {
        yield conn.rollback();
        return false;
      }

      return true;
    }
    * update(id, account) {
      const date = new Date();
      const result = yield app.mysql.update('vip_account', {
        id,
        modify_date: date,
        type: account.type,
        username: account.username,
        password: account.password,
        sharePass: account.sharePass,
      }, {
          where: { id, source_id: this.ctx.auth.user_id },
          columns: ['modify_date', 'type', 'username', 'password', 'sharePass'],
        });

      if (result.affectedRows !== 1) {
        return false;
      }
      return true;
    }
  }
  return AccountService;
};
