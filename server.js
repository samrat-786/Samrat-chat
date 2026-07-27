const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

app.use(express.static("public"));
app.use(express.json());

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const file = path.join(__dirname, "users.json");
  const users = JSON.parse(fs.readFileSync(file));

  if (users.find(u => u.username === username)) {
    return res.json({ success: false, message: "User already exists" });
  }

  users.push({ username, password });

  fs.writeFileSync(file, JSON.stringify(users, null, 2));

  res.json({ success: true, message: "Registration successful" });
});
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (name) => {
    socket.username = name || "Guest";
    users[socket.id] = socket.username;

    io.emit("user list", users);
    io.emit("chat message", `${socket.username} joined the chat`);
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", `${socket.username}: ${msg}`);
  });

  socket.on("private message", (data) => {
    io.to(data.to).emit("chat message", `(Private) ${socket.username}: ${data.message}`);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user list", users);
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
