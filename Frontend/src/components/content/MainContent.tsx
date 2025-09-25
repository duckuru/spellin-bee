import { useState } from "react";
import { useNavigate } from "react-router";
import PlayNavigation from "../navigations/PlayNavigation";
import CreateNavigation from "../navigations/CreateNavigation";
import JoinNavigation from "../navigations/JoinNavigation";
import LeaderboardNavigation from "../navigations/LeaderboardNavigation";
import Matchmaking from "../ui/Matchmaking";
import { useMatchmakingStore } from "../../store/useMatchmakingStore";


export default function MainContent() {
  const [isMatching, setIsMatching] = useState(false);
  const navigate = useNavigate();
  const { inQueue } = useMatchmakingStore();

  // const handleStartMatchmaking = () => setIsMatching(true);
  // const handleStopMatchmaking = () => setIsMatching(false);

  return (
    <div className="flex flex-row gap-[2rem] h-[40rem] justify-center z-50">
      {/* Left Card */}
      <div className="w-[25rem] bg-[#FDDB5B] border-[#795A3E] border-2 rounded-2xl">
        <div>
          <PlayNavigation
          // startMatchmaking={handleStartMatchmaking}
          // inQueue={isMatching} // pass down
          // setInQueue={setIsMatching} // pass setter
          />
          <CreateNavigation />
          <JoinNavigation />
          <LeaderboardNavigation />
        </div>
      </div>

      {/* Right Card */}
      <div className="w-[60rem] bg-[#FDDB5B] border-[#795A3E] border-2 relative rounded-2xl">
        {inQueue && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <Matchmaking />
          </div>
        )}

        <div className="flex items-center justify-center text-center h-full">
          <h1 className="text-[#3f3f3f] text-5xl">Bruh</h1>
        </div>
      </div>
    </div>
  );
}
