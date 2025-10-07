import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCircle, faClock, faGamepad, faLink, faXmark } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import ProfileComponent from "../components/navigations/ProfileComponent";

interface Player {
  userId: string;
  username: string;
  score: number;
  isActive: boolean;
  isHost?: boolean;
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const { room_id: paramRoomId } = useParams<{ room_id: string }>();
  const { authUser, socket } = useAuthStore();

  if (!authUser) return <div>Loading...</div>;
  if (!socket) return <div>Connecting to socket...</div>;

  const [roomId, setRoomId] = useState(paramRoomId || "");
  const [players, setPlayers] = useState<Player[]>([
    { userId: authUser._id, username: authUser.username, score: 0, isActive: true, isHost: true },
  ]);
  const [settings, setSettings] = useState({ turnTime: 30, rounds: 3, difficulty: "easy" });
  const [roomLink, setRoomLink] = useState("");
  const [isCreated, setIsCreated] = useState(false);

  const isHost = players.find(p => p.userId === authUser._id)?.isHost;

  useEffect(() => {
    if (!socket) return;

    console.log("[LobbyPage] Mounted. Current roomId:", roomId);

    // ------------------- Rejoin if user was in a lobby -------------------
    socket.emit(
      "rejoinLobby",
      { userId: authUser._id, username: authUser.username },
      (res: any) => {
        if (res?.error) {
          console.log("No previous lobby to rejoin:", res.error);
          // if paramRoomId exists, try join as guest
          if (paramRoomId) joinLobbyAsGuest(paramRoomId);
        } else {
          console.log("[RejoinLobby] Success:", res.lobby);
          setRoomId(res.lobby.room_id);
          setPlayers(res.lobby.players);
          setSettings(res.lobby.settings);
          setRoomLink(res.lobby.room_id);
          setIsCreated(true);
        }
      }
    );

    // ------------------- Listeners -------------------
    socket.on("lobbyUpdate", (lobby: any) => {
      if (!lobby) {
        toast.error("Lobby no longer exists");
        navigate("/main");
        return;
      }
      setPlayers(lobby.players.slice(0, 6));
      setSettings(lobby.settings);
      setRoomId(lobby.room_id);
      setRoomLink(lobby.room_id);
    });

    socket.on("kicked", () => {
      toast.error("You have been kicked from the lobby.");
      navigate("/main");
    });

    socket.on("gameStarting", ({ room_id }) => {
      navigate(`/game/${room_id}`);
    });

    return () => {
      socket.off("lobbyUpdate");
      socket.off("kicked");
      socket.off("gameStarting");
    };
  }, [socket]);

  // ------------------- Helpers -------------------
  const joinLobbyAsGuest = (room_id: string) => {
    socket.emit(
      "joinLobby",
      { room_id, userId: authUser._id, username: authUser.username },
      (res: any) => {
        if (res?.error) {
          toast.error(res.error);
          navigate("/main");
        } else {
          setRoomId(res.lobby.room_id);
          setPlayers(res.lobby.players);
          setSettings(res.lobby.settings);
          setRoomLink(res.lobby.room_id);
        }
      }
    );
  };

  const handleBack = () => {
    if (socket && roomId && authUser?._id) {
      socket.emit("leaveLobby", { room_id: roomId, userId: authUser._id });
    }
    navigate("/main");
  };

