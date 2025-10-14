import { useMatchmakingStore } from "../../store/useMatchmakingStore";

interface JoinNavigationProps {
  setMode: (mode: "default" | "joinLobby") => void;
  isActive?: boolean;
}

function JoinNavigation({ setMode,isActive }: JoinNavigationProps) {
  const { leaveQueue } = useMatchmakingStore();

  const handleClick = () => {
    leaveQueue(); // stop any active matchmaking
    setMode("joinLobby");
  };

  return (
    <div className="lg:px-6 sm:px-4 lg:pt-6 sm:pt-3">
      <button
        className={`quicksand-bold w-full p-1 border-2 border-[#795A3E] rounded-xl text-[#3f3f3f] 
    ${isActive ? "bg-[#FFC105]" : "bg-[#FDDB5B]"} 
    hover:bg-[#FFC105]
          transition-all duration-200 ease-in-out
          text-[1.5rem] sm:text-[1.5rem] lg:text-[3rem]
          `}
        onClick={handleClick}
      >
        Join Lobby
      </button>
    </div>
  );
}

export default JoinNavigation;
