let users = {};
let messages = {};
let rooms = {};

const previousMessages = (firstId, secondId) => {
  return {
    previousMessagesObj: messages[`${firstId}-${secondId}`] || messages[`${secondId}-${firstId}`] || [],
    key: messages[`${secondId}-${firstId}`] ? `${secondId}-${firstId}` : `${firstId}-${secondId}`,
  };
}

const append = (firstId, secondId, msgs) => {
  let { previousMessagesObj, key } = previousMessages(firstId, secondId);
  const appended = Array.isArray(msgs) ? msgs : [msgs];
  messages[key] = appended.concat(previousMessagesObj);
}

const getRoom = (firstId, secondId) => {
  return rooms[`${firstId}-${secondId}-room`] || rooms[`${secondId}-${firstId}-room`];
}

const createRoom = (firstId, secondId) => {
  const room = `${firstId}-${secondId}-room`;
  rooms[room] = room;
  return room;
}


module.exports = app => {
  return function* (next) {
    this.socket.on('chatWith', ({ ownerId, targetId }) => {
      users[ownerId] = this.socket.id;
      let room = getRoom(ownerId, targetId);
      if (!room) {
        room = createRoom(ownerId, targetId);
      }
      this.socket.join(room, () => {
        this.socket.emit('roomJoined', { previousMessages: previousMessages(ownerId, targetId).previousMessagesObj });
      });
    });

    this.socket.on('send', ({ ownerId, targetId, messages: msg }) => {
      append(ownerId, targetId, msg);
      this.socket.emit('echo', { messages: msg });
      const room = getRoom(ownerId, targetId);
      console.log(rooms)
      this.socket.to(room).emit('reback', { messages: msg });
    });

    yield* next;
  };
};
