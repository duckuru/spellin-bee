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
export const updateRoomStatusDBPublic = async (roomId, status) => {
  const room = await Room.findOne({ roomId });
  if (!room) throw new Error("Room not found");
  //update room status
  room.status = status;
  await room.save();
  return room;
};

export const fetchRoom = async (roomId) => {
  //get the roomId and will be use sent to frontend as a route
  const room = await Room.findOne({ roomId });
  if (!room) throw new Error("Room not found");
  return room;
};

// maybe i will let player join back
export const updateRoomPlayerActiveDBPublic = async (roomId, players) => {
  // update the isActive in players ?

  await room.save();
  return room;
};