const socket = io();

let username = "";
let profilePhoto = "";

const photoInput = document.getElementById("profilePhoto");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const login = document.getElementById("login");
const chat = document.getElementById("chat");

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const userList = document.getElementById("userList");

loginBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
if (photoInput.files.length > 0) {
  const reader = new FileReader();
  reader.onload = function (e) {
    profilePhoto = e.target.result;
  };
  reader.readAsDataURL(photoInput.files[0]);
}
  if (username === "") {
    alert("Enter your name");
    return;
  }

  socket.emit("join", username);

  login.style.display = "none";
  chat.style.display = "block";
});

socket.on("user list", (users) => {
  userList.innerHTML = '<option value="">Select User</option>';

  for (let id in users) {
    if (users[id] !== username) {
      userList.innerHTML += `<option value="${id}">${users[id]}</option>`;
    }
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value.trim() === "") return;

  if (userList.value !== "") {
    socket.emit("private message", {
      to: userList.value,
      message: input.value
    });
  } else {
    socket.emit("chat message", input.value);
  }

  input.value = "";
});

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
});
const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", async () => {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  if (!username || !password) {
    alert("সব তথ্য লিখুন");
    return;
  }

  const res = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });

  const data = await res.json();
  alert(data.message);
});
