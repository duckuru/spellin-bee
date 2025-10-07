import { nanoid } from "nanoid";
import redis from "../redis/client.js"; // your redis client
import {
  createRoomFromLobby,
  updateRoomStatusDBPublic,
} from "../controller/room.controller.js";

export const initLobbySockets = (io, socket) => {

  // Helper: store user → lobby mapping
  const setUserLobby = async (userId, room_id) => {
    await redis.set(`user:${userId}:lobby`, room_id, "EX", 3600);
  };

  const removeUserLobby = async (userId) => {
    await redis.del(`user:${userId}:lobby`);
  };

  // ------------------- Rejoin Lobby (on refresh) -------------------
  socket.on("rejoinLobby", async (data, callback) => {
    try {
      const { userId, username } = data;
      const room_id = await redis.get(`user:${userId}:lobby`);
      if (!room_id) return callback({ error: "No active lobby" });

      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return callback({ error: "Lobby not found" });

      const lobby = JSON.parse(stateStr);

      socket.userId = userId;
      socket.join(room_id);

      // Re-add user if missing
      if (!lobby.players.some(p => p.userId === userId)) {
        lobby.players.push({ userId, username, score: 0, isActive: true, isHost: false });
      }

      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);
      callback({ success: true, lobby });
      io.to(room_id).emit("lobbyUpdate", lobby);

      console.log(`[Rejoin] User ${username} rejoined lobby ${room_id}`);
    } catch (err) {
      console.error("rejoinLobby error:", err);
      callback({ error: err.message });
    }
  });

  // ------------------- Create Lobby -------------------
  socket.on("createLobby", async (data, callback) => {
    try {
      const { hostId, username, settings } = data;

      // Check if user is already in a lobby
      const existingRoom = await redis.get(`user:${hostId}:lobby`);
      if (existingRoom) {
        return callback({ error: "You are already in a lobby", room_id: existingRoom });
      }

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
      await setUserLobby(hostId, room_id);

      socket.userId = hostId;
      socket.join(room_id);

      callback({ success: true, room_id });
      io.to(room_id).emit("lobbyUpdate", lobbyState);

      console.log(`[CreateLobby] Host ${username} created lobby ${room_id}`);
    } catch (err) {
      console.error("createLobby error:", err);
      callback({ error: err.message });
    }
  });

  // ------------------- Join Lobby -------------------
  socket.on("joinLobby", async (data, callback) => {
    try {
      const { room_id, userId, username } = data;

      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return callback({ error: "Lobby not found" });

      const lobby = JSON.parse(stateStr);

      if (!lobby.players.some(p => p.userId === userId)) {
        lobby.players.push({ userId, username, score: 0, isActive: true, isHost: false });
      }

      lobby.players = lobby.players.slice(0, 6);

      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);
      await setUserLobby(userId, room_id);

      socket.userId = userId;
      socket.join(room_id);

      callback({ success: true, lobby });
      io.to(room_id).emit("lobbyUpdate", lobby);

      console.log(`[JoinLobby] User ${username} joined lobby ${room_id}`);
    } catch (err) {
      console.error("joinLobby error:", err);
      callback({ error: err.message });
    }
  });

  // ------------------- Leave Lobby -------------------
  socket.on("leaveLobby", async ({ room_id, userId }) => {
    try {
      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return;

      const lobby = JSON.parse(stateStr);
      lobby.players = lobby.players.filter(p => p.userId !== userId);
      await removeUserLobby(userId);

      // Promote first player if host left
      if (lobby.hostId === userId && lobby.players.length > 0) {
        lobby.hostId = lobby.players[0].userId;
        lobby.players[0].isHost = true;
      }

      // Destroy lobby if empty
      if (lobby.players.length === 0) {
        await redis.del(`lobby:${room_id}`);
        io.to(room_id).emit("lobbyUpdate", null);
        console.log(`[LeaveLobby] Lobby ${room_id} destroyed`);
        return;
      }

      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);
      socket.leave(room_id);
      io.to(room_id).emit("lobbyUpdate", lobby);
    } catch (err) {
      console.error("leaveLobby error:", err);
    }
  });

  // ------------------- Update Settings -------------------
  socket.on("updateSettings", async ({ room_id, hostId, settings }) => {
    try {
      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return;

      const lobby = JSON.parse(stateStr);
      if (lobby.hostId !== hostId) return;

      lobby.settings = { ...lobby.settings, ...settings };
      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);
      io.to(room_id).emit("lobbyUpdate", lobby);
    } catch (err) {
      console.error("updateSettings error:", err);
    }
  });

  // ------------------- Kick Player -------------------
  socket.on("kickPlayer", async ({ room_id, targetUserId }) => {
    try {
      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return;

      const lobby = JSON.parse(stateStr);

      const sender = lobby.players.find(p => p.userId === socket.userId);
      if (!sender || !sender.isHost) return;
      if (sender.userId === targetUserId) return;

      const target = lobby.players.find(p => p.userId === targetUserId);
      if (!target) return;

      lobby.players = lobby.players.filter(p => p.userId !== targetUserId);
      await redis.set(`lobby:${room_id}`, JSON.stringify(lobby), "EX", 3600);
      await removeUserLobby(targetUserId);

      io.to(room_id).emit("lobbyUpdate", lobby);

      const targetSocket = [...io.sockets.sockets.values()].find(s => s.userId === targetUserId);
      if (targetSocket) {
        targetSocket.emit("kicked");
        targetSocket.leave(room_id);
      }

      console.log(`✅ Player ${targetUserId} kicked by host ${sender.userId} from ${room_id}`);
    } catch (err) {
      console.error("kickPlayer error:", err);
    }
  });

  // ------------------- Start Game -------------------
  socket.on("startGame", async ({ room_id, hostId }, callback) => {
    try {
      const stateStr = await redis.get(`lobby:${room_id}`);
      if (!stateStr) return callback({ error: "Lobby not found" });

      const lobby = JSON.parse(stateStr);
      if (lobby.hostId !== hostId) return callback({ error: "Only host can start" });
      if (lobby.players.length < 2) return callback({ error: "At least 2 players required" });

      await createRoomFromLobby({
        room_id: lobby.room_id,
        players: lobby.players,
        rounds: lobby.settings.rounds,
        difficulty: lobby.settings.difficulty,
        turnTime: lobby.settings.turnTime,
      });

      await updateRoomStatusDBPublic(lobby.room_id, "playing");

      // ✅ Destroy lobby in Redis
        await redis.del(`lobby:${room_id}`);
        await redis.del(`user:${hostId}:lobby`);
        lobby.players.forEach(async (p) => {
          await redis.del(`user:${p.userId}:lobby`);
        });

      io.to(room_id).emit("gameStarting", { room_id: lobby.room_id });
      callback({ success: true, room_id: lobby.room_id });
    } catch (err) {
      console.error("startGame error:", err);
      callback({ error: err.message });
    }
  });

  // ------------------- Disconnect -------------------
  socket.on("disconnect", async () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });

};
