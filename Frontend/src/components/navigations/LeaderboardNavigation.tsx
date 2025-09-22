import React from 'react'
import { useNavigate } from 'react-router';

function LeaderboardNavigation() {
const navigate = useNavigate();

  const handleNavCreate = () => {
    navigate("/Leaderboard")
  }

  return (
    <div className="px-6 pt-6">
      <button
        className="text-[3rem] quicksand-bold bg-[#FDDB5B] text-[#3f3f3f] w-full p-1 border-2 border-[#795A3E] hover:bg-[#FFC105] rounded-xl"
        onClick={handleNavCreate}
      >
        Leaderboard
      </button>
    </div>
  );
}

export default LeaderboardNavigation