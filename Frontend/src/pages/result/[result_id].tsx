import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import ResultPopup from "../../components/popup/resultpopup";
import { useAuthStore } from "../../store/useAuthStore";
import { useResultStore } from "../../store/useResultStore";

const ResultPage: React.FC = () => {
  const { room_id } = useParams<{ room_id: string }>();
  const { authUser } = useAuthStore();
  const userId = authUser?._id;

  const { players, loadingHistory, fetchResult } = useResultStore();
  const [showPopup, setShowPopup] = useState(false);
  const duration = 1.2;

  useEffect(() => {
    if (room_id) fetchResult(room_id);
  }, [room_id, fetchResult]);

  if (loadingHistory) return <p className="text-center mt-10">Loading results...</p>;
  if (!players.length) return <p className="text-center mt-10">No results found</p>;

  const getPodiumPlayer = (rank: number) =>
    players.find((p) => p.rank === rank) || { _id: `placeholder-${rank}`, username: "N/A", score: 0, rank };

  const podiumLayout = [getPodiumPlayer(2), getPodiumPlayer(1), getPodiumPlayer(3)];

  const animationOrder = [getPodiumPlayer(3), getPodiumPlayer(2), getPodiumPlayer(1)];
  const delays = animationOrder.reduce((acc, player, idx) => {
    acc[player.rank!] = idx * duration;
    return acc;
  }, {} as Record<number, number>);

  const crownColors: Record<number, string> = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  const heights: Record<number, string> = { 1: "35rem", 2: "28rem", 3: "21rem" };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 pt-12 text-[#3f3f3f] z-50 overflow-hidden">
      <div className="relative w-[70rem] bg-[#f3f3f3] rounded-xl border-2 border-[#795A3E] h-[45rem] flex items-end justify-center">
        <button
          onClick={() => setShowPopup(true)}
          className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Next
        </button>

        <div className="flex items-end gap-16">
          {podiumLayout.map((player) => (
            <motion.div
              key={player._id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: heights[player.rank!] || "20rem", opacity: 1 }}
              transition={{ duration, delay: delays[player.rank!] || 0, ease: "easeOut" }}
              className="w-48 bg-[#ffc105] rounded-t-xl flex flex-col items-center justify-center shadow-lg relative"
            >
              <div className="absolute -top-24 flex flex-col items-center">
                <FontAwesomeIcon
                  icon={faCrown}
                  className="text-6xl"
                  style={{ color: crownColors[player.rank!] || "#888" }}
                />
                <p className="quicksand-semi text-3xl">{player.username}</p>
                <div className="quicksand-semi mt-2 text-4xl">
                  {player.rank === 1 ? "1st" : player.rank === 2 ? "2nd" : "3rd"}
                </div>
              </div>

              <motion.div
                className="absolute top-1/2 -translate-y-1/2 text-3xl font-bold flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: delays[player.rank!] || 0, ease: "easeOut" }}
              >
                Points
                <div>{player.score}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {showPopup && userId && room_id && (
        <ResultPopup onClose={() => setShowPopup(false)} room_id={room_id} />
      )}
    </div>
  );
};

export default ResultPage;
