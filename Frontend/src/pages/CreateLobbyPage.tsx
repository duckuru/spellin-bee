import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

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

  const [room_id, setRoomId] = useState(paramRoomId || "");
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState({ timer: 30, rounds: 3, difficulty: "easy" });
  const [roomLink, setRoomLink] = useState("");
  const [isCreated, setIsCreated] = useState(false);

  if (!authUser) return <div>Loading...</div>;
  if (!socket) return <div>Connecting to socket...</div>;

  const isHost = players.find(p => p.userId === authUser._id)?.isHost;

  useEffect(() => {
    if (!socket) return;

    console.log("[LobbyPage] Mounted. Current room_id:", room_id);

    // Guest joins automatically
    if (paramRoomId) {
      console.log(`[Guest] Joining lobby ${paramRoomId}`);
      socket.emit(
        "joinLobby",
        { room_id: paramRoomId, userId: authUser._id, username: authUser.username },
        (res: any) => {
          if (res?.error) toast.error(res.error);
          else console.log("[Guest] Joined lobby:", res.lobby);
        }
      );
    }

    // Lobby updates
    socket.on("lobbyUpdate", (lobby: any) => {
      console.log("[LobbyPage] Received lobbyUpdate from server:", lobby);
      setPlayers(lobby.players.slice(0, 6));
      setSettings(lobby.settings);
      setRoomId(lobby.room_id);
      setRoomLink(`${window.location.origin}/lobby/${lobby.room_id}`);
    });

    // Game starting
    socket.on("gameStarting", ({ room_id }) => {
      console.log("[LobbyPage] Game starting for room:", room_id);
      navigate(`/game/${room_id}`);
    });

    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

    return () => {
      console.log("[LobbyPage] Unmounted, removing listeners");
      socket.off("lobbyUpdate");
      socket.off("gameStarting");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  // --- Handlers ---
  const handleBack = () => navigate("/main");

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

  const updateSetting = (key: "timer" | "rounds" | "difficulty", value: any) => {
    if (!isHost) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    console.log("[Host] Updating settings:", newSettings);
    socket.emit("updateSettings", { room_id, hostId: authUser._id, settings: newSettings });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4 z-50 text-[#3f3f3f]">
      <div className="flex w-full max-w-4xl gap-4">
        <button onClick={handleBack}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="flex flex-1 justify-between bg-gray-200 p-2 rounded-lg">
          <span>Timer: {settings.timer}s</span>
          <span>Round: {settings.rounds}</span>
          <span>Players: {players.length}/6</span>
        </div>
      </div>

      {!isCreated && !paramRoomId && (
        <button className="bg-green-500 text-white py-2 px-4 rounded" onClick={handleCreateLobby}>
          Create Lobby
        </button>
      )}

      {isCreated || paramRoomId ? (
        <div className="flex gap-4 w-full max-w-4xl">
          {/* Player list */}
          <div className="w-64 flex flex-col gap-2">
    {players.map((p, idx) => (
      <div
        key={p.userId}
        className={`flex items-center justify-between p-2 rounded-lg border ${
          p.isHost ? "border-yellow-500 bg-yellow-100" : "border-gray-300 bg-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold">#{idx + 1}</span>
          <span>{p.username}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{p.score} pts</span>
          {p.isHost && <span className="text-sm text-yellow-600 font-semibold">[Host]</span>}
        </div>
      </div>
    ))}
  </div>

          {/* Settings */}
          <div className="flex-1 flex flex-col gap-4 bg-yellow-300 p-4 rounded-lg">
            <div className="flex justify-between">
              <span>Timer</span>
              <select value={settings.timer} onChange={e => updateSetting("timer", Number(e.target.value))} disabled={!isHost}>
                {[10, 15, 20, 25, 30].map(v => <option key={v} value={v}>{v}s</option>)}
              </select>
            </div>

            <div className="flex justify-between">
              <span>Difficulty</span>
              <select value={settings.difficulty} onChange={e => updateSetting("difficulty", e.target.value)} disabled={!isHost}>
                {["easy", "medium", "hard"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="flex justify-between">
              <span>Rounds</span>
              <select value={settings.rounds} onChange={e => updateSetting("rounds", Number(e.target.value))} disabled={!isHost}>
                {[1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <input type="text" value={roomLink} readOnly className="flex-1 px-2 py-1 border rounded-md" />
            </div>

            {isHost && (
              <button className="bg-orange-400 text-white py-2 rounded-lg" onClick={handleStartGame}>
                Start Game
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
