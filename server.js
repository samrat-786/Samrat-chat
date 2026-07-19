const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

let messages = [];
if (fs.existsSync("messages.json")) {
  messages = JSON.parse(fs.readFileSync("messages.json", "utf8"));
}io.on("connection", (socket) => {

  socket.on("join", (name) => {
    socket.username = name;
    users[name] = socket.id;

    socket.emit("old messages", messages);
    io.emit("userList", Object.keys(users));

    socket.emit("private message", {
      from: "System",
      message: "আপনি লগইন করেছেন: " + name,
      time: new Date().toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
})
    });
  });

  socket.on("chat message", (message) => {
console.log("New message:", message);
    const msg = {
      from: socket.username,
      message: message,
      time: new Date().toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
})
    };
messages.push(msg);
fs.writeFileSync("messages.json", JSON.stringify(messages, null, 2));

io.emit("chat message", msg);
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
      const msg = {
        from: socket.username,
        message: data.message,
        time: new Date().toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
})
      };

      io.to(receiverId).emit("private message", msg);
      socket.emit("private message", {
        ...msg,
        from: "You"
      });
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.username];
      io.emit("userList", Object.keys(users));
    }
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
