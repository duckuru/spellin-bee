import { useNavigate } from 'react-router';
import { useMatchmakingStore } from '../../store/useMatchmakingStore';

interface CreateNavigationProps {
    onClick?: () => void;
}

function CreateNavigation({ onClick }: CreateNavigationProps) {

  const navigate = useNavigate();
  const {leaveQueue} = useMatchmakingStore();

  // const handleNavCreate = () => {
  //   navigate("/lobby")
  // }

  const handleClick = () => {
    if (onClick) onClick();
    leaveQueue(); // stop any active matchmaking
    // any other internal logic
    navigate("/lobby")
  };

  return (
    <div className="px-6 pt-6">
      <button
        className="text-[3rem] quicksand-bold bg-[#FDDB5B] text-[#3f3f3f] w-full p-1 border-2 border-[#795A3E] hover:bg-[#FFC105] rounded-xl"
        onClick={handleClick}
        // onClick={handleNavCreate}
      >
        Create Lobby
      </button>
    </div>
  );
}

export default CreateNavigation