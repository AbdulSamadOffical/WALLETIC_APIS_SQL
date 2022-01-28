// share io instance across the app

let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server);
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("io instance is not intialized!");
    }
    return io;
  },
};
