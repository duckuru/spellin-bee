import User from "../models/User.js";
import UserData from "../models/Userdata.js";

/**
 * Express route handler for /leaderboard
 * Returns all users sorted by mmr descending, and also the current auth user
 */
export const getLeaderboardSorted = async (req, res) => {
  try {
    const authUserId = req.user._id.toString(); // from protectRoute

    // 1. Get all users
    const users = await User.find({}).lean();
    const userIds = users.map(u => u._id.toString());

    // 2. Get corresponding user data
    const userDatas = await UserData.find({ userId: { $in: userIds } }).lean();

    // 3. Merge users with their mmr
    const merged = users.map(u => {
      const data = userDatas.find(d => d.userId.toString() === u._id.toString());
      return {
        userId: u._id,
        username: u.username,
        mmr: data?.mmr || 0
      };
    });

    // 4. Sort descending by mmr
    const sorted = merged.sort((a, b) => b.mmr - a.mmr);

    // 5. Identify auth user
    const authUser = sorted.find(u => u.userId.toString() === authUserId);

    return res.json({ allUsers: sorted, authUser });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
