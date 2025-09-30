import { useState } from "react";
import { useNavigate } from "react-router";
import PlayNavigation from "../navigations/PlayNavigation";
import CreateNavigation from "../navigations/CreateNavigation";
import JoinNavigation from "../navigations/JoinNavigation";
import LeaderboardNavigation from "../navigations/LeaderboardNavigation";
import Matchmaking from "../ui/Matchmaking";
import { useMatchmakingStore } from "../../store/useMatchmakingStore";

export default function MainContent() {
  const [isMatching, setIsMatching] = useState(false);
  const [mode, setMode] = useState<"default" | "joinLobby">("default");
  const [roomInput, setRoomInput] = useState("");
  const navigate = useNavigate();
  const { inQueue } = useMatchmakingStore();

  const handleJoinLobby = () => {
    if (!roomInput) return;
    // Navigate to the lobby page by ID or link
    navigate(`/lobby/${roomInput}`);
  };

  return (
    <div className="flex flex-row gap-[2rem] h-[40rem] justify-center z-50">
      {/* Left Card */}
      <div className="w-[25rem] bg-[#FDDB5B] border-[#795A3E] border-2 rounded-2xl">
        <div>
          <PlayNavigation onClick={() => setMode("default")} />
          <CreateNavigation onClick={() => setMode("default")} />
          <JoinNavigation setMode={setMode} />
          <LeaderboardNavigation onClick={() => setMode("default")} />
        </div>
      </div>

      {/* Right Card */}
      <div className="w-[60rem] bg-[#FDDB5B] border-[#795A3E] border-2 relative rounded-2xl">
        {inQueue && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <Matchmaking />
          </div>
        )}

        <div className="flex items-center justify-center text-center h-full">
          {mode === "default" && <h1 className="text-[#3f3f3f] text-5xl">Bruh</h1>}

          {mode === "joinLobby" && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter Room ID or Link"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="px-4 py-2 border rounded-lg text-lg"
              />
              <button
                onClick={handleJoinLobby}
                className="bg-green-500 text-white py-2 px-4 rounded-lg text-lg"
              >
                Join Lobby
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
