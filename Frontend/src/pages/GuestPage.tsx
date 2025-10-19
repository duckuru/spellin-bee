import { useNavigate } from 'react-router';
import TextFade from '../components/background/Text';

function GuestPage() {
  const navigate = useNavigate();

  const openLogin = () => {
    navigate("/login");
  };
  return (
    <div className='z-20 h-full'>
      <div className="flex justify-end absolute z-20 right-20 top-[3.2rem] lg:top-[4.6rem]">
        {/* {!isLoggedIn ? ( */}
        <button
          onClick={openLogin}
          type="button"
          className="btn btn-primary rounded-xl bg-transparent hover:bg-[#ffe08d] border-[#795a3e] border-4 text-2xl lg:text-3xl text-[#3f3f3f] p-6 lg:p-8 quicksand-bold shadow-none"
        >
          Login
        </button>
      </div>
      <div className='flex items-center justify-center items-center h-130 text-center w-full'>
        <TextFade/>
      </div>
    </div>
  );
}

export default GuestPage