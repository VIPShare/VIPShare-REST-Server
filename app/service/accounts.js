module.exports = app => {
  class AccountService extends app.Service {
    constructor(ctx) {
      super(ctx);
    }
    * index() {
      const { pageNumber = 1, pageSize = 5 } = this.ctx.query;
      const result = yield this.ctx.pagination(app.mysql, 'id, type, username, source_id', 'from vip_account order by modify_date desc', pageNumber, pageSize);
      return {
        list: result.list.map(account => {
          return {
            id: account.id,
            type: account.type,
            username: account.username,
            source_id: account.source_id,
          }
        }),
        pageInfo: {
          pageNumber: result.pageNumber,
          pageSize: result.pageSize,
        },
      };
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
  }
  return AccountService;
};
