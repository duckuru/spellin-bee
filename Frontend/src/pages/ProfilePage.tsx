import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ProfilePage() {
  const {
    myMatches,
    fetchMyMatches,
    isLoadingMatches,
    myHistory,
    fetchMyHistory,
    isLoadingHistory,
  } = useAuthStore();

  const [view, setView] = useState<"matches" | "history">("matches");

  useEffect(() => {
    if (view === "matches") fetchMyMatches();
    if (view === "history") fetchMyHistory();
  }, [view, fetchMyMatches, fetchMyHistory]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 pt-12 text-[#3f3f3f] overflow-hidden">
      <div className="relative w-[70rem] bg-[#f3f3f3] rounded-xl border-2 border-[#795A3E] h-[45rem] p-6 overflow-y-auto">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setView("matches")}
            className={`px-4 py-2 rounded ${
              view === "matches" ? "bg-[#795A3E] text-white" : "bg-gray-200"
            }`}
          >
            Match History
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded ${
              view === "history" ? "bg-[#795A3E] text-white" : "bg-gray-200"
            }`}
          >
            Player History
          </button>
        </div>

        {view === "matches" && (
  <>
    <h1 className="text-xl font-bold mb-2">My Matches</h1>
    {isLoadingMatches && <p>Loading matches...</p>}
    {!isLoadingMatches && myMatches.length === 0 && <p>No matches found.</p>}

    {myMatches.map((match) => (
      <div key={match._id} className="border p-4 my-4 rounded bg-white shadow">
        <h2 className="font-semibold text-lg mb-1">Room: {match.room_id}</h2>
        <p className="text-sm text-gray-500 mb-2">
          Date: {new Date(match.createdAt).toLocaleString()}
        </p>

        <div className="grid grid-cols-4 font-semibold border-b pb-1 mb-2">
          <span>Username</span>
          <span>Score</span>
          <span>Rank</span>
          <span>MMR Change</span>
        </div>

        {match.players.map((p) => (
          <div
            key={p.userId}
            className="grid grid-cols-4 border-b last:border-b-0 py-1"
          >
            <span>{p.username}</span>
            <span>{p.score}</span>
            <span>{p.rank}</span>
            <span className={p.mmrChange >= 0 ? "text-green-600" : "text-red-600"}>
              {p.mmrChange > 0 ? "+" : ""}
              {p.mmrChange}
            </span>
          </div>
        ))}
      </div>
    ))}
  </>
)}


        {view === "history" && (
          <>
            <h1 className="text-xl font-bold mb-2">My Player History</h1>
            {isLoadingHistory && <p>Loading player history...</p>}
            {!isLoadingHistory && myHistory.length === 0 && (
              <p>No player history found.</p>
            )}
            {myHistory.map((h) => (
              <div key={h._id} className="border p-2 my-2 rounded bg-white">
                <h2>Room: {h.room_id}</h2>
                <p>Score: {h.points} pts</p>
                <p>
                  {" "}
                  MMR gained: ({h.mmrChange > 0 ? "+" : ""}
                  {h.mmrChange})
                </p>
                <p>Rank: {h.rank}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
