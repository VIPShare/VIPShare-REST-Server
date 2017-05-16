module.exports = app => {
  return function* (next) {
    // this.socket.emit('res', 'packet received!');
    // console.log('packet:', this.packet);

    this.socket.on('chatWith', (userId) => {
      console.log(userId);
    });

    yield* next;
  };
};
