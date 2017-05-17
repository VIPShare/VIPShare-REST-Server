'use strict';
const fs = require('fs');
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const shell = require('shelljs');

const isBlank = (str) => {
  if ('undefined' === str || str.trim() === '') {
    return true;
  }
  return false;
}

const uploadFile = function* (parts, group) {
  console.log('upload')
  const date = require('moment')().format('YYYY-MM-DD');
  let part;
  while ((part = yield parts) != null) {
    if (Array.isArray(part)) {
      continue;
    } else {
      break;
    }
  }
  console.log('parse');
  if (!part || !part.filename) {
    this.ctx.body = {
      message: 'no file',
    };
    return {
      error: 'upload avatar error',
    };
  }
  const contextPath = `/public/image/${group}/${date}`;
  const parent = path.join(__dirname, `..${contextPath}`);
  const filepath = path.join(parent, part.filename);
  shell.mkdir('-p', parent);
  const data = yield saveStream(part, filepath, `${contextPath}/${part.filename}`);
  return data;
}

function saveStream(stream, filepath, filename) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(filepath);
    stream.pipe(ws);
    ws.on('error', (error) => {
      reject({ error });
    });
    ws.on('finish', () => {
      resolve({ filename: filename });
    });
  });
}

const hideStr = (str, start, count) => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    if (i >= start && i < (start + count)) {
      result += '*';
      continue;
    }
    result += str[i];
  }
  return result;
}

module.exports = {
  isBlank,
  hideStr,
  uploadFile,
  * pagination(db, selects, sqlExcept, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    const list = yield db.query(`select ${isBlank(selects) ? '*' : selects} ${sqlExcept} limit ${start}, ${pageSize}`);
    return {
      list,
      pageNumber: +pageNumber,
      pageSize: +pageSize,
    }
  },
};

