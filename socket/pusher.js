
function pusher(user_id, balance){
    let io = require("./socket").getIo();
    const socketInfo = require("./activeClient").getClients(user_id); // get the info from the client
    console.log(socketInfo);
    io.to(socketInfo?.socket_id).emit("data", { balance:  balance}); // send the message to specfic user
    
}

module.exports = pusher;


