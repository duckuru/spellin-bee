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
    <div className="lg:px-6 sm:px-4 lg:pt-6 sm:pt-3">
      <button
        className="quicksand-bold w-full p-1 border-2 border-[#795A3E] rounded-xl text-[#3f3f3f] bg-[#FDDB5B]
    hover:bg-[#FFC105]
          transition-all duration-200 ease-in-out
          text-[1.5rem] sm:text-[1.5rem] lg:text-[3rem]"
          
        onClick={handleClick}
        // onClick={handleNavCreate}
      >
        Create Lobby
      </button>
    </div>
  );
}

export default CreateNavigation