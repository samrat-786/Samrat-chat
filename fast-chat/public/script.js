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
const voiceBtn = document.getElementById("voiceBtn");
let recorder;
let audioChunks = [];

const typing = document.getElementById("typing");

input.addEventListener("input", () => {
  socket.emit("typing");
});
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
   <small>
🕒 ${data.time} • ${data.date}
<span class="tick" style="color:red;">✓✓</span>
</small> `;

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
socket.on("image message", (data) => {
  const li = document.createElement("li");

  li.innerHTML = `
    <b>${data.from}</b><br>
    <img src="${data.image}" width="200"><br>
    <small>
🕒 ${data.time} • ${data.date}
<span class="tick" style="color:red;">✓✓</span>
</small>
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

socket.on("typing", (name) => {
  console.log("Typing:", name);
  typing.innerHTML = "✍️ " + name + " is typing...";
});
document.getElementById("reactionBox").addEventListener("click", (e) => {
  const reaction = e.target.innerText;

  socket.emit("reaction", reaction);
});

socket.on("reaction", (reaction) => {
  const li = document.createElement("li");
  li.innerHTML = `<span style="font-size:25px;">${reaction}</span>`;
  messages.appendChild(li);
});

voiceBtn.addEventListener("click", async () => {

  if (!recorder || recorder.state === "inactive") {

   try {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  recorder = new MediaRecorder(stream);

} catch (err) {
  alert("Microphone Error: " + err.message);
  return;
}

    audioChunks = [];

    recorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    recorder.onstop = () => {


 const audioBlob = new Blob(audioChunks, {
        type: "audio/webm"
      });

      const reader = new FileReader();

      reader.onload = () => {


        socket.emit("voice message", {
          audio: reader.result
        });
      };

      reader.readAsDataURL(audioBlob);
    };

    recorder.start();
    voiceBtn.innerHTML = "⏹️";

  } else {

    recorder.stop();
    voiceBtn.innerHTML = "🎤";

  }

});
socket.on("voice message", (data) => {
  const li = document.createElement("li");

  li.innerHTML = `
    <b>${data.from}</b><br>
    🎤 Voice message
    <br>
    <audio controls src="${data.audio}"></audio>
  `;

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
