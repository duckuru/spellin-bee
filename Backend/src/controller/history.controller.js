import MatchHistory from "../models/MatchHistory.js";
import PlayerHistory from "../models/PlayerHistory.js";
import UserData from "../models/Userdata.js";
import { calculateMMRChange } from "../utils/mmr.js";
import { getRankByMMR } from "../utils/rank.js";

export const saveMatchandPlayerHistory = async (room, state) => {
  try {
    if (!room || !state) throw new Error("Room or state missing");

    const playersWithMMR = [];

    for (const player of room.players) {
      const userId = player.userId.toString();
      const score = state.scores[userId] || 0;

      // ✅ Calculate MMR
      const mmrChange = calculateMMRChange(score, player.rank);

      // ✅ Update UserData with MMR + rank
      const userData = await UserData.findOne({ userId: player.userId });
      if (userData) {
        userData.mmr += mmrChange;

        // Rank promotion/demotion
        userData.rank = getRankByMMR(userData.mmr);

        await userData.save();
      }

      // Build record
      playersWithMMR.push({
        userId: player.userId,
        username: player.username,
        rank: player.rank,
        score,
        mmrChange,
        isActive: player.isActive,
      });

      // Save PlayerHistory
      await PlayerHistory.create({
        userId: player.userId,
        roomId: room._id,
        username: player.username,
        points: score,
        mmrChange,
        rank: player.rank,
      });
    }

    // Save MatchHistory
    const matchHistory = await MatchHistory.create({
      roomId: room._id,
      players: playersWithMMR,
    });

    return matchHistory;
  } catch (err) {
    console.error("❌ Failed to save histories:", err);
    throw err;
  }
};
