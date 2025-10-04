import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useResultStore } from "../../store/useResultStore";
import { axiosInstance } from "../../lib/axios";

interface PlayerHistoryItem {
  username: string;
  points: number;
  mmrChange: number;
  rank: string;
  createdAt: string;
}

interface ResultPopupProps {
  onClose?: () => void; // optional because we'll navigate
  room_id: string;
}

const ResultPopup: React.FC<ResultPopupProps> = ({ onClose, room_id }) => {
  const [activeTab, setActiveTab] = useState<"match" | "player">("match");
  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryItem[]>([]);
  const [loadingPlayerHistory, setLoadingPlayerHistory] = useState(false);

  const { authUser, userData } = useAuthStore();
  const userId = authUser?._id;
  
  const navigate = useNavigate();
  
  // Zustand store for match result
  const { players, loadingPlayers, fetchResult } = useResultStore();
  
  // Fetch player history with axios directly
  useEffect(() => {
    const fetchPlayerHistory = async () => {
      if (!room_id || !userId) return;
      
      if (!authUser) return;
      setLoadingPlayerHistory(true);
      try {
        const res = await axiosInstance.get(
          `/player-history/${room_id}/${userId}`,
          { withCredentials: true }
        );
        setPlayerHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Failed to fetch player history:", err);
        setPlayerHistory([]);
      } finally {
        setLoadingPlayerHistory(false);
      }
    };

    if (activeTab === "match") {
      // console.log("Fetching match history from store for room:", room_id);
      fetchResult(room_id);
    } else if (activeTab === "player") {
      // console.log("Fetching player history for user:", userId, "in room:", room_id);
      fetchPlayerHistory();
    }
  }, [activeTab, room_id, userId, fetchResult]);

  const handleClose = () => {
    if (onClose) onClose();
    navigate("/"); // navigate user to homepage
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl w-3/4 max-w-4xl p-6 relative "
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-xl font-bold hover:text-red-500"
        >
          ✕
        </button>

        {/* Tabs */}
        <div className="flex mb-4 border-b">
          <button
            type="button"
            onClick={() => setActiveTab("match")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "match"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
          >
            Match History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("player")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "player"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
          >
            Player Results
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* MATCH HISTORY */}
          {activeTab === "match" ? (
            loadingPlayers ? (
              <p>Loading match history...</p>
            ) : players.length > 0 ? (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <ul className="mt-2">
                  {players.map((p) => (
                    <li
                      key={p._id}
                      className="flex justify-between border-b py-1 sour-gummy-bold text-3xl"
                    >
                      <span>#{p.rank}</span>

                      <span
                        className={
                          authUser?.username === p.username
                            ? "text-blue-500"
                            : "text-[#3f3f3f]"
                        }
                      >
                        {p.username}
                      </span>
                      <span>{p.score} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No match history available.</p>
            )
          ) : null}

          {/* PLAYER HISTORY */}
          {activeTab === "player" ? (
            loadingPlayerHistory ? (
              <p>Loading player history...</p>
            ) : playerHistory.length > 0 ? (
              playerHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="mb-4 p-4 border rounded-lg bg-gray-50 sour-gummy-bold text-3xl"
                >
                  <p>
                    Username:{" "}
                    <span className="text-blue-500">{item.username}</span>
                  </p>
                  <p>Points: {item.points}</p>
                  <p>
                    MMR Change: <span>{userData?.mmr}</span>{" "}
                    <span
                      className={
                        item.mmrChange < 0
                          ? "text-red-500 font-semibold"
                          : item.mmrChange > 0
                          ? "text-green-500 font-semibold"
                          : "text-gray-500 font-semibold"
                      }
                    >
                      ({item.mmrChange > 0
                        ? `+${item.mmrChange}`
                        : item.mmrChange})
                    </span>
                  </p>
                  <p>Rank: {item.rank}</p>
                </div>
              ))
            ) : (
              <p>No player history available.</p>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;
