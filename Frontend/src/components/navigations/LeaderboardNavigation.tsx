import { useMatchmakingStore } from "../../store/useMatchmakingStore";

interface LeaderboardNavigationProps {
    onClick?: () => void;
    isActive?: boolean;
}

function LeaderboardNavigation({ onClick, isActive }: LeaderboardNavigationProps) {
  const {leaveQueue} = useMatchmakingStore();
  const handleClick = () => {
    if (onClick) onClick();
    leaveQueue();
    // any other internal logic
  };


  return (
    <div className="px-6 pt-6">
      <button
  className={`text-[3rem] quicksand-bold w-full p-1 border-2 border-[#795A3E] rounded-xl text-[#3f3f3f] 
    ${isActive ? "bg-[#FFC105]" : "bg-[#FDDB5B]"} 
    hover:bg-[#FFC105]`}
        onClick={handleClick}
      >
        Leaderboard
      </button>
    </div>
  );
}

export default LeaderboardNavigation