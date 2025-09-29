import React, { useState, useEffect } from "react";
import axios from "axios";

interface PlayerHistoryItem {
  username: string;
  points: number;
  mmrChange: number;
  rank: string;
  createdAt: string;
}

interface MatchPlayer {
  username: string;
  score: number;
  rank: number;
}

interface MatchHistoryItem {
  room_id: string;
  players: MatchPlayer[];
  createdAt: string;
}

interface ResultPopupProps {
  onClose: () => void;
  room_id: string;
  userId: string;
}

const ResultPopup: React.FC<ResultPopupProps> = ({ onClose, room_id, userId }) => {
  const [activeTab, setActiveTab] = useState<"match" | "player">("match");
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem | null>(null);
  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "match") {
          const res = await axios.get(`http://localhost:3000/api/match-history/${room_id}`);
          setMatchHistory(res.data || null);
        } else {
          const res = await axios.get(`http://localhost:3000/api/player-history/${room_id}/${userId}`);
          setPlayerHistory(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, room_id, userId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-3/4 max-w-4xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold"
        >
          ✕
        </button>

        {/* Tabs */}
        <div className="flex mb-4 border-b">
          <button
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

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && <p>Loading...</p>}

          {/* MATCH HISTORY */}
          {!loading &&
            activeTab === "match" &&
            matchHistory?.players?.length ? (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <p className="font-bold">Room ID: {matchHistory.room_id}</p>
              <p className="text-gray-500 text-sm">
                Date: {new Date(matchHistory.createdAt).toLocaleString()}
              </p>
              <ul className="mt-2">
                {matchHistory.players.map((p, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between border-b py-1"
                  >
                    <span>{p.username}</span>
                    <span>
                      {p.score} pts ({p.rank})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !loading &&
            activeTab === "match" && (
              <p>No match history available.</p>
            )
          )}

          {/* PLAYER HISTORY */}
          {!loading &&
  activeTab === "player" &&
  Array.isArray(playerHistory) &&
  playerHistory.length > 0 ? (
  playerHistory.map((item, idx) => (
    <div
      key={idx}
      className="mb-4 p-4 border rounded-lg bg-gray-50"
    >
      <p className="font-bold">{item.username}</p>
      <p className="text-gray-500 text-sm">
        Date: {new Date(item.createdAt).toLocaleString()}
      </p>
      <p>Points: {item.points}</p>
      <p>MMR Change: {item.mmrChange}</p>
      <p>Rank: {item.rank}</p>
    </div>
  ))
) : (
  !loading &&
  activeTab === "player" && (
    <p>No player history available.</p>
  )
)}
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;
