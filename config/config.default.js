'use strict';

module.exports = appInfo => {
  const config = {};

  // should change to your own
  config.keys = appInfo.name + '_whatakitty';

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

  return config;
};
