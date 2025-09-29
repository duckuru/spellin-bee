import mongoose from "mongoose";

const playerHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //user model
      require: true
      //forign key from User _id
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", //user model
      require: true
      //forign key from User _id
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
      require: true,
    },
    rank: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const PlayerHistory = mongoose.model("PlayerHistory", playerHistorySchema)

export default PlayerHistory;