module.exports = app => {
  class UserService extends app.Service {
    constructor(ctx) {
      super(ctx);
    }
    * index() {
      const users = yield app.mysql.select('sys_user_detail', {
        columns: ['id', 'nickname', 'avatar'],
        order: [['modify_date', 'desc'], ['id', 'desc']],
      });
      return users;
    }
  }
  return UserService;
};
