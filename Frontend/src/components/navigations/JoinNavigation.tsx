import { useMatchmakingStore } from "../../store/useMatchmakingStore";

interface JoinNavigationProps {
  setMode: (mode: "default" | "joinLobby") => void;
}

function JoinNavigation({ setMode }: JoinNavigationProps) {
  const { leaveQueue } = useMatchmakingStore();

  const handleClick = () => {
    leaveQueue(); // stop any active matchmaking
    setMode("joinLobby");
  };

  return (
    <div className="px-6 pt-6">
      <button
        className="text-[3rem] quicksand-bold bg-[#FDDB5B] text-[#3f3f3f] w-full p-1 border-2 border-[#795A3E] hover:bg-[#FFC105] rounded-xl"
        onClick={handleClick}
      >
        Join Lobby
      </button>
    </div>
  );
}

export default JoinNavigation;
