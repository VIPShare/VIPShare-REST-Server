'use strict';

module.exports = app => {
  // app.get('/', 'home.index');

  app.resources('recommends', '/api/recommends', 'recommends');
  app.get('/api/recommends/tops', 'recommends.tops');

  app.resources('accounts', '/api/accounts', 'accounts');
  app.post('/api/accounts/:id/viewable', 'accounts.viewable');

  app.resources('users', '/api/users', 'users');

  app.post('/api/login', 'mine.login');
  app.post('/api/signup', 'mine.signup');
  app.get('/api/mine/info', 'mine.info');
  app.put('/api/mine/info', 'mine.update');
  app.get('/api/mine/accounts', 'mine.accounts');

  app.io.route('chat', function*(app) {
    console.log('chat')
    yield app.io.controllers.chat(app);
  });
  app.io.of('/chat').route('chat', function*(app) {
    console.log('chat/')
    yield app.io.controllers.chat(app);
  });
};
