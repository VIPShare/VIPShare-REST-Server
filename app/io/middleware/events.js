let users = {};

module.exports = app => {
  return function* (next) {
    this.socket.on('chatWith', ({ ownerId, targetId }) => {
      users[ownerId] = this.socket.id;
      console.log(users);
      this.socket.emit('roomJoined');
    });

    this.socket.on('send', ({ ownerId, targetId, messages }) => {
      if (users[targetId]) {
        console.log(targetId + '存在，发送');
        this.socket.emit('echo', {messages, time: new Date()});
        this.socket.to(users[targetId]).emit('reback', {messages, time: new Date()});
      }
    })
    // this.socket.on('chatWith', ({ownerId, targetId}) => {
    //   // const roomName = `${ownerId}_${targetId}_room`;
    //   this.socket.join('room', () => {
    //     console.log(`${ownerId} and ${targetId} has been joined room named room`)
    //     app.io.in('room').emit('roomJoined');
    //   });
    // });
    // this.socket.on('typing', ({ownerId, targetId}) => {
    //   const roomName = `${ownerId}_${targetId}_room`;
    //   app.io.in(roomName).emit('typing', `${targetId} is typing`);
    // });
    // this.socket.on('send', ({ownerId, targetId, messages = []}) => {
    //   console.log(`receive message ${JSON.stringify(messages)}`);
    //   const roomName = `${ownerId}_${targetId}_room`;
    //   console.log(`in ${roomName}， ${ownerId} sent message ${JSON.stringify(messages)} to ${targetId}`);
    //   app.io.in(roomName).emit('message', {
    //     messages,
    //     time: new Date(),
    //   });
    //   // this.socket.emit('message', {
    //   //   messages,
    //   //   time: new Date(),
    //   // });

    // });
    yield* next;
  };
};
