import {
  createRoomInDBPublic,
  updateRoomStatusDBPublic,
} from "../controller/room.controller.js";

// --- RANKS & RANGES ---
const RANK_RANGES = [
  { id: 1, minRank: "Bronze I", maxRank: "Silver III" },
  { id: 2, minRank: "Silver I", maxRank: "Gold III" },
  { id: 3, minRank: "Gold I", maxRank: "Platinum III" },
  { id: 4, minRank: "Platinum I", maxRank: "Diamond III" },
  { id: 5, minRank: "Diamond III", maxRank: "Master III" },
  { id: 6, minRank: "Master I", maxRank: "Grandmaster III" },
];

const ALL_RANKS = [
  "Bronze I",
  "Bronze II",
  "Bronze III",
  "Silver I",
  "Silver II",
  "Silver III",
  "Gold I",
  "Gold II",
  "Gold III",
  "Platinum I",
  "Platinum II",
  "Platinum III",
  "Diamond I",
  "Diamond II",
  "Diamond III",
  "Master I",
  "Master II",
  "Master III",
  "Grandmaster I",
  "Grandmaster II",
  "Grandmaster III",
];

// Check if player rank is in a range
function isRankInRange(playerRank, range) {
  const playerIndex = ALL_RANKS.indexOf(playerRank);
  const minIndex = ALL_RANKS.indexOf(range.minRank);
  const maxIndex = ALL_RANKS.indexOf(range.maxRank);
  return playerIndex >= minIndex && playerIndex <= maxIndex;
}

// Get rank range object for a player
function getRankRangeForPlayer(playerRank) {
  return RANK_RANGES.find((range) => isRankInRange(playerRank, range));
}

// --- Matchmaking queues ---
const queues = {}; // { rankRangeId: [{ userId, username, rank, socketId }] }
const ROOM_SIZE = 2;

export const initMatchmaking = (io, socket) => {
  const leaveQueue = ({ userId, rank }) => {
    const rankRange = getRankRangeForPlayer(rank);
    if (!rankRange || !queues[rankRange.id]) return;

    queues[rankRange.id] = queues[rankRange.id].filter(
      (p) => p.userId !== userId
    );

    // Notify all players in the queue
    queues[rankRange.id].forEach((p) => {
      io.to(p.socketId).emit(
        "queueUpdate",
        queues[rankRange.id].map((pl) => pl.username)
      );
    });

    console.log(`User ${userId} left queue for rankRange ${rankRange.id}`);
  };

  // --- Join Queue ---
  socket.on("joinQueue", async ({ userId, username, rank }) => {
    if (!userId || !username || !rank) {
      return socket.emit("queueError", { message: "Missing required data" });
    }

    const rankRange = getRankRangeForPlayer(rank);
    if (!rankRange)
      return socket.emit("queueError", { message: "Invalid rank" });

    if (!queues[rankRange.id]) queues[rankRange.id] = [];

    // Remove duplicate if exists
    queues[rankRange.id] = queues[rankRange.id].filter(
      (p) => p.userId !== userId
    );

    // Add user to queue
    queues[rankRange.id].push({ userId, username, rank, socketId: socket.id });

    // Notify all players
    queues[rankRange.id].forEach((p) => {
      io.to(p.socketId).emit(
        "queueUpdate",
        queues[rankRange.id].map((pl) => pl.username)
      );
    });

    console.log(
      `Queue ${rankRange.id}: `,
      queues[rankRange.id].map((p) => p.username)
    );

    // Create room if enough players
    if (queues[rankRange.id].length >= ROOM_SIZE) {
      const playersToMatch = queues[rankRange.id].splice(0, ROOM_SIZE);
      let difficulty = "easy";
      if (rankRange.id >= 3 && rankRange.id <= 4) difficulty = "medium";
      if (rankRange.id >= 5) difficulty = "hard";

      try {
        const room = await createRoomInDBPublic(
          playersToMatch.map((p) => ({
            userId: p.userId,
            username: p.username,
            rank: p.rank,
          })),
          rankRange.id.toString(),
          difficulty
        );

        playersToMatch.forEach((p) => {
          io.to(p.socketId).emit("gameFound", {
            room_id: room.room_id,
            players: room.players,
          });
        });

        await updateRoomStatusDBPublic(room.roomId, "playing");

        console.log(
          `Room ${room.room_id} created for ${playersToMatch.map(
            (p) => p.username
          )}`
        );
      } catch (err) {
        console.error(err);
        playersToMatch.forEach((p) => {
          io.to(p.socketId).emit("queueError", {
            message: "Failed to create room",
          });
        });
      }
    }
  });

  // --- Leave Queue ---
  socket.on("leaveQueue", (data) => leaveQueue(data));

  // --- Handle disconnect ---
  socket.on("disconnect", () => {
    const queuesIds = Object.keys(queues);
    queuesIds.forEach((rid) => {
      queues[rid] = queues[rid].filter((p) => p.socketId !== socket.id);
      queues[rid].forEach((p) =>
        io.to(p.socketId).emit(
          "queueUpdate",
          queues[rid].map((pl) => pl.username)
        )
      );
    });
    console.log(`Socket ${socket.id} disconnected and removed from all queues`);
  });
};
