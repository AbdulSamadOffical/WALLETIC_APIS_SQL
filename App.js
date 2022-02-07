const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const accountRoutes = require("./Routes/Account");
const authRoutes = require("./Routes/Auth");
// const connection = require("./DB/connection");
const auth = require("./Middleware/Authorization");

app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  res.json({ message: "Your api's are working correctly!" });
});

// app.post("/", auth, (req, res, next) => {
//   console.log(req.user);
//   res.json({ message: "your apis are up!" });
// });

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
// error handling middleware
app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});

// error handling for invalid  routes
app.use((req, res, next) => {
  res.status(404).json({});
});

// console.log(conn);
let server;

server = app.listen(process.env.PORT || 3000, () => {
  // console.log("server is running on port 3000");
  let io = require("./socket/socket").init(server); // intialize socket
  io.on("connection", (socket) => {
    // open a connection
    console.log("client is connected!");
    console.log(socket.id);
    socket.on("user_id", (data) => {
      // recive id from client
      const result = require("./socket/activeClient").activeClients(
        // manage state for the connected sockets
        data,
        socket.id
      );
      console.log(result);
    });
    // socket.emit("data", { balance: 2000 });
  });
});
