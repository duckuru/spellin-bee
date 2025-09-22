// utils/userResponse.js
import UserData from "../models/Userdata.js";

export const formatUserResponse = async (user) => {
  const userData = await UserData.findOne({ userId: user._id });

  if (!userData) {
    console.warn(`UserData missing for user ${user._id}`);
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
    userData: {
      rank: userData?.rank ?? "Unknown",
      mmr: userData?.mmr ?? 0,
      level: userData?.level ?? 0,
    },
  };
};
