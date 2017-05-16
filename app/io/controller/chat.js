'use strict';

module.exports = app => {
  return function* () {
    // this.socket.on('chatWith', (userId) => {
    //   console.log(userId);
    // });
console.log('chat')
    const message = this.args[0];
    this.socket.emit('res', `Hi! I've got your message: ${message}`);
  };
};
