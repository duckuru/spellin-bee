import Room from "../models/Room.js";

export const initRoomSockets = (io, socket) => {
  // --- Join Room ---
  socket.on("joinRoom", async ({ room_id, userId, username }) => {
    try {
      if (!room_id || !userId || !username) return;

      // Fetch room from DB
      const room = await Room.findOne({ room_id: room_id });
      if (!room) {
        return socket.emit("roomError", { message: "Room not found" });
      }

      // Check if user already in room
      const existingPlayer = room.players.find(
        (p) => p.userId.toString() === userId
      );

      if (!existingPlayer) {
        room.players.push({ userId, username, isActive: true });
        await room.save();
      } else {
        // If reconnecting after refresh, mark active
        existingPlayer.isActive = true;
        await room.save();
      }

      // Join Socket.IO room
      socket.join(room_id);

      // Emit updated player list to all in room
      io.to(room_id).emit(
        "roomUpdate",
        room.players.map((p) => ({
          userId: p.userId,
          username: p.username,
          isActive: p.isActive,
        }))
      );

      console.log(`${username} joined room ${room_id}`);
    } catch (err) {
      console.error("joinRoom error:", err);
      socket.emit("roomError", { message: "Failed to join room" });
    }
  });

  // --- Handle disconnect ---
  socket.on("disconnect", async () => {
    try {
      // Get all rooms the socket was in
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);

      for (const roomId of rooms) {
        const room = await Room.findOne({ room_id: roomId });
        if (!room) continue;

        // Mark user as inactive if exists
        const player = room.players.find((p) => p.socketId === socket.id);
        if (player) {
          player.isActive = false;
          await room.save();
        }

        // Emit updated room to all remaining players
        io.to(roomId).emit(
          "roomUpdate",
          room.players.map((p) => ({
            userId: p.userId,
            username: p.username,
            isActive: p.isActive,
          }))
        );

        console.log(`Socket ${socket.id} disconnected from room ${roomId}`);
      }
    } catch (err) {
      console.error("Disconnect room update error:", err);
    }
  });
};
