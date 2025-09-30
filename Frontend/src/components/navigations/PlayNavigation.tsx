import { useMatchmakingStore } from '../../store/useMatchmakingStore';

// interface PlayNavigationProps{
//   startMatchmaking: () => void;
//   inQueue: boolean;
//   setInQueue: (value: boolean) => void;
// }

interface PlayNavigationProps {
  onClick?: () => void;
}

function PlayNavigation({ onClick }: PlayNavigationProps) {
  const { startMatchmaking, inQueue } = useMatchmakingStore();

  const handleClick = () => {
    if (onClick) onClick();
    // any other internal logic
    startMatchmaking();
  };

  return (
    <div className="px-6 pt-6">
      <button
        className="text-[3rem] quicksand-bold bg-[#FDDB5B] text-[#3f3f3f] w-full p-1 border-2 border-[#795A3E] hover:bg-[#FFC105] rounded-xl"
        onClick={handleClick}
        disabled={inQueue}
      >
        {inQueue ? "Waiting..." : "Play"}
      </button>
    </div>
  );
}

export default PlayNavigation