  const copyRoomIdToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(roomLink);
    toast.success("Room ID copied to clipboard!");
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    toast.error("Failed to copy Room ID");
  }
};

  const handleCreateLobby = () => {
    if (!socket || !authUser) return;
    socket.emit(
      "createLobby",
      { hostId: authUser._id, username: authUser.username, settings },
      (res: any) => {
        if (res?.error) toast.error(res.error);
        else {
          setRoomId(res.room_id);
          setIsCreated(true);
          setRoomLink(res.room_id);
          copyRoomIdToClipboard();
        }
      }
    );
  };

  const handleStartGame = () => {
    if (!isHost) return toast.error("Only host can start");
    if (players.length < 2) return toast.error("Need at least 2 players");
    socket.emit("startGame", { room_id: roomId, hostId: authUser._id }, (res: any) => {
      if (res?.error) toast.error(res.error);
    });
  };

  const updateSetting = (key: "turnTime" | "rounds" | "difficulty", value: any) => {
    if (!isHost) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    socket.emit("updateSettings", { room_id: roomId, hostId: authUser._id, settings: newSettings });
  };

  const handleKickPlayer = (userId: string) => {
    if (!isHost) return;
    socket.emit("kickPlayer", { room_id: roomId, targetUserId: userId });
  };

  // ------------------- Render -------------------
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-[#3f3f3f] z-50">
      <div className="flex justify-end absolute right-20 top-[4.6rem] items-center gap-2">
        <ProfileComponent />
      </div>

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-[85rem]">
        <button onClick={handleBack} className="bg-[#f3f3f3] border-2 border-[#795A3E] hover:bg-[#FDDB5B] py-4 px-3 rounded-lg">
          <FontAwesomeIcon icon={faChevronLeft} className="text-4xl" />
        </button>
        <div className="flex justify-center w-full">
          <div className="flex justify-between items-center bg-[#f3f3f3] py-3 px-6 border-2 border-[#795A3E] rounded-lg w-full">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faClock} className="text-5xl" />
              <span className="text-5xl quicksand-semi">{settings.turnTime}s</span>
            </div>
            <span className="text-5xl quicksand-semi">Round {settings.rounds}</span>
            <span className="text-5xl quicksand-semi">Players: {players.length}/6</span>
          </div>
        </div>
      </div>

      {/* Lobby content */}
      <div className="flex flex-row gap-4 justify-center items-start pl-22">
        {/* Players */}
        <div className="flex flex-col gap-4 w-[20rem]">
          {players.map((player, index) => (
            <motion.div
              key={player.userId}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className={`flex items-center justify-between p-2 border-2 rounded-xl h-[4.375rem] ${
                player.isHost ? "bg-yellow-100 border-yellow-500" : "bg-[#f3f3f3] border-[#795A3E]"
              }`}
            >
<div className="flex items-center justify-between p-2 rounded-xl h-[4.375rem] relative">
  {isHost && !player.isHost && (
    <button
      onClick={() => handleKickPlayer(player.userId)}
      className="ml-2 text-red-600 hover:text-red-800 text-2xl cursor-pointer"
      title={`Kick ${player.username}`}
    >
      <FontAwesomeIcon icon={faXmark} />
    </button>
  )}
  {/* rest of player card */}
</div>

              <div className="flex flex-col items-center w-16">
                {index === 0 && <span className="text-yellow-400 text-xl">👑</span>}
                <span className="text-xl sour-gummy-semi-bold">#{index + 1}</span>
              </div>

              <div className="flex-1 text-center">
                <span className="text-xl sour-gummy">{player.username}</span>
                {player.isHost && <span className="ml-2 text-sm text-yellow-600 font-semibold">[Host]</span>}
              </div>

              <div className="w-20 text-right">
                <span className="text-xl sour-gummy">{player.score ?? 0} pts</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-8 h-[30rem] w-[58rem] border-2 border-[#795A3E] p-4 rounded-xl bg-[#fddb6b]">
          <div className="flex justify-between items-center">
            <div className="text-5xl text-[#3f3f3f] sour-gummy space-x-6">
              <FontAwesomeIcon icon={faClock} />
              <span>Timer</span>
            </div>
            <select
              value={settings.turnTime}
              onChange={(e) => updateSetting("turnTime", Number(e.target.value))}
              disabled={!isHost}
              className="text-3xl bg-[#f3f3f3] border-2 rounded-lg border-[#795A3E] w-[30rem] px-2 py-2"
            >
              {[30, 25, 20, 15, 10].map(v => <option key={v} value={v}>{v}s</option>)}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-5xl text-[#3f3f3f] sour-gummy space-x-6">
              <FontAwesomeIcon icon={faGamepad} />
              <span>Difficulty</span>
            </div>
            <select
              value={settings.difficulty}
              onChange={(e) => updateSetting("difficulty", e.target.value)}
              disabled={!isHost}
              className="text-3xl bg-[#f3f3f3] border-2 rounded-lg border-[#795A3E] w-[30rem] px-2 py-2"
            >
              {["easy", "medium", "hard"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-5xl text-[#3f3f3f] sour-gummy space-x-6">
              <FontAwesomeIcon icon={faCircle} />
              <span>Round</span>
            </div>
            <select
              value={settings.rounds}
              onChange={(e) => updateSetting("rounds", Number(e.target.value))}
              disabled={!isHost}
              className="text-3xl bg-[#f3f3f3] border-2 rounded-lg border-[#795A3E] w-[30rem] px-2 py-2"
            >
              {[3, 2, 1].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomLink}
              readOnly
              placeholder="Room Id here"
              className="h-[4rem] bg-[#f3f3f3] text-[#3f3f3f] text-4xl py-2 px-1 rounded-xl border-2 border-[#795A3E] shadow-md cursor-pointer"
              onClick={copyRoomIdToClipboard}
            />

            {!isCreated && !paramRoomId && (
              <button
                className="bg-[#F5AF36] text-[#f3f3f3] text-4xl py-2 px-8 rounded-xl border-2 border-[#795A3E] shadow-md hover:bg-[#E49B1B]"
                onClick={handleCreateLobby}
              >
                <FontAwesomeIcon icon={faLink} />
                Create Lobby
              </button>
            )}
          </div>

          {isHost && isCreated && (
            <button
              className="bg-[#F5AF36] text-[#f3f3f3] text-4xl py-4 rounded-xl border-2 border-[#795A3E] shadow-md hover:bg-[#E49B1B]"
              onClick={handleStartGame}
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
