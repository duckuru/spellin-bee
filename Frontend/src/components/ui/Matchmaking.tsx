import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface MatchmakeProps {
  stopMatchmaking: () => void;
}

export default function Matchmaking({ stopMatchmaking }: MatchmakeProps) {
  const matchmake = [
    "Matchmaking",
    "Matchmaking.",
    "Matchmaking..",
    "Matchmaking...",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % matchmake.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchmake.length]);

  const handleLeaveQueue = () => {
    // socket.emit("leaveQueue");
    stopMatchmaking(); // hide the Matchmake component
    console.log("Left the matchmaking queue");
  };

  return (
    <div className="flex flex-row items-center justify-center gap-4 z-50">
      {/* Background box stays same size */}
      <div
        className="flex items-center justify-center
                   bg-[#f3f3f3] border-2 border-[#795a3e] rounded-lg shadow-md
                   w-[25rem] h-[5.625rem]"
      >
        <p className="text-[3rem] quicksand-semi text-[#795A3E] text-center">
          {matchmake[currentIndex]}
        </p>
      </div>

      {/* Leave queue button */}
      <button
        onClick={handleLeaveQueue}
        className="bg-[#f3f3f3] opacity-80 hover:opacity-100 hover:bg-[#f3f3f3] 
                   shadow-md border-2 border-[#795a3e] rounded-lg h-[5.625rem] w-[5.625rem]"
      >
        <FontAwesomeIcon
          icon={faXmark}
          style={{ color: "#3f3f3f" }}
          className="text-[3rem]"
        />
      </button>
    </div>
  );
}
