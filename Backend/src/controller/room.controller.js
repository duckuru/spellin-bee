import { nanoid } from "nanoid";
import Room from "../models/Room.js";


/**
 * Create a room in DB using frontend-provided data
 * @param {Object} lobbyData - Data from frontend lobby
 * @param {string} lobbyData.roomId - Room ID generated on frontend
 * @param {Array} lobbyData.players - Array of player objects { userId, username, isActive, score }
 * @param {number} lobbyData.rounds
 * @param {string} lobbyData.difficulty
 * @param {number} lobbyData.turnTime
 */
export const createRoomFromLobby = async (lobbyData) => {
  if (!lobbyData.room_id) throw new Error("roomId is required");

  // Cap maxPlayers at 6
  const maxPlayers = Math.min(lobbyData.players.length, 6);

  const room = new Room({
    room_id: lobbyData.room_id,
    status: "waiting",
    isPublic: false,
    rounds: lobbyData.rounds || 3,
    difficulty: lobbyData.difficulty || "Easy",
    turnTime: lobbyData.turnTime || 20,
    maxPlayers,
    players: lobbyData.players.map(p => ({
      userId: p.userId,
      username: p.username,
      isActive: p.isActive ?? true,
      score: p.score ?? 0
    }))
  });

  await room.save();
  console.log("Room created from lobby:", room);
  return room;
};


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

// router for fetchRoom
export const getRoomHandler = async (req, res) =>{
  try {
    const { room_id } = req.params;
    const room = await fetchRoom(room_id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};