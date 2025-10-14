import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useMatchmakingStore } from "../../store/useMatchmakingStore";

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
  const { leaveQueue, currentQueueLength } = useMatchmakingStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % matchmake.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchmake.length]);

  return (
    <div className="flex flex-row items-center justify-center gap-4 z-50">
      {/* Background box stays same size */}
      <div
        className="flex items-center justify-center
                   bg-[#f3f3f3] border-2 border-[#795a3e] rounded-lg shadow-md
                   w-[17rem] h-[4.625rem] lg:w-[25rem] lg:h-[5.625rem]"
      >
        <p className="text-[2rem] lg:text-[3rem] quicksand-semi text-[#795A3E] text-center">
          {matchmake[currentIndex]}
        </p>
      </div>

      {/* Leave queue button */}
      <button
        onClick={() => {
    leaveQueue();             // your store action
    if (stopMatchmaking) stopMatchmaking(); // reset Play button
  }}
        className="bg-[#f3f3f3] opacity-80 hover:opacity-100 hover:bg-[#f3f3f3] 
                   shadow-md border-2 border-[#795a3e] rounded-lg h-[4.625rem] w-[4.625rem] lg:h-[5.625rem] lg:w-[5.625rem]"
      >
        <FontAwesomeIcon
          icon={faXmark}
          style={{ color: "#3f3f3f" }}
          className="text-[2rem] lg:text-[3rem]"
        />
      </button>
      <p className="text-[2rem] lg:text-[3rem] quicksand-semi text-[#795A3E] text-center w-full absolute top-20">
        {currentQueueLength} /2
      </p>
    </div>
  );
}
