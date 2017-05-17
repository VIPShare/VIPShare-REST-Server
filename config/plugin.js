'use strict';

// had enabled by egg
// exports.static = true;
exports.io = {
  enable: true,
  package: 'egg-socket.io',
};

exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};

exports.redis = {
  enable: false,
  package: 'egg-redis',
};
