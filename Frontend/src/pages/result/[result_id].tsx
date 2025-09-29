import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useResultStore } from "../../store/useResultStore";
import { useAuthStore } from "../../store/useAuthStore";
import ResultPopup from "../../components/popup/resultpopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

const ResultPage: React.FC = () => {
  const { room_id } = useParams<{ room_id: string }>();
  const { authUser } = useAuthStore();
  const userId = authUser?._id;

  const { players, loading, fetchResult } = useResultStore();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (room_id) fetchResult(room_id);
  }, [room_id, fetchResult]);

  if (loading) return <p className="text-center mt-10">Loading results...</p>;
  if (!players.length) return <p className="text-center mt-10">No results found</p>;

  const crownColors: Record<number, string> = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  const heights: Record<number, string> = { 1: "35rem", 2: "28rem", 3: "21rem" };

  // Podium layout: 2nd - 1st - 3rd
  const getPodiumPlayer = (rank: number) => players.find((p) => p.rank === rank) || { name: "N/A", score: 0, rank };
  const podiumLayout = [getPodiumPlayer(2), getPodiumPlayer(1), getPodiumPlayer(3)];

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 pt-12 text-[#3f3f3f] overflow-hidden">
      <div className="relative w-[70rem] bg-[#f3f3f3] rounded-xl border-2 border-[#795A3E] h-[45rem] flex items-end justify-center">
        <button
          onClick={() => setShowPopup(true)}
          className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Next
        </button>

        <div className="flex items-end gap-16">
          {podiumLayout.map((player) => (
            <div
              key={player.rank}
              style={{ height: heights[player.rank] }}
              className="w-48 bg-[#ffc105] rounded-t-xl flex flex-col items-center justify-center shadow-lg relative"
            >
              <div className="absolute -top-24 flex flex-col items-center">
                <FontAwesomeIcon
                  icon={faCrown}
                  className="text-6xl"
                  style={{ color: crownColors[player.rank] || "#888" }}
                />
                <p className="quicksand-semi text-3xl">{player.name}</p>
                <div className="quicksand-semi mt-2 text-4xl">
                  {player.rank === 1 ? "1st" : player.rank === 2 ? "2nd" : "3rd"}
                </div>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 text-3xl font-bold flex flex-col items-center justify-center">
                Points
                <div>{player.score}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPopup && room_id && userId && (
        <ResultPopup onClose={() => setShowPopup(false)} userId={userId} room_id={room_id} />
      )}
    </div>
  );
};

export default ResultPage;
