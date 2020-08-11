const getUrl = window.location;
const baseUrl = getUrl.protocol + "//" + getUrl.host;
console.log(baseUrl);
const socket = io(baseUrl);

/* DOM */

const messageContainer = document.getElementById("message-container");
const scrollContainer = document.getElementById("scrollContainer");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

/* Regex */

const URLexpression = /[a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const URLregex = new RegExp(URLexpression);

/* Code */

const urlStringCheck = (s) => {
  return s.match(URLregex);
};

function createUrlFromString(s) {
  let finalMsg = "";
  s.split(" ").forEach(el => {
    finalMsg += " ";
    if (el.match(URLregex)) {
      finalMsg += `<a href="${el}">${el}</a>`;
    } else {
      finalMsg += el;
    }
  });
  return finalMsg;
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

if (messageForm != null) {
  let name = getCookie("name");
  if (name == "") {
    name = prompt("What is your name?");
    if (name != "" && name != null) {
      setCookie("name", name, 365);
    }
  }

  appendMessage("You joined");
  socket.emit("new-user", roomName, name);

  messageForm.addEventListener("submit", e => {
    e.preventDefault();
    const message = messageInput.value;
    if (message != "") {
      if (!urlStringCheck(message)) {
        appendMessage(`You: ${message}`, "You");
        socket.emit("send-chat-message", roomName, message);
        messageInput.value = "";
      } else {
        appendMessage(`You: ${createUrlFromString(message)}`, "You", "html");
      }
    }
  });
}

socket.on("room-created", room => {
  const roomElement = document.createElement("div");
  roomElement.classList.add("room-tab");
  roomElement.innerText = room;
  const roomLink = document.createElement("a");
  roomLink.href = `/${room}`;
  roomLink.innerText = " - join";
  roomContainer.append(roomElement);
  roomElement.append(roomLink);
});

socket.on("chat-message", data => {
  appendMessage(`${data.name}: ${data.message}`, "Else");
});

socket.on("user-connected", name => {
  appendMessage(`${name} joined`, "Status");
});

socket.on("user-disconnected", name => {
  appendMessage(`${name} left`, "Status");
});

function appendMessage(message, sender, mode = "text") {
  const messageElement = document.createElement("div");
  const y = scrollContainer.getBoundingClientRect().top + window.scrollY;
  window.scroll({
    top: y,
    behavior: 'smooth'
  });
  if (sender == "You") {
    messageElement.classList.add(
      "animated",
      "fadeInRight",
      "faster",
      "fromYou"
    );
  } else if (sender == "Status") {
    messageElement.classList.add(
      "animated",
      "fadeInLeft",
      "faster",
      "statusMsg"
    );
  } else {
    messageElement.classList.add(
      "animated",
      "fadeInLeft",
      "faster",
      "fromElse"
    );
  }
  if (mode == "text") messageElement.innerText = message;
  if (mode == "html") messageElement.innerHTML = message;

  messageContainer.append(messageElement);
}
