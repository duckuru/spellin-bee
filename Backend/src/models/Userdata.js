import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //user model
      require: true
      //forign key from User _id
    },
    rank: {
      type: String,
      default: "Bronze I",
    },
    mmr: {
      type: Number,
      default: 100,
    },
    level: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const UserData = mongoose.model("UserData", userDataSchema)

export default UserData;