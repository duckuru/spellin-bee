import express from "express";
import { getAllMatchForUser, getAllPlayerHistoryForUser, getMatchHistory, getPlayerHistory, getMatchHistoryByRoom } from "../controller/history.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getLeaderboardSorted } from "../controller/leaderboard.controller.js";
import { getRoomHandler } from "../controller/room.controller.js";
const router = express.Router();

router.get("/rooms/:room_id", protectRoute, getRoomHandler);
router.get("/match-history/:room_id", getMatchHistory);
router.get("/player-history/:room_id/:userId", getPlayerHistory);
router.get("/getMatchHistoryForMe",protectRoute, getAllMatchForUser);
router.get("/getPlayerHistoryForMe",protectRoute, getAllPlayerHistoryForUser);
router.get("/match-history/:room_id", protectRoute, getMatchHistoryByRoom);
router.get("/leaderboard", protectRoute, getLeaderboardSorted);




export default router;