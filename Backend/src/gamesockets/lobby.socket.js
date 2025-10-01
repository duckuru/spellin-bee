import { nanoid } from "nanoid";
import redis from "../redis/client.js"; // your redis client
import {
  createRoomFromLobby,
  updateRoomStatusDBPublic,
} from "../controller/room.controller.js";

export const initLobbySockets = (io, socket) => {

  // Host creates a lobby
  socket.on("createLobby", async (data, callback) => {
    try {
      const { hostId, username, settings } = data;
      const room_id = nanoid(6);

      const lobbyState = {
        room_id,
        hostId,
        settings: {
          rounds: settings?.rounds || 3,
          difficulty: settings?.difficulty || "easy",
          turnTime: settings?.turnTime || 30,
        },
        players: [
          {
            userId: hostId,
            username,
            score: 0,
            isActive: true,
            isHost: true,
          },
        ],
        status: "waiting",
      };

      await redis.set(`lobby:${room_id}`, JSON.stringify(lobbyState), "EX", 3600);
      socket.join(room_id);

      callback({ success: true, room_id });
      io.to(room_id).emit("lobbyUpdate", lobbyState);
      console.log("Lobby created:", lobbyState);
    } catch (err) {
      console.error("createLobby error:", err);
      callback({ error: err.message });
    }
  });

  // Player joins a lobby
  socket.on("joinLobby", async (data, callback) => {
    try {
      const { room_id, userId, username } = data;
      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return callback({ error: "Lobby not found" });

      const lobby = JSON.parse(stateStr);

      if (!lobby.players.some(p => p.userId === userId)) {
        lobby.players.push({ userId, username, score: 0, isActive: true, isHost: false });
      }

      lobby.players = lobby.players.slice(0,6);
      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);
      socket.join(room_id);

      callback({ success: true, lobby });
      io.to(room_id).emit("lobbyUpdate", lobby);
      console.log(`${username} joined lobby ${room_id}`);
    } catch (err) {
      console.error("joinLobby error:", err);
      callback({ error: err.message });
    }
  });

  // Player leaves lobby
  socket.on("leaveLobby", async ({ room_id, userId }) => {
    try {
      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return;

      const lobby = JSON.parse(stateStr);
      lobby.players = lobby.players.filter(p => p.userId !== userId);

      // If host leaves, promote first player to host
      if (lobby.hostId === userId && lobby.players.length > 0) {
        lobby.hostId = lobby.players[0].userId;
        lobby.players[0].isHost = true;
      }

      // if host left OR no players remain → destroy lobby
      // const hostLeft = !lobby.players.some(p => p.isHost);
      // if (lobby.players.length === 0 || hostLeft) {
      //   await redis.del(`lobby:${room_id}`);
      //   io.to(room_id).emit("lobbyUpdate", null); // 🚨 tell clients to leave
      //   return;
      // }

      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);
      socket.leave(room_id);
      io.to(room_id).emit("lobbyUpdate", lobby);
    } catch (err) {
      console.error("leaveLobby error:", err);
    }
  });

  // Update settings (host only)
  socket.on("updateSettings", async ({ room_id, hostId, settings }) => {
    try {
      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return;

      const lobby = JSON.parse(stateStr);
      if (lobby.hostId !== hostId) return; // Only host can update

      lobby.settings = { ...lobby.settings, ...settings };
      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);
      io.to(room_id).emit("lobbyUpdate", lobby);
    } catch (err) {
      console.error("updateSettings error:", err);
    }
  });

  // Start game
  socket.on("startGame", async ({ room_id, hostId }, callback) => {
    try {
      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return callback({ error: "Lobby not found" });

      const lobby = JSON.parse(stateStr);
      if (lobby.hostId !== hostId) return callback({ error: "Only host can start" });
      if (lobby.players.length < 2) return callback({ error: "At least 2 players required" });

      // Persist lobby to Mongo
      await createRoomFromLobby({
        room_id: lobby.room_id,
        players: lobby.players,
        rounds: lobby.settings.rounds,
        difficulty: lobby.settings.difficulty,
        turnTime: lobby.settings.turnTime,
      });

      await updateRoomStatusDBPublic(lobby.room_id, "playing");

      lobby.status = "playing";
      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);

      io.to(room_id).emit("gameStarting", { room_id: lobby.room_id });
      callback({ success: true, room_id: lobby.room_id });
    } catch (err) {
      console.error("startGame error:", err);
      callback({ error: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
};
