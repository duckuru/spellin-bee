import { faChevronLeft, faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useParams } from "react-router";

interface Player {
  userId: string;
  username: string;
  isActive: boolean;
}

function GamePage() {
  const { authUser, socket } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const { room_id } = useParams<{ room_id: string }>();

  // --- Leave Room ---
  const handleLeaveRoom = () => {
    if (!socket || !authUser) return;
    socket.emit("leaveRoom", { room_id, userId: authUser._id });
    // Redirect to main page or matchmaking
    window.location.href = "/";
  };

  // --- Listen for room updates ---
  useEffect(() => {
    if (!socket || !room_id || !authUser) return;

    // Join room
    socket.emit("joinRoom", {
      room_id,
      userId: authUser._id,
      username: authUser.username,
    });

    // Listen for updates
    const roomUpdateHandler = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    };
    socket.on("roomUpdate", roomUpdateHandler);

    // Cleanup on unmount
    return () => {
      socket.off("roomUpdate", roomUpdateHandler);
    };
  }, [socket, room_id, authUser]);

  return (
    <div className=" w-full min-h-screen flex flex-col gap-4 items-center justify-center overflow-hidden p-4 z-50">
      <div className="w-full flex items-center justify-center gap-6">
        {/* Leave Room Button */}
        <button
          onClick={handleLeaveRoom}
          className="bg-[#f3f3f3] border-2 border-[#795A3E] hover:bg-[#FDDB5B] py-4 px-3 rounded-lg"
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="text-4xl font-extrabold"
            style={{ color: "#3f3f3f" }}
          />
        </button>

        {/* Main Game Info */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Timer & Round */}
          <div className="flex justify-between items-center w-full bg-[#f3f3f3] py-3 px-6 border-2 border-[#795A3E] rounded-lg">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faClock}
                className="text-5xl text-[#3f3f3f]"
              />
              <h1 className="text-5xl text-[#3f3f3f] quicksand-semi">30s</h1>
            </div>
            <h1 className="text-5xl text-[#3f3f3f] quicksand-semi">
              Round 1 of 3
            </h1>
          </div>
        </div>
      </div>
      {/* Room Players */}
      <div className="flex flex-col">
        <div className="flex gap-4 flex-wrap justify-center">
          {players.map((player) => {
            const isCurrentUser = player.userId === authUser?._id;
            return (
              <div
                key={player.userId}
                className={`px-6 py-3 rounded-lg font-semibold text-xl
                    ${
                      isCurrentUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }
                    ${!player.isActive ? "opacity-50 line-through" : ""}
                  `}
              >
                {player.username}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GamePage;
