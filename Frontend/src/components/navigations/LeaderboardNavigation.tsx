import { useMatchmakingStore } from "../../store/useMatchmakingStore";

interface LeaderboardNavigationProps {
    onClick?: () => void;
}

function LeaderboardNavigation({ onClick }: LeaderboardNavigationProps) {
  const {leaveQueue} = useMatchmakingStore();
  const handleClick = () => {
    if (onClick) onClick();
    leaveQueue();
    // any other internal logic
  };


  return (
    <div className="px-6 pt-6">
      <button
        className="text-[3rem] quicksand-bold bg-[#FDDB5B] text-[#3f3f3f] w-full p-1 border-2 border-[#795A3E] hover:bg-[#FFC105] rounded-xl"
        onClick={handleClick}
      >
        Leaderboard
      </button>
    </div>
  );
}

export default LeaderboardNavigation