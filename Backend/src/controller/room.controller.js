import { nanoid } from "nanoid";
import Room from "../models/Room.js";

export const createRoomInDBPublic = async (players, rank_range, difficulty) => {

  const room = new Room({
    room_id: nanoid(6),
    status: "waiting",
    isPublic: true,
    rounds: 3,
    difficulty,
    maxPlayers: players.length,
    turnTime: 20,
    rank_range,
    players,
  })

  await room.save();
  console.log("Room document:", room);
  return room;
}

// ✅ Update status of a room (e.g., waiting -> playing)
export const updateRoomStatusDBPublic = async (room_id, status) => {
  const room = await Room.findOne({ room_id });
  if (!room) throw new Error("Room not found");
  //update room status
  room.status = status;
  await room.save();
  return room;
};

export const fetchRoom = async (room_id) => {
  //get the roomId and will be use sent to frontend as a route
  const room = await Room.findOne({ room_id });
  if (!room) throw new Error("Room not found");
  return room;
};

// maybe i will let player join back
export const updateRoomPlayerActiveDBPublic = async (
  room_id,
  userId,
  isActive
) => {
  const room = await Room.findOne({ room_id });
  if (!room) throw new Error("Room not found");

  const player = room.players.find(
    (p) => p.userId.toString() === userId.toString()
  );
  if (!player) throw new Error("Player not found in this room");

  player.isActive = isActive;
  await room.save();
  return room;
};

export const updatePlayerScore = async (
  room_id,
  userId,
  score,
  absolute = false
) => {
  const room = await Room.findOne({ room_id });
  if (!room) throw new Error("Room not found");

  const player = room.players.find(
    (p) => p.userId.toString() === userId.toString()
  );
  if (!player) throw new Error("Player not found");

  if (absolute) {
    player.score = score; // overwrite
  } else {
    player.score = (player.score ?? 0) + score; // delta
  }

  await room.save();

  // Sort by score
  room.players.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return room.players;
};




// ✅ End a room when no players remain active
export const finalizeRoomIfEmpty = async (room_id) => {
  const room = await Room.findOne({ room_id });
  if (!room) return null;

  const anyActive = room.players.some((p) => p.isActive);
  if (!anyActive) {
    room.status = "finished";
    await room.save();
    return room;
  }
  return room;
};