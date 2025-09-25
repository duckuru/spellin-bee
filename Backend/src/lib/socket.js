import {Server} from "socket.io";
import http from "http";
import express from "express";
import {ENV} from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

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
  console.log("A user connected", socket.user.username)

  const userId = socket.userId
  userSocketMap[userId] = socket.id

  //io.emit() is use to sent even to all connect clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //socket.on(), we are listening for event from frontend(clients);
  socket.on("disconnect", () =>{
    console.log("A user disconnected", socket.user.username);
    delete userSocketMap[userId]
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  })
})

export {io, app, server};