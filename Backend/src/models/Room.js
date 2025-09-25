import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    room_id: {
      type: String,
      require: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
    },
    isPublic: { type: Boolean, default: true },

    rounds: { type: Number, require: true, default: 3 },
    difficulty: {
      type: String,
      require: true,
      enum: ["easy", "medium", "hard"],
    },
    maxPlayers: { type: Number, require: true, default: 6 },
    turnTime: { type: Number, require: true, default: 20 },

    rank_range: { type: String, require: true },
    players: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          username: { type: String, required: true },
          rank: { type: String, required: true },
          score: { type: Number, default: 0 },
          isActive: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema)

export default Room;