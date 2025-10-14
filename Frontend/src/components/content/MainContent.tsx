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

  const handleFullLeaderboard = () =>{
    navigate("/leaderboard");
  }

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
  <div
    className="
    flex flex-row justify-center items-stretch
    w-full max-w-[90rem] mx-auto
    px-2 sm:px-4 lg:px-8 md:gap-4 lg:gap-[2rem]
    text-[#3f3f3f] z-50
    min-h-[30vh] md:min-h-[50vh] lg:min-h-[40rem]
    overflow-x-auto scrollbar-none
    "
  >
    {/* Left Card (Navigation) */}
    <div
      className="
      w-[18rem] sm:w-[22rem] md:w-[25rem]
    bg-[#FDDB5B] border-[#795A3E] border-2 rounded-2xl shadow-lg
    flex flex-col
      "
    >
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

    {/* Right Card (Main content) */}
    <div
      className="
    flex-1 w-full md:min-w-[65%] lg:w-[60rem]
    bg-[#FDDB5B] border-[#795A3E] border-2 rounded-2xl shadow-lg
     overflow-hidden flex flex-col
    p-2 lg:p-2 relative
      "
    >
      {inQueue && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Matchmaking stopMatchmaking={() => setActiveNav(null)} />
        </div>
      )}

      <div className="flex items-center justify-center text-center min-h-[20rem] lg:min-h-[35rem] overflow-hidden">
        {mode === "default" && (
          <h1 className="text-[#3f3f3f] text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold">
            Welcome!
          </h1>
        )}

          {mode === "joinLobby" && (
            <div className="flex flex-col gap-4 w-full max-w-[15rem] lg:max-w-[25rem] mx-auto">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="px-4 py-2 border-2 border-[#795A3E] rounded-lg text-[1.5rem] lg:text-[2rem] text-center text-[#3f3f3f]"
              />
              <button
                onClick={handleJoinLobby}
                className="bg-[#F5AF36] text-[#f3f3f3] py-2 px-4 rounded-lg text-[1.5rem] lg:text-[2rem] cursor-pointer hover:bg-[#E49B1B] border-2 border-[#795A3E] transition-all"
              >
                Join Lobby
              </button>
            </div>
          )}

          {mode === "leaderboard" && (
  <div className="w-full lg:px-6 flex flex-col">
    <div className="relative">
      <button
        className="absolute px-2 py-2 lg:px-4 lg:py-3 top-0 lg:top-2 right-0 border-2 text-sm lg:text-xl rounded-xl quicksand-bold hover:bg-[#F5AF36] cursor-pointer"
        onClick={handleFullLeaderboard}
      >
        Full Leaderboard
      </button>
    </div>

    <h1 className="text-4xl lg:text-6xl sour-gummy-bold mb-2 lg:mb-8 text-center">
      Leaderboard
    </h1>

    <div className="overflow-y-auto max-h-[24rem] lg:max-h-[28rem] relative" ref={scrollRef} onScroll={updatePinnedState}>
      <table className="w-full table-fixed border-collapse">
        <thead className="bg-[#FDDB5B] z-10 sticky top-0">
          <tr className="text-[1.4rem] lg:text-[2.5rem] sour-gummy-bold">
            <th className="w-[30%] py-2 lg:py-4 px-4 text-left">No</th>
            <th className="w-[40%] py-2 lg:py-4 px-4 text-center">Username</th>
            <th className="w-[30%] py-2 lg:py-4 px-4 text-center">Rank (MMR)</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, idx) => {
            const isAuth = user.userId === authUser?.userId;
            return (
              <tr
                key={user.userId}
                ref={isAuth ? authUserRef : null}
                className={`text-[1.4rem] lg:text-[2.5rem] sour-gummy-semi ${
                  isAuth ? "text-[#2E74F5]" : ""
                }`}
              >
                <td className="w-[30%] px-4 text-left">{idx + 1}</td>
                <td className="w-[40%] px-4 text-center truncate">
                  {isAuth ? `${authUser.username.slice(0, 8)} (You)` : user.username.slice(0, 10)}
                </td>
                <td className="w-[30%] px-4 text-center">{user.mmr}</td>
              </tr>
            );
          })}

          {/* Sticky auth user row at the bottom if needed */}
          {authUser && isPinned && (
            <tr className="sticky bottom-0 bg-[#FDDB5B] text-[#2E74F5] text-[1.4rem] lg:text-[2.5rem] sour-gummy-semi">
              <td className="w-[30%] px-4 text-left">
                {(leaderboard.findIndex(u => u.userId === authUser.userId) ?? leaderboard.length) + 1}
              </td>
              <td className="w-[40%] px-4 text-center truncate">
                {authUser.username.slice(0, 8)} (You)
              </td>
              <td className="w-[30%] px-4 text-center">{authUser.mmr}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
