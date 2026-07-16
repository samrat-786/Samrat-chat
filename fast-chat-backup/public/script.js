const socket = io();

const login = document.getElementById("login");
const chat = document.getElementById("chat");
const username = document.getElementById("username");
const join = document.getElementById("join");

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const userList = document.getElementById("userList");
const imageInput = document.getElementById("imageInput");
join.onclick = () => {
  if (username.value.trim() !== "") {
    socket.emit("join", username.value);
    login.style.display = "none";
    chat.style.display = "block";
  }
};
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = () => {
      const to = userList.value;

socket.emit("image message", {
  to: to,
  image: reader.result
});
    };

    reader.readAsDataURL(file);
  }
});
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value.trim() !== "") {
    const to = userList.value;

    if (to === "all") {
      socket.emit("chat message", input.value);
    } else {
      socket.emit("private message", {
        to,
        message: input.value
      });
    }

    input.value = "";
  }
});

socket.on("chat message", (data) => {
  const li = document.createElement("li");

  li.innerHTML = `
    <b>${data.from}</b><br>
    ${data.message}<br>
    <small>🕒 ${data.time} • ${data.date}</small>
  `;

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
socket.on("image message", (data) => {
  const li = document.createElement("li");

  li.innerHTML = `
    <b>${data.from}</b><br>
    <img src="${data.image}" width="200"><br>
    <small>🕒 ${data.time} • ${data.date}</small>
  `;

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
socket.on("private message", (msg) => {
  const li = document.createElement("li");
  li.innerHTML = "<b>🔒 " + msg + "</b>";
  messages.appendChild(li);
});

socket.on("user list", (users) => {
  userList.innerHTML = '<option value="all">🌍 Everyone</option>';

  users.forEach((user) => {
    if (user !== username.value) {
      const option = document.createElement("option");
      option.value = user;
      option.textContent = user;
      userList.appendChild(option);
    }
  });
});
