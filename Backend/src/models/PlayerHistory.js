import mongoose from "mongoose";

const playerHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //user model
      require: true
      //forign key from User _id
    },
    room_id: {
      type: String,
      required: true,   // not "require"
      unique: true,     // each room_id should only appear once
    },
    username: {
      type: String,
      require: true,
    },
    points: {
      type: Number,
      require: true,
    },
    mmrChange: {
      type: Number,
    },
    rank: {
      type: String,
    },
  },
  { timestamps: true }
);

const PlayerHistory = mongoose.model("PlayerHistory", playerHistorySchema)

export default PlayerHistory;