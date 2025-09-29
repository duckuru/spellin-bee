import mongoose from "mongoose";

const matchHistorySchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", //user model
      require: true,
      //forign key from User _id
    },
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
          mmrChange: {type: Number, required: true},
          isActive: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const MatchHistory = mongoose.model("MatchHistory", matchHistorySchema);

export default MatchHistory;
