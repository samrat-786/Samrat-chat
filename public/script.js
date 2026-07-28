const socket = io();

let username = "";
let selectedImage = "";

const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const login = document.getElementById("login");
const chat = document.getElementById("chat");

const form = document.getElementById("form");
const input = document.getElementById("input");
let typing = false;

input.addEventListener("input", () => {
  if (!typing) {
    typing = true;
    socket.emit("typing");
  }

  clearTimeout(window.typingTimer);

  window.typingTimer = setTimeout(() => {
    typing = false;
    socket.emit("stop typing");
  }, 3000);
});
const messages = document.getElementById("messages");
const userList = document.getElementById("userList");

const photoBtn = document.getElementById("photoBtn");
const imageInput = document.getElementById("imageInput");
const voiceBtn = document.getElementById("voiceBtn");

const imagePreview = document.getElementById("imagePreview");
const sendImageBtn = document.getElementById("sendImageBtn");
socket.on("connect", () => {
  const savedUser = localStorage.getItem("username");

  if (savedUser) {
    username = savedUser;

    socket.emit("join", username);

    login.style.display = "none";
    chat.style.display = "block";
  }
});
loginBtn.onclick = () => {
  username = usernameInput.value.trim().toLowerCase()

  if (!username) {
    alert("Enter your name");
    return;
  }

  localStorage.setItem("username", username);

  socket.emit("join", username);

  login.style.display = "none";
  chat.style.display = "block";
};


// User List

socket.on("registeredUsers", (users) => {
console.log("REGISTERED USERS:", users);
  userList.innerHTML = '<option value="">🌍 Everyone</option>';

  users.forEach((user) => {
if (!user.username) return;
    if (user.username !== username) {
      const option = document.createElement("option");
      option.value = user.username;
    option.textContent = (user.online ? "🟢 " : "⚫ ") + user.username;

      userList.appendChild(option);
    }
  });
});

socket.on("old messages", (oldMessages) => {
  oldMessages.forEach((data) => {
    const li = document.createElement("li");
if (data.from === username) {
  li.className = "my-message";
} else {
  li.className = "other-message";
}
  li.innerHTML = `
<div class="bubble">
  <b>${data.from}</b><br>
  ${data.message}
  <div class="time">🕒 ${data.time} <span id="tick-${data.id}">✓</span></div>
</div>
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
console.log("MY USER:", username);
console.log("FROM:", data.from);
  const li = document.createElement("li");
if (data.from === username) {
  li.className = "my-message";
} else {
  li.className = "other-message";
}
  const date = new Date();
  const today =
    date.getDate() + "/" +
    (date.getMonth() + 1) + "/" +
    date.getFullYear();

 li.innerHTML = `
<div class="bubble">
  <b>${data.from}</b><br>
  ${data.message}
  <div class="time">🕒 ${data.time} <span id="tick-${data.id}">✓</span></div>
</div>
`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Receive Private Message
socket.on("private message", (data) => {
  const li = document.createElement("li");
if (data.from === username || data.from === "You") {
  li.className = "my-message";
} else {
  li.className = "other-message";
}
  const date = new Date();
  const today =
    date.getDate() + "/" +
    (date.getMonth() + 1) + "/" +
    date.getFullYear();

  li.innerHTML = `
<div class="bubble">
  <b>🔒 ${data.from}</b><br>
  ${data.message}
 <div class="time">🕒 ${data.time} ✓</div>
</div>
`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
if (data.from !== "You") {
  socket.emit("message received", {
    id: data.id,
    senderId: data.senderId
  });
}
});

// Receive Public Message



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
  const li = document.createElement("li");

  if (data.from === username) {
    li.className = "my-message";
  } else {
    li.className = "other-message";
  }

  li.innerHTML = `
    <div class="bubble">
      <b>${data.from}</b><br>
      <img src="${data.image}" style="max-width:200px;border-radius:10px;">
    </div>
  `;

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
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
  try {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
let stream;

try {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });
} catch (err) {
  alert("Microphone Error: " + err.name + "\n" + err.message);
  return;
}

      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? { mimeType: "audio/webm;codecs=opus" }
    : {};

mediaRecorder = new MediaRecorder(stream, options);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
       const audioBlob = new Blob(audioChunks, {
  type: mediaRecorder.mimeType || "audio/webm"
}); 

        const reader = new FileReader();

        reader.onload = () => {
          socket.emit("voice message", {
            audio: reader.result
          });
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      voiceBtn.textContent = "⏹ Stop Voice";

    } else {
      mediaRecorder.stop();
      voiceBtn.textContent = "🎤 Voice";
    }

  } catch (err) {
    alert("Microphone Error: " + err.message);
  }
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
socket.on("typing", (name) => {
  document.getElementById("typing").textContent =
    name + " is typing...";
});

socket.on("stop typing", () => {
  document.getElementById("typing").textContent = "";
});
socket.on("message delivered", (data) => {
  const tick = document.getElementById(`tick-${data.id}`);
  if (tick) {
    tick.textContent = "✓✓";
  }
});
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.onclick = () => {
  localStorage.removeItem("username");
  username = "";
  login.style.display = "block";
  chat.style.display = "none";
  usernameInput.value = "";
};
