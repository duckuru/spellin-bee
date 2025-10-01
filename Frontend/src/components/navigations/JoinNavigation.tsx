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
    <div className="px-6 pt-6">
      <button
  className={`text-[3rem] quicksand-bold w-full p-1 border-2 border-[#795A3E] rounded-xl text-[#3f3f3f] 
    ${isActive ? "bg-[#FFC105]" : "bg-[#FDDB5B]"} 
    hover:bg-[#FFC105]`}
        onClick={handleClick}
      >
        Join Lobby
      </button>
    </div>
  );
}

export default JoinNavigation;
