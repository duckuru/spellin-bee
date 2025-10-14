import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";

export default function Support() {
  const navigate = useNavigate();


  const handleBack = () => {
    navigate("/profile");
  };


  return (
    <div className="w-full h-screen flex justify-center items-center p-4 bg-black/50 text-[#3f3f3f] z-50">
      <div className="relative w-full max-w-xl bg-[#f3f3f3] rounded-2xl border-4 border-[#795a3e] shadow-lg overflow-hidden">
        {/* LEFT: Order Summary */}
        <div className="flex flex-col justify-center items-center p-6">
          <div className="flex flex-row mb-4 justify-start items-center">
                      <button
            onClick={handleBack}
            className="bg-[#f3f3f3] py-3 px-3 rounded-xl items-center flex"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
          </button>
            <h1 className="text-2xl font-bold items-center justify-center">Support Me Please</h1>
          </div>
            <img src="/myQR.jpg" alt="" className="w-[20rem] rounded-3xl"/>
            
        </div>
      </div>
    </div>
  );
}
