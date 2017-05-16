'use strict';

module.exports = appInfo => {
  const config = {};

  // should change to your own
  config.keys = appInfo.name + '_whatakitty';

  // middleware
  config.middleware = [ 'auth' ];

  // add your config here
  config.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'vipshare',
      password: 'vipshare123',
      database: 'vipshare',
    },
    app: true,
    agent: false,
  };

  config.io = {
    init: {
      // wsEngine: 'uws'
    }, // passed to engine.io
    transports: ['websocket'],
    namespace: {
      '/chat': {
        connectionMiddleware: ['events'],
        packetMiddleware: [],
      },
    },
    redis: {
      host: '127.0.0.1',
      port: 6379
    },
  };
  
  config.security = {
    csrf: {
      // 判断是否需要 ignore 的方法，请求上下文 context 作为第一个参数
      ignore: ctx => true,
    },
  }

  return config;
};
