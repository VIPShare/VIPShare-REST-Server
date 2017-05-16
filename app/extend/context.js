'use strict';

const isBlank = (str) => {
  if ('string' === str && str.trim() === '') {
    return true;
  }
  return false;
}

module.exports = {
  isBlank,
  * pagination(db, selects, sqlExcept, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    const list = yield db.query(`select ${isBlank(selects) ? '*' : selects} ${sqlExcept} limit ${start}, ${pageSize}`);
    return {
      list,
      pageNumber,
      pageSize,
    }
  },
};

