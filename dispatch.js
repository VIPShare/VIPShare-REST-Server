// dispatch.js
const egg = require('egg');
egg.startCluster({
  baseDir: __dirname,
  workers: 1,
  https: true,
  key: '/Users/xuqiang/My/SSL/server.key',
  cert: '/Users/xuqiang/My/SSL/server.crt',
  port: 443,
});
