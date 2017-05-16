'use strict';

module.exports = app => {
  // app.get('/', 'home.index');

  app.resources('recommends', '/api/recommends', 'recommends');
  app.get('/api/recommends/tops', 'recommends.tops');

  app.resources('accounts', '/api/accounts', 'accounts');
  app.post('/api/accounts/:id/viewable', 'accounts.viewable');

  app.post('/api/login', 'mine.login');
  app.post('/api/signup', 'mine.signup');
  app.get('/api/mine/info', 'mine.info');

  app.io.route('chat', app.io.controllers.chat);
  app.io.of('/chat').route('chat', app.io.controllers.chat);
};
