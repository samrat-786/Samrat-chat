const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};
let userStatus = {};

io.on("connection", (socket) => {

  socket.on("join", (name) => {
  socket.username = name.trim().toLowerCase();
    users[name] = socket.id;
userStatus[name] = "online";
io.emit("registeredUsers",
  Object.keys(userStatus).map(name => ({
    username: name,
    online: userStatus[name] === "online"
  }))
);

   socket.emit("private message", {
  from: "System",
  message: "আপনি লগইন করেছেন: " + name,
  time: new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata"
})
});
  });
socket.on("chat message", (message) => {
const msgId = Date.now();
  io.emit("chat message", {
  from: socket.username,
  message: message,
  time: new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata"
}),
  id: msgId
});
});
socket.on("image message", (data) => {
  io.emit("image message", {
    from: socket.username,
    image: data.image
  });
});
socket.on("voice message", (data) => {
  io.emit("voice message", {
    from: socket.username,
    audio: data.audio
  });
});
  socket.on("private message", (data) => {
    const receiverId = users[data.to];

    if (receiverId) {
      io.to(receiverId).emit("private message", {
        from: socket.username,
        message: data.message
      });

      socket.emit("private message", {
        from: "You",
        message: data.message
      });
    }
  });
socket.on("message received", (data) => {
  io.to(data.senderId).emit("message delivered", {
    id: data.id
  });
});
  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.username];
userStatus[socket.username] = "offline";
     io.emit("registeredUsers",
  Object.keys(userStatus).map(name => ({
    username: name,
    online: userStatus[name] === "online"
  }))
);
    }
  });

});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
