module.exports = app => {
  app.beforeStart(function* () {
    class CustomService extends app.Service {
      * pagination(db, selects, sqlExcept, pageNumber, pageSize) {
        const start = (pageNumber - 1) * pageSize;
        const list = yield db.query(`select ${this.ctx.helper.isBlank(selects) ? '*' : selects} ${sqlExcept} limit ${pageNumber}, ${pageSize}`);
        return {
          list,
          pageNumber,
          pageSize,
        }
      }
    }
    app.Service = CustomService;
  });
};
