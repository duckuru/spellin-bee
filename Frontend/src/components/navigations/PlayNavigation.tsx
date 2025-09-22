import React from 'react'
import { useNavigate } from 'react-router';

interface PlayNavigationProps{
  startMatchmaking: () => void;
  inQueue: boolean;
  setInQueue: (value: boolean) => void;
}

function PlayNavigation({startMatchmaking, inQueue, setInQueue} : PlayNavigationProps) {

  const navigate = useNavigate();

  // when queue look for if enough player from start matching and navigate to `/game/${roomId}`

  const handlePlay = async () => {
    if(inQueue) return;

    //check if user is auth
    //check socketid
    //get userData to display
    //start matchmaking

    //emit joining queue when start matchmaking
    //set queue to true
  }

  return (
    <div className='px-6 pt-6'>
      <button
        className="text-[3rem] quicksand-bold bg-[#FDDB5B] text-[#3f3f3f] w-full p-1 border-2 border-[#795A3E] hover:bg-[#FFC105] rounded-xl"
        disabled={inQueue}
        onClick={handlePlay}
      >
        {inQueue ? "Waiting..." : "Play"}
      </button>
    </div>
  );
}

export default PlayNavigation