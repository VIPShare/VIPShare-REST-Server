'use strict';

// or http://127.0.0.1:7001/chat
// const socket = require('socket.io-client')('https://127.0.0.1/chat', { secure: true, reconnect: true, rejectUnauthorized: false });
const io = require('socket.io-client');
// const socket = io.connect('ws://127.0.0.1:443/chat', { rejectUnauthorized: false });
const socket = io.connect('ws://127.0.0.1:7001/chat');

socket.on('connect', () => {
  console.log('connect!');
  socket.emit('chat', 'hello world!');
});

socket.on('res', msg => {
  console.log('res from server: %s!', msg);
});
