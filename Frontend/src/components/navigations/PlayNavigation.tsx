import { useMatchmakingStore } from '../../store/useMatchmakingStore';

// interface PlayNavigationProps{
//   startMatchmaking: () => void;
//   inQueue: boolean;
//   setInQueue: (value: boolean) => void;
// }

interface PlayNavigationProps {
  onClick?: () => void;
  isActive?: boolean;
}

function PlayNavigation({ onClick, isActive }: PlayNavigationProps) {
  const { startMatchmaking, inQueue } = useMatchmakingStore();

  const handleClick = () => {
    if (onClick) onClick();
    // any other internal logic
    startMatchmaking();
  };

  return (
    <div className="px-6 pt-6">
      <button
  className={`text-[3rem] quicksand-bold w-full p-1 border-2 border-[#795A3E] rounded-xl text-[#3f3f3f] 
    ${isActive ? "bg-[#FFC105]" : "bg-[#FDDB5B]"} 
    hover:bg-[#FFC105]`}
        onClick={handleClick}
        disabled={inQueue}
      >
        {inQueue ? "Waiting..." : "Play"}
      </button>
    </div>
  );
}

export default PlayNavigation