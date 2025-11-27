const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use(bodyParser.json());

// ================================
// IN-MEMORY USER STORE
// ================================
const users = {};

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (users[username]) {
    return res.status(400).json({ error: "Username exists" });
  }

  users[username] = password;
  return res.json({ message: "Registered successfully" });
});

// ================================
// UPDATED LOGIN METHOD
// ================================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Allowed temporary login users
  const allowedUsers = {
    Ashish: "Ashish",
    Saumya: "Saumya",
  };

  if (allowedUsers[username] && allowedUsers[username] === password) {
    return res.json({ message: "Login success" });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

// ================================
// SOCKET.IO SETUP
// ================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ================================
// SOCKET EVENTS
// ================================
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send_message", (msgObj) => {
    socket.broadcast.emit("receive_message", msgObj);
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("show_typing", username);
  });

  socket.on("stop_typing", () => {
    socket.broadcast.emit("hide_typing");
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ================================
// REST TEST ROUTE
// ================================
app.get("/", (req, res) => res.send("🚀 Server is running"));

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
