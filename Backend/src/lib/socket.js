import {Server} from "socket.io";
import http from "http";
import express from "express";
import {ENV} from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import { initMatchmaking } from "../gamesockets/matchmaking.js";
import { initRoomSockets } from "../gamesockets/room.socket.js";

const app = express();
const server = http.createServer(app);

//socket server

// will auth socket client
const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  }
});

//apply auth middleware to all socket user
io.use(socketAuthMiddleware)

const userSocketMap = {} //{userId:socketId} storing

//listen for event
io.on("connection", (socket) => {
  console.log("A user connected", socket.user.username);
  console.log("Socket ID:", socket.id); // <-- log the socket ID

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  //io.emit() is use to sent even to all connect clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  initMatchmaking(io, socket);
  initRoomSockets(io, socket);

  //socket.on(), we are listening for event from frontend(clients);
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.username);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
})

export {io, app, server};