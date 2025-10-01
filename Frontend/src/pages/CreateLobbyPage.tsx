import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCircle,
  faClock,
  faGamepad,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
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

  const [room_id, setRoomId] = useState(paramRoomId || "");
  const [players, setPlayers] = useState<Player[]>([
    {
      userId: authUser._id,
      username: authUser.username,
      score: 0,
      isActive: true,
      isHost: true,
    },
  ]);
  const [settings, setSettings] = useState({
    turnTime: 30,
    rounds: 3,
    difficulty: "easy",
  });
  const [roomLink, setRoomLink] = useState("");
  const [isCreated, setIsCreated] = useState(false);

  const isHost = players.find((p) => p.userId === authUser._id)?.isHost;

  useEffect(() => {
    if (!socket) return;

    console.log("[LobbyPage] Mounted. Current room_id:", room_id);

    // Guest joins automatically
    if (paramRoomId) {
      console.log(`[Guest] Joining lobby ${paramRoomId}`);
      socket.emit(
        "joinLobby",
        {
          room_id: paramRoomId,
          userId: authUser._id,
          username: authUser.username,
        },
        (res: any) => {
          if (res?.error) {
            toast.error(res.error || "Lobby not found");
            navigate("/main"); // 🚨 redirect if error
          } else {
            console.log("[Guest] Joined lobby:", res.lobby);
          }
        }
      );
    }

    // Listen for lobby updates
    socket.on("lobbyUpdate", (lobby: any) => {
      if (!lobby) {
        toast.error("Lobby no longer exists");
        navigate("/main"); // 🚨 redirect back
        return;
      }
      console.log("[LobbyPage] Received lobbyUpdate from server:", lobby);
      setPlayers(lobby.players.slice(0, 6));
      setSettings(lobby.settings);
      setRoomId(lobby.room_id);
      // setRoomLink(`${window.location.origin}/lobby/${lobby.room_id}`);
      setRoomLink(`${lobby.room_id}`);
    });

    // Game starting
    socket.on("gameStarting", ({ room_id }) => {
      console.log("[LobbyPage] Game starting for room:", room_id);
      navigate(`/game/${room_id}`);
    });

    // Socket connect/disconnect logging
    socket.on("connect", () =>
      console.log("Socket connected with ID:", socket.id)
    );
    socket.on("disconnect", () =>
      console.log("Socket disconnected:", socket.id)
    );

    return () => {
      console.log("[LobbyPage] Unmounted, removing listeners");
      socket.off("lobbyUpdate");
      socket.off("gameStarting");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  // --- Handlers ---
  const handleBack = () => {
    if (socket && room_id && authUser?._id) {
      socket.emit("leaveLobby", { room_id, userId: authUser._id });
    }
    navigate("/main");
  };

  const handleCreateLobby = () => {
    if (!socket || !authUser) return;
    console.log("[Host] Creating lobby...");
    socket.emit(
      "createLobby",
      { hostId: authUser._id, username: authUser.username, settings },
      (res: any) => {
        if (res?.error) toast.error(res.error);
        else {
          console.log("[Host] Lobby created successfully:", res);
          setRoomId(res.room_id);
          setIsCreated(true);
        }
      }
    );
  };

  const handleStartGame = () => {
    if (!isHost) return toast.error("Only host can start");
    if (players.length < 2) return toast.error("Need at least 2 players");
    console.log("[Host] Starting game...");
    socket.emit("startGame", { room_id, hostId: authUser._id }, (res: any) => {
      if (res?.error) toast.error(res.error);
    });
  };

  const updateSetting = (
    key: "turnTime" | "rounds" | "difficulty",
    value: any
  ) => {
    if (!isHost) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    console.log("[Host] Updating settings:", newSettings);
    socket.emit("updateSettings", {
      room_id,
      hostId: authUser._id,
      settings: newSettings,
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-[#3f3f3f] z-50">
      <div className="flex justify-end absolute z-60 right-20 top-[4.6rem] items-center gap-2">
        <ProfileComponent/>
      </div>
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-[85rem]">
        <button
          onClick={handleBack}
          className="bg-[#f3f3f3] border-2 border-[#795A3E] hover:bg-[#FDDB5B] py-4 px-3 rounded-lg"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-4xl" />
        </button>
        <div className="flex justify-center w-full">
          <div className="flex justify-between items-center bg-[#f3f3f3] py-3 px-6 border-2 border-[#795A3E] rounded-lg w-full">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faClock} className="text-5xl" />

              <span className="text-5xl quicksand-semi">
                {settings.turnTime}s
              </span>
            </div>
            <span className="text-5xl quicksand-semi">
              Round {settings.rounds}
            </span>
            <span className="text-5xl quicksand-semi">
              Players: {players.length}/6
            </span>
          </div>
        </div>
      </div>
      {/* Lobby content */}
      <div className="flex flex-row gap-4 justify-center items-start pl-22">
        {/* Left - Player cards */}
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
                player.isHost
                  ? "bg-yellow-100 border-yellow-500"
                  : "bg-[#f3f3f3] border-[#795A3E]"
              }`}
            >
              {/* Left - Rank + crown */}
              <div className="flex flex-col items-center w-16">
                {index === 0 && (
                  <span className="text-yellow-400 text-xl">👑</span>
                )}
                <span className="text-xl sour-gummy-semi-bold">
                  #{index + 1}
                </span>
              </div>

              {/* Center - Username + [Host] */}
              <div className="flex-1 text-center">
                <span className="text-xl sour-gummy">{player.username}</span>
                {player.isHost && (
                  <span className="ml-2 text-sm text-yellow-600 font-semibold">
                    [Host]
                  </span>
                )}
              </div>

              {/* Right - Score */}
              <div className="w-20 text-right">
                <span className="text-xl sour-gummy">
                  {player.score ?? 0} pts
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Settings */}
        <div className=" flex flex-col gap-8 h-[30rem] w-[58rem] border-2 border-[#795A3E] p-4 rounded-xl bg-[#fddb6b]">
          <div className="flex justify-between items-center">
            <div className="text-5xl text-[#3f3f3f] sour-gummy space-x-6">
              <FontAwesomeIcon icon={faClock} />
              <span>Timer</span>
            </div>
            <select
              value={settings.turnTime}
              onChange={(e) =>
                updateSetting("turnTime", Number(e.target.value))
              }
              disabled={!isHost && !paramRoomId}
              className="text-3xl text-[#3f3f3f] bg-[#f3f3f3] border-2 rounded-lg border-[#795A3E] w-[30rem] px-2 py-2"
            >
              {[30, 25, 20, 15, 10].map((v) => (
                <option key={v} value={v}>
                  {v}s
                </option>
              ))}
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
              disabled={!isHost && !paramRoomId}
              className="text-3xl text-[#3f3f3f] bg-[#f3f3f3] border-2 rounded-lg border-[#795A3E] w-[30rem] px-2 py-2"
            >
              {["easy", "medium", "hard"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
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
              disabled={!isHost && !paramRoomId}
              className="text-3xl text-[#3f3f3f] bg-[#f3f3f3] border-2 rounded-lg border-[#795A3E] w-[30rem] px-2 py-2"
            >
              {[3, 2, 1].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomLink}
              readOnly
              placeholder="Room Id here"
              className="h-[4rem] bg-[#f3f3f3] text-[#3f3f3f] text-4xl py-2 px-1 rounded-xl border-2 border-[#795A3E] shadow-md"
            />
            {/* Buttons */}
            {!isCreated && !paramRoomId && (
              <button
                className="bg-[#F5AF36] text-[#f3f3f3] text-4xl py-2 px-8 rounded-xl border-2 border-[#795A3E] shadow-md cursor-pointer hover:bg-[#E49B1B]"
                onClick={handleCreateLobby}
              >
                <FontAwesomeIcon icon={faLink} />
                Create Lobby
              </button>
            )}
          </div>

          {isHost && isCreated && (
            <button
              className="bg-[#F5AF36] text-[#f3f3f3] text-4xl py-4 rounded-xl border-2 border-[#795A3E] shadow-md cursor-pointer hover:bg-[#E49B1B]"
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
