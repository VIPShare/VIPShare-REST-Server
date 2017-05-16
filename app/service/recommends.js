module.exports = app => {
  class RecommendService extends app.Service {
    constructor(ctx) {
      super(ctx);
    }
    * index() {
      const { pageNumber = 1, pageSize = 5 } = this.ctx.query;
      const result = yield this.ctx.pagination(app.mysql, 'id, title, image, create_date, source', 'from vip_recommend order by modify_date desc', pageNumber, pageSize);
      return {
        list: result.list.map(recommend => {
          return {
            id: recommend.id,
            title: recommend.title,
            image: { uri: recommend.image },
            time: recommend.create_date,
            source: recommend.source,
          }
        }),
        pageInfo: {
          pageNumber: result.pageNumber,
          pageSize: result.pageSize,
        },
      };
    }
    * tops() {
      const recommends = yield app.mysql.query('select id, title, image from vip_recommend order by view_count desc, modify_date desc limit 5 ');
      return recommends.map(recommend => {
        return {
          id: recommend.id,
          title: recommend.title,
          image: { uri: recommend.image },
        }
      });
    }
    * show(id) {
      const recommend = yield app.mysql.get('vip_recommend', {
        id,
      });
      return recommend;
    }
  }
  return RecommendService;
};
