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
  const [mode, setMode] = useState<"default" | "joinLobby" | "leaderboard">(
    "default"
  );
  const [roomInput, setRoomInput] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [authUser, setAuthUser] = useState<LeaderboardUser | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const authUserRef = useRef<HTMLTableRowElement | null>(null);

  const [activeNav, setActiveNav] = useState<
    "play" | "create" | "join" | "leaderboard"
  | null>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent newline or form submit
      handleJoinLobby();
    }
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
              setActiveNav("play");
            }}
            isActive={activeNav === "play"}
          />
          <CreateNavigation
            onClick={() => {
              setMode("default");
            }}
          />
          <JoinNavigation
            setMode={(mode) => {
              setMode(mode);
              setActiveNav("join");
            }}
            isActive={activeNav === "join"}
          />
          <LeaderboardNavigation
            onClick={() => {
              setMode("leaderboard");
              setActiveNav("leaderboard");
            }}
            isActive={activeNav === "leaderboard"}
          />
        </div>
      </div>

      {/* Right Card */}
      <div className="w-[60rem] bg-[#FDDB5B] border-[#795A3E] border-2 relative rounded-2xl">
        {inQueue && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <Matchmaking stopMatchmaking={() => setActiveNav(null)}/>
          </div>
        )}

        <div className="flex items-center justify-center text-center h-full overflow-hidden p-4">
          {mode === "default" && (
            <h1 className="text-[#3f3f3f] text-5xl">Welcome!</h1>
          )}

          {mode === "joinLobby" && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="px-4 py-2 border-2 border-[#795A3E] rounded-lg text-[2rem] text-center text-[#3f3f3f]"
              />
              <button
                onClick={handleJoinLobby}
                className="bg-[#F5AF36] text-[#f3f3f3] py-2 px-4 rounded-lg text-[2rem] cursor-pointer hover:bg-[#E49B1B] border-2 border-[#795A3E]"
              >
                Join Lobby
              </button>
            </div>
          )}

          {mode === "leaderboard" && (
            <div className="flex flex-col w-full h-full rounded text-[#795A3E] p-8">
              {/* Title */}
              <h1 className="text-6xl sour-gummy-bold mb-8 text-center">
                Leaderboard
              </h1>

              {/* Table wrapper */}
              <div className="flex-1 relative">
                <table className="w-full table-fixed border-collapse">
                  {/* Header */}
                  <thead className="bg-[#FDDB5B] z-10">
                    <tr className="text-[2.5rem] sour-gummy-bold">
                      <th className="w-[30%] py-4 px-6 text-left">No</th>
                      <th className="w-[40%] py-4 px-6 text-center">
                        Username
                      </th>
                      <th className="w-[30%] py-4 px-6 text-center">
                        Rank (MMR)
                      </th>
                    </tr>
                  </thead>
                </table>

                {/* Scrollable body */}
                <div
                  className="max-h-[19rem] overflow-y-auto"
                  ref={scrollRef}
                  onScroll={updatePinnedState}
                >
                  <table className="w-full table-fixed border-collapse">
                    <tbody className="">
                      {(Array.isArray(leaderboard) ? leaderboard : []).map(
                        (user, idx) => (
                          <tr
                            key={user.userId}
                            ref={
                              user.userId === authUser?.userId
                                ? authUserRef
                                : null
                            }
                            className={`text-[2.5rem] sour-gummy-semi ${
                              user.userId === authUser?.userId
                                ? "text-[#2E74F5]"
                                : ""
                            }`}
                          >
                            <td className="w-[30%] px-6 text-left">
                              {idx + 1}
                            </td>
                            <td className="w-[40%] px-6 text-center">
                              {user.userId === authUser?.userId
                                ? `${authUser.username} (You)`
                                : user.username}
                            </td>
                            <td className="w-[30%] px-6 text-center">
                              {user.mmr}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pinned auth user */}
              {authUser && isPinned && (
                <div className="flex justify-between px-6 text-[#2E74F5] sticky bottom-0 text-[2.5rem] sour-gummy-semi">
                  <span>
                    {(leaderboard?.findIndex(
                      (u) => u.userId === authUser.userId
                    ) ?? leaderboard.length) + 1}
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
