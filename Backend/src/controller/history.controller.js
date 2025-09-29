// Save match and player history after a room finishes
import MatchHistory from "../models/MatchHistory.js";
import PlayerHistory from "../models/PlayerHistory.js";
import UserData from "../models/Userdata.js";
import { calculateMMRChange } from "../utils/mmr.js";
import { getRankByMMR } from "../utils/rank.js";

// Save match and player history after a room finishes
export const saveMatchandPlayerHistory = async (room, state) => {
  try {
    if (!room || !state) throw new Error("Room or state missing");

    const playersWithMMR = [];

    for (const player of room.players) {
      const userId = player.userId.toString();
      const score = state.scores[userId] || 0;

      // ✅ Calculate MMR change
      const mmrChange = calculateMMRChange(score, player.rank);

      // ✅ Update UserData with MMR + rank
      const userData = await UserData.findOne({ userId: player.userId });
      if (userData) {
        userData.mmr += mmrChange;
        userData.rank = getRankByMMR(userData.mmr);
        await userData.save();
      }

      // Build record for MatchHistory
      playersWithMMR.push({
        userId: player.userId,
        username: player.username,
        rank: player.rank,
        score,
        mmrChange,
        isActive: player.isActive,
      });

      // ✅ Upsert PlayerHistory to prevent duplicates
      await PlayerHistory.findOneAndUpdate(
        { room_id: room.room_id, userId: player.userId },
        {
          username: player.username,
          points: score,
          mmrChange,
          rank: player.rank,
        },
        { upsert: true, new: true }
      );
    }

    // ✅ Upsert MatchHistory to prevent duplicates
    const matchHistory = await MatchHistory.findOneAndUpdate(
      { room_id: room.room_id },
      { players: playersWithMMR },
      { upsert: true, new: true }
    );

    return matchHistory;
  } catch (err) {
    console.error("❌ Failed to save histories:", err);
    throw err;
  }
};


// GET match history - read-only
export const getMatchHistory = async (req, res) => {
  try {
    const { room_id } = req.params;
    if (!room_id) return res.status(400).json({ message: "room_id required" });

    const matchHistory = await MatchHistory.findOne({ room_id }).lean();
    if (!matchHistory) return res.status(404).json({ message: "Match history not found" });

    res.status(200).json(matchHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch match history" });
  }
};


// GET player history for a specific room
export const getPlayerHistory = async (req, res) => {
  try {
    const { room_id, userId } = req.params;
    if (!room_id || !userId)
      return res.status(400).json({ message: "roomId and userId are required" });

    const playerHistory = await PlayerHistory.find({
      room_id,
      userId,
    })
      .sort({ createdAt: -1 })
      .lean();
    if (!playerHistory || playerHistory.length === 0)
      return res.status(404).json({ message: "Player history not found" });

    res.status(200).json(playerHistory);
  } catch (err) {
    console.error("❌ Failed to fetch player history:", err);
    res.status(500).json({ message: "Failed to fetch player history" });
  }
};

// GET /match/history/my
export const getAllMatchForUser = async (req, res) => {
  try {
    const userId = req.user._id; // <- current authenticated user
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const matches = await MatchHistory.find({ "players.userId": userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!matches || matches.length === 0) {
      return res.status(404).json({ message: "No matches found for this user" });
    }

    res.status(200).json(matches);
  } catch (err) {
    console.error("❌ Failed to fetch matches for user:", err);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
};

export const getAllPlayerHistoryForUser = async (req, res) => {
  try {
    const userId = req.user?._id; // current authenticated user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const history = await PlayerHistory.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!history || history.length === 0) {
      return res.status(404).json({ message: "No player history found for this user" });
    }

    res.status(200).json(history);
  } catch (err) {
    console.error("❌ Failed to fetch player history for user:", err);
    res.status(500).json({ message: "Failed to fetch player history" });
  }
};


