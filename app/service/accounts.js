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
          username: account.username,
          source_id: account.source_id,
          editable: this.ctx.auth.user_id == account.source_id,
        }
      });
    }
    * show(id) {
      const account = yield app.mysql.get('vip_account', {
        id,
      });
      return account;
    }
    * viewable(id, password) {
      const account = yield app.mysql.get('vip_account', {
        id,
      });
      if (account == null) {
        return false;
      }
      return account.password === password;
    }
    * create(account) {
      const date = new Date();
      console.log(account);
      yield app.mysql.insert('vip_account', {
        create_date: date,
        modify_date: date,
        source_id: this.ctx.auth.user_id,
        type: account.type,
        username: account.username,
        password: account.password,
        sharePass: account.sharePass,
      });

      return true;
    }
  }
  return AccountService;
};
