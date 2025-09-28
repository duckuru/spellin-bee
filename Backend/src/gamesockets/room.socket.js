// src/sockets/room.sockets.js
import {
  fetchRoom,
  updateRoomPlayerActiveDBPublic,
  finalizeRoomIfEmpty,
  updatePlayerScore,
  updateRoomStatusDBPublic,
} from "../controller/room.controller.js";
import redis from "../redis/client.js";
import fs from "fs";
import axios from "axios";

const wordsData = JSON.parse(fs.readFileSync("./src/word/words.json", "utf8"));

// --- In-memory maps for timers ---
const roomIntervals = new Map(); // { room_id -> intervalId }
const roomPreTurnTimeouts = new Map(); // { room_id -> timeoutId }

// --- Helpers ---
async function getOrCreateState(room_id, roomFromDb) {
  const redisKey = `room:${room_id}`;
  const s = await redis.get(redisKey);
  if (s) return JSON.parse(s);

  const room = roomFromDb || (await fetchRoom(room_id));
  const state = {
    currentRound: 1,
    turnQueue: (room?.players || [])
      .filter((p) => p.isActive)
      .map((p) => p.userId.toString()),
    currentTurnPlayerId: null,
    turnTimeLeft: room?.turnTime || 20,
    scores: Object.fromEntries(
      (room?.players || []).map((p) => [p.userId.toString(), p.score ?? 0])
    ),
    wordsUsed: [],
    status: "playing",
    difficulty: room?.difficulty || "easy",
    maxPlayers: room?.maxPlayers || 6,
    turnTime: room?.turnTime || 20,
    maxRounds: room?.rounds || 3,
    currentTurnWord: null, // <-- persist current turn word
  };
  await redis.set(redisKey, JSON.stringify(state));
  return state;
}

async function saveState(room_id, state) {
  const redisKey = `room:${room_id}`;
  await redis.set(redisKey, JSON.stringify(state));
}

