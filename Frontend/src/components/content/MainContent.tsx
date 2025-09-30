import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import PlayNavigation from "../navigations/PlayNavigation";
import CreateNavigation from "../navigations/CreateNavigation";
import JoinNavigation from "../navigations/JoinNavigation";
import LeaderboardNavigation from "../navigations/LeaderboardNavigation";
import Matchmaking from "../ui/Matchmaking";
import { useMatchmakingStore } from "../../store/useMatchmakingStore";
import { axiosInstance } from "../../lib/axios";

interface LeaderboardUser {
  userId: string;
  username: string;
  mmr: number;
}

export default function MainContent() {
  const [mode, setMode] = useState<"default" | "joinLobby" | "leaderboard">("default");
  const [roomInput, setRoomInput] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [authUser, setAuthUser] = useState<LeaderboardUser | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const authUserRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { inQueue, startMatchmaking } = useMatchmakingStore();

  // Fetch leaderboard when mode is leaderboard
  useEffect(() => {
    if (mode !== "leaderboard") return;

    axiosInstance
      .get("/leaderboard")
      .then((res) => {
        const { allUsers, authUser } = res.data;
        setLeaderboard(allUsers ?? []);
        setAuthUser(authUser ?? null);
        setTimeout(() => updatePinnedState(), 50); // ensure layout ready
      })
      .catch((err) => console.error("Leaderboard fetch error:", err));
  }, [mode]);

  const handleJoinLobby = () => {
    if (!roomInput) return;
    navigate(`/lobby/${roomInput}`);
  };

  const updatePinnedState = () => {
    if (!authUserRef.current || !scrollRef.current) return;
    const userTop = authUserRef.current.offsetTop;
    const scrollTop = scrollRef.current.scrollTop;
    const containerHeight = scrollRef.current.clientHeight;

    // Pin if authUser is outside visible area
    setIsPinned(userTop > scrollTop + containerHeight || userTop < scrollTop);
  };

  return (
    <div className="flex flex-row gap-[2rem] h-[40rem] justify-center z-50 text-[#3f3f3f]">
      {/* Left Card */}
      <div className="w-[25rem] bg-[#FDDB5B] border-[#795A3E] border-2 rounded-2xl">
        <div>
          <PlayNavigation
            onClick={() => {
              setMode("default");
              startMatchmaking();
            }}
          />
          <CreateNavigation onClick={() => setMode("default")} />
          <JoinNavigation setMode={setMode} />
          <LeaderboardNavigation onClick={() => setMode("leaderboard")} />
        </div>
      </div>

      {/* Right Card */}
      <div className="w-[60rem] bg-[#FDDB5B] border-[#795A3E] border-2 relative rounded-2xl">
        {inQueue && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <Matchmaking />
          </div>
        )}

        <div className="flex items-center justify-center text-center h-full overflow-hidden p-4">
          {mode === "default" && <h1 className="text-[#3f3f3f] text-5xl">Welcome!</h1>}

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

          {mode === "leaderboard" && (
            <div className="flex flex-col w-full h-full border rounded">
              {/* Scrollable list */}
              <div
                className="flex-1 overflow-y-auto relative"
                ref={scrollRef}
                onScroll={updatePinnedState}
              >
                {(Array.isArray(leaderboard) ? leaderboard : []).map((user, idx) => (
                  <div
                    key={user.userId}
                    ref={user.userId === authUser?.userId ? authUserRef : null}
                    className="flex justify-between p-12 border-b text-5xl"
                  >
                    <span>{idx + 1}</span>
                    <span>{user.username}</span>
                    <span>{user.mmr}</span>
                  </div>
                ))}
              </div>

              {/* Pinned auth user */}
              {authUser && isPinned && (
                <div className="flex justify-between p-2 border-t bg-yellow-100 font-bold sticky bottom-0 text-5xl">
                  <span>
                    {(leaderboard?.findIndex((u) => u.userId === authUser.userId) ?? leaderboard.length) + 1}
                  </span>
                  <span>{authUser.username} (You)</span>
                  <span>{authUser.mmr}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
