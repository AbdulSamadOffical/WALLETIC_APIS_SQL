let clients = [];
// client state
module.exports = {
  activeClients: (user_id, socket_id) => {
    clients.push({ user_id: user_id, socket_id: socket_id });

    return clients;
  },
  // select the socketInfo to send the data from server to client
  getClients: (user_id) => {
    let val;
    for (let i = 0; i < clients.length; i++) {
      val = clients[i];
      if (clients[i].user_id == user_id) {
        break;
      }
    }
    return val;
  },
  deleteClients: (socket_id)=> {
    const filteredClients = clients.filter((client) => {
      return client.socket_id != socket_id
    })
    clients = filteredClients;
    return clients
  }
};