async function pickWordAndData(difficulty) {
  const wordList = wordsData[difficulty] || wordsData.easy;
  const word = wordList[Math.floor(Math.random() * wordList.length)];
  let wordData = { word, definition: "", audio: "" };
  try {
    const res = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word
      )}`
    );
    wordData.definition =
      res.data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";
    wordData.audio = res.data?.[0]?.phonetics?.[0]?.audio || "";
  } catch (e) {
    console.warn("Dictionary API failed for word:", word);
  }
  return wordData;
}

// --- Room Finish ---
async function finishRoom(io, room_id, state) {
  state.status = "finished";
  await saveState(room_id, state);

  for (const [pid, score] of Object.entries(state.scores)) {
    await updatePlayerScore(room_id, pid, score, true);
  }

  await updateRoomStatusDBPublic(room_id, "finished");
  io.to(room_id).emit("roomFinished", { message: "Game finished." });
  await finalizeRoomIfEmpty(room_id);

  clearRoomInterval(room_id);
  const t = roomPreTurnTimeouts.get(room_id);
  if (t) clearTimeout(t);
  roomPreTurnTimeouts.delete(room_id);

  await redis.del(`room:${room_id}`);
}

// --- Turn Handling ---
async function startTurnForRoom(io, room_id) {
  const room = await fetchRoom(room_id);
  if (!room) return;

  let state = await getOrCreateState(room_id, room);

  // Remove inactive players
  const activeIds = room.players
    .filter((p) => p.isActive)
    .map((p) => p.userId.toString());
  state.turnQueue = state.turnQueue.filter((id) => activeIds.includes(id));

  // Empty queue → next round
  if (!state.turnQueue || state.turnQueue.length === 0) {
    state.currentRound += 1;
    if (state.currentRound > state.maxRounds) {
      return finishRoom(io, room_id, state);
    }
    state.turnQueue = activeIds;
  }

  if (!state.turnQueue.length || state.status !== "playing") {
    await saveState(room_id, state);
    return;
  }

  // Pick next player
  const nextIndex = Math.floor(Math.random() * state.turnQueue.length);
  const playerId = state.turnQueue.splice(nextIndex, 1)[0];

  state.currentTurnPlayerId = playerId;
  state.turnTimeLeft = state.turnTime || 20;

  // Word
  const wordData = await pickWordAndData(state.difficulty);
  state.wordsUsed = [...(state.wordsUsed || []), wordData.word];
  state.currentTurnWord = wordData; // <-- save word in state

  await saveState(room_id, state);

  io.to(room_id).emit("turnStart", {
    playerId,
    word: wordData,
    currentRound: state.currentRound,
    turnTimeLeft: state.turnTimeLeft,
  });

  ensureTurnInterval(io, room_id);
}

function ensureTurnInterval(io, room_id) {
  if (roomIntervals.has(room_id)) return;

  const tick = async () => {
    const redisKey = `room:${room_id}`;
    const str = await redis.get(redisKey);
    if (!str) {
      clearRoomInterval(room_id);
      return;
    }
    const s = JSON.parse(str);

    if (!s || !s.currentTurnPlayerId || s.status !== "playing") return;

    s.turnTimeLeft = Math.max(0, s.turnTimeLeft - 1);
    await saveState(room_id, s);

    io.to(room_id).emit("turnTimeUpdate", {
      playerId: s.currentTurnPlayerId,
      timeLeft: s.turnTimeLeft,
    });

    if (s.turnTimeLeft <= 0) {
      const endedPlayer = s.currentTurnPlayerId;
      s.currentTurnPlayerId = null;
      s.currentTurnWord = null; // <-- clear word when turn ends

      await saveState(room_id, s);
      io.to(room_id).emit("turnEnded", { playerId: endedPlayer });

      await updatePlayerScore(
        room_id,
        endedPlayer,
        s.scores[endedPlayer] || 0,
        true
      );
      schedulePreTurnIfNeeded(io, room_id, 5000);
    }
  };

  const intervalId = setInterval(tick, 1000);
  roomIntervals.set(room_id, intervalId);
}

function clearRoomInterval(room_id) {
  const id = roomIntervals.get(room_id);
  if (id) {
    clearInterval(id);
    roomIntervals.delete(room_id);
  }
}

function scheduleStartIn(io, room_id, ms = 5000) {
  const existing = roomPreTurnTimeouts.get(room_id);
  if (existing) clearTimeout(existing);

  const timeout = setTimeout(async () => {
    roomPreTurnTimeouts.delete(room_id);
    await startTurnForRoom(io, room_id);
  }, ms);

  roomPreTurnTimeouts.set(room_id, {
    timeoutId: timeout,
    _start: Date.now(),
    _ms: ms,
  });
}

async function schedulePreTurnIfNeeded(io, room_id, ms = 10000) {
  const sStr = await redis.get(`room:${room_id}`);
  if (!sStr) return;
  const s = JSON.parse(sStr);
  if (
    !s.currentTurnPlayerId &&
    !roomPreTurnTimeouts.has(room_id) &&
    s.status === "playing"
  ) {
    const countdownSeconds = Math.floor(ms / 1000);
    io.to(room_id).emit("preTurn", { countdown: countdownSeconds });
    scheduleStartIn(io, room_id, ms);
  }
}

// --- Socket Init ---
export const initRoomSockets = (io, socket) => {
  // Join Room
  socket.on("joinRoom", async ({ room_id, userId, username }) => {
    try {
      const room = await fetchRoom(room_id);
      if (!room)
        return socket.emit("roomError", { message: "Room not found." });

      if (room.status === "finished") {
        return socket.emit("roomFinishedAlready", {
          message: "Game already finished.",
        });
      }

      const player = room.players.find(
        (p) => p.userId.toString() === userId.toString()
      );
      if (!player || !player.isActive) {
        return socket.emit("roomFinishedAlready", { message: "Cannot join." });
      }

      await updateRoomPlayerActiveDBPublic(room_id, userId, true);
      socket.join(room_id);

      await getOrCreateState(room_id, room);

      const stateStr = await redis.get(`room:${room_id}`);
      const state = JSON.parse(stateStr);

      // Send full room state including current word
      io.to(socket.id).emit("roomState", {
        currentTurnPlayerId: state.currentTurnPlayerId,
        turnTimeLeft: state.turnTimeLeft,
        currentRound: state.currentRound,
        scores: state.scores,
        currentTurnWord: state.currentTurnWord || null,
      });

      io.to(room_id).emit("roomUpdate", room.players);

      // Handle pre-turn countdown for new client
      if (!state.currentTurnPlayerId && roomPreTurnTimeouts.has(room_id)) {
        const t = roomPreTurnTimeouts.get(room_id);
        const elapsed = Math.floor((Date.now() - t._start) / 1000);
        const remaining = Math.max(0, Math.ceil(t._ms / 1000 - elapsed));
        io.to(socket.id).emit("preTurn", { countdown: remaining });
      } else {
        await schedulePreTurnIfNeeded(io, room_id);
      }

      console.log(`${username} joined room ${room_id}`);
    } catch (err) {
      console.error("joinRoom error:", err);
      socket.emit("roomError", { message: "Failed to join room" });
    }
  });

  // Typing
  socket.on("typing", ({ room_id, userId, text }) => {
    socket.to(room_id).emit("typing", { userId, text });
  });

  // Start Turn
  socket.on("startTurn", async ({ room_id }) => {
    const stateStr = await redis.get(`room:${room_id}`);
    const state = stateStr ? JSON.parse(stateStr) : null;
    if (state && state.currentTurnPlayerId) return;
    await startTurnForRoom(io, room_id);
  });

  // Get Room State
  socket.on("getRoomState", async ({ room_id }) => {
    const stateStr = await redis.get(`room:${room_id}`);
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    io.to(socket.id).emit("roomState", {
      currentTurnPlayerId: state.currentTurnPlayerId,
      turnTimeLeft: state.turnTimeLeft,
      currentRound: state.currentRound,
      scores: state.scores,
      currentTurnWord: state.currentTurnWord || null,
    });
  });

  // Submit Answer
  socket.on("submitAnswer", async ({ room_id, userId, answer, word }) => {
    try {
      const redisKey = `room:${room_id}`;
      const stateStr = await redis.get(redisKey);
      if (!stateStr) return;
      const state = JSON.parse(stateStr);

      if (userId !== state.currentTurnPlayerId) return;

      const isCorrect =
        (answer || "").toLowerCase() === (word || "").toLowerCase();
      if (isCorrect) state.scores[userId] = (state.scores[userId] || 0) + 10;

      const endedPlayer = state.currentTurnPlayerId;
      state.currentTurnPlayerId = null;
      state.turnTimeLeft = 0;
      state.currentTurnWord = null; // <-- clear word

      await saveState(room_id, state);
      await updatePlayerScore(room_id, userId, state.scores[userId], true);

      io.to(room_id).emit("scoreUpdate", state.scores);
      io.to(room_id).emit("answerResult", { userId, isCorrect });
      io.to(room_id).emit("turnEnded", { playerId: endedPlayer });

      schedulePreTurnIfNeeded(io, room_id, 5000);
    } catch (err) {
      console.error("submitAnswer error:", err);
    }
  });

  // Leave Room / Disconnect
  socket.on("leaveRoom", async ({ room_id, userId }) => {
    try {
      const room = await fetchRoom(room_id);
      if (!room) return;
      const player = room.players.find(
        (p) => p.userId.toString() === userId.toString()
      );
      const username = player?.username || "Unknown";

      await updateRoomPlayerActiveDBPublic(room_id, userId, false);

      const redisKey = `room:${room_id}`;
      const stateStr = await redis.get(redisKey);
      if (stateStr) {
        let state = JSON.parse(stateStr);
        state.turnQueue = state.turnQueue.filter((id) => id !== userId);

        if (state.currentTurnPlayerId === userId) {
          state.currentTurnPlayerId = null;
          state.turnTimeLeft = 0;
          state.currentTurnWord = null;
          await saveState(room_id, state);

          io.to(room_id).emit("turnEnded", { playerId: userId });
          schedulePreTurnIfNeeded(io, room_id, 5000);
        } else {
          await saveState(room_id, state);
        }
      }

      const updated = await finalizeRoomIfEmpty(room_id);

      socket.to(room_id).emit("playerLeftRoom", {
        username,
        message: `${username} left`,
        userId,
      });
      socket.emit("youLeftRoom", { room_id, message: `You left room` });
      io.to(room_id).emit("roomUpdate", updated.players);

      if (updated.status === "finished") {
        const s = await redis.get(redisKey);
        if (s) await finishRoom(io, room_id, JSON.parse(s));
      }

      socket.leave(room_id);
    } catch (err) {
      console.error("leaveRoom error:", err);
    }
  });

  socket.on("disconnect", async () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    for (const room_id of rooms) {
      const userId = socket.handshake.auth?.userId;
      if (!userId) continue;

      await updateRoomPlayerActiveDBPublic(room_id, userId, false);

      const redisKey = `room:${room_id}`;
      const stateStr = await redis.get(redisKey);
      if (stateStr) {
        let state = JSON.parse(stateStr);
        state.turnQueue = state.turnQueue.filter((id) => id !== userId);

        if (state.currentTurnPlayerId === userId) {
          state.currentTurnPlayerId = null;
          state.turnTimeLeft = 0;
          state.currentTurnWord = null;
          await saveState(room_id, state);

          io.to(room_id).emit("turnEnded", { playerId: userId });
          schedulePreTurnIfNeeded(io, room_id, 5000);
        } else {
          await saveState(room_id, state);
        }
      }

      const updated = await finalizeRoomIfEmpty(room_id);
      io.to(room_id).emit("roomUpdate", updated.players);

      if (updated.status === "finished") {
        const s = await redis.get(redisKey);
        if (s) await finishRoom(io, room_id, JSON.parse(s));
      }
    }
  });
};
