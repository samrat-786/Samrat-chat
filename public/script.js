const socket = io();

let username = "";
let selectedImage = "";

const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const login = document.getElementById("login");
const chat = document.getElementById("chat");

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const userList = document.getElementById("userList");

const photoBtn = document.getElementById("photoBtn");
const imageInput = document.getElementById("imageInput");
const voiceBtn = document.getElementById("voiceBtn");

const imagePreview = document.getElementById("imagePreview");
const sendImageBtn = document.getElementById("sendImageBtn");
loginBtn.onclick = () => {
  username = usernameInput.value.trim();

  if (!username) {
    alert("Enter your name");
    return;
  }

  localStorage.setItem("username", username);

  socket.emit("join", username);

  login.style.display = "none";
  chat.style.display = "block";
};

window.onload = () => {
  const savedName = localStorage.getItem("username");

  if (savedName) {
    username = savedName;
    socket.emit("join", username);
    login.style.display = "none";
    chat.style.display = "block";
  }
};
// User List
socket.on("userList", (users) => {
  userList.innerHTML = '<option value="">🌍 Everyone</option>';

  users.forEach((user) => {
    if (user !== username) {
      const option = document.createElement("option");
      option.value = user;
      option.textContent = "🟢 " + user;
      userList.appendChild(option);
    }
  });

});

socket.on("old messages", (oldMessages) => {
  oldMessages.forEach((data) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <b>${data.from}</b><br>
      ${data.message}<br>
      <small>🕒 ${data.time}</small>
    `;

    messages.appendChild(li);
  });

  messages.scrollTop = messages.scrollHeight;
});


// Send Message
form.onsubmit = (e) => {
  e.preventDefault();

  const receiver = userList.value;
  const message = input.value.trim();

  if (!message) return;

  if (receiver) {
    socket.emit("private message", {
      to: receiver,
      message: message
    });
  } else {
    socket.emit("chat message", message);
  }

  input.value = "";
};// Receive Public Message
socket.on("chat message", (data) => {
  const li = document.createElement("li");

  const date = new Date();
  const today =
    date.getDate() + "/" +
    (date.getMonth() + 1) + "/" +
    date.getFullYear();

  li.innerHTML = `
    <b>${data.from}</b><br>
    ${data.message}<br>
    <small>🕒 ${data.time} | 📅 ${today}</small>
  `;

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Receive Private Message
socket.on("private message", (data) => {
  const li = document.createElement("li");

  const date = new Date();
  const today =
    date.getDate() + "/" +
    (date.getMonth() + 1) + "/" +
    date.getFullYear();

  li.innerHTML = `
    <b>${data.from}</b><br>
    ${data.message}<br>
    <small>🕒 ${data.time || ""} | 📅 ${today}</small>
  `;

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});


// Receive Public Message


voiceBtn.onclick = () => {
  alert("🎤 Voice Message feature is coming...");
};
photoBtn.onclick = () => {
  imageInput.click();
};
imageInput.onchange = () => {
  const file = imageInput.files[0];

  if (file) {
    const reader = new FileReader();

 reader.onload = () => {
  selectedImage = reader.result;
  imagePreview.src = selectedImage;
  imagePreview.style.display = "block";
  sendImageBtn.style.display = "block";
};

    reader.readAsDataURL(file);
  }
};
socket.on("image message", (data) => {
  const img = document.createElement("img");
  img.src = data.image;
  img.style.width = "200px";

  const li = document.createElement("li");
  li.textContent = data.from + ": ";
  li.appendChild(img);

  messages.appendChild(li);
});
sendImageBtn.onclick = () => {
  if (selectedImage) {
    socket.emit("image message", {
      image: selectedImage
    });

    imagePreview.style.display = "none";
    sendImageBtn.style.display = "none";
    selectedImage = "";
  }
};

let mediaRecorder;
let audioChunks = [];

voiceBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    audioChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const reader = new FileReader();

    reader.onload = () => {
      socket.emit("voice message", {
        audio: reader.result
      });
    };

    reader.readAsDataURL(audioBlob);
  };

  mediaRecorder.start();

  setTimeout(() => {
    mediaRecorder.stop();
  }, 5000);
};

socket.on("voice message", (data) => {
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = data.audio;

  const li = document.createElement("li");
  li.textContent = data.from + ": ";
  li.appendChild(audio);

  messages.appendChild(li);
});
