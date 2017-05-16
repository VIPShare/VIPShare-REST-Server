module.exports = app => {
  class UserService extends app.Service {
    constructor(ctx) {
      super(ctx);
    }
    * index() {
      const users = yield app.mysql.query(`select id, nickname, avatar from sys_user_detail where id != ${this.ctx.auth.user_id} order by modify_date desc, id desc`);
      return users;
    }
  }
  return UserService;
};
