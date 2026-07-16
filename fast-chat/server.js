const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {

  socket.on("join", (name) => {
  socket.username = name;
  users[name] = socket.id;

  io.emit("user list", Object.keys(users));

  io.emit("chat message", {
    from: "System",
    message: `${name} is online 🟢`,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    date: new Date().toLocaleDateString()
  });
});
socket.on("typing", () => {
  socket.broadcast.emit("typing", socket.username);
});
socket.on("reaction", (reaction) => {
  io.emit("reaction", reaction);
});
  socket.on("chat message", (msg) => {
    io.emit("chat message", {
from: socket.username,
      message: msg,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      date: new Date().toLocaleDateString()
    });
  });
socket.on("voice message", (data) => {
  const voiceData = {
    from: socket.username,
    audio: data.audio,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    date: new Date().toLocaleDateString()
  };

  io.emit("voice message", voiceData);
});
socket.on("image message", (data) => {
  const imageData = {
    from: socket.username,
    image: data.image,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    date: new Date().toLocaleDateString()
  };

  if (data.to && users[data.to]) {
    io.to(users[data.to]).emit("image message", imageData);
    socket.emit("image message", imageData);
  } else {
    io.emit("image message", imageData);
  }
});
socket.on("private message", (data) => {
  const receiver = users[data.to];

  if (receiver) {
    io.to(receiver).emit("private message", `${socket.username}: ${data.message}`);
    socket.emit("private message", `You → ${data.to}: ${data.message}`);
  }
});
  socket.on("disconnect", () => {
  if (socket.username) {

    io.emit("chat message", {
      from: "System",
      message: `${socket.username} went offline 🔴`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      date: new Date().toLocaleDateString()
    });

    delete users[socket.username];

    io.emit("user list", Object.keys(users));
  }
});

});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3000");
});
