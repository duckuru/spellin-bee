import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../../store/useAuthStore";

export default function Ads() {
  const { userData } = useAuthStore();
  const [isOpen, setIsOpen] = useState(true);

  const AdsSource = useMemo(
    () => [
      "/bannerAds.jpg",
      "/bannerAds2.jpg",
      "/bannerAds3.jpg",
      "/bannerAds4.jpg",
    ],
    []
  );

  const randomAds = useMemo(
    () => AdsSource[Math.floor(Math.random() * AdsSource.length)],
    [AdsSource]
  );

  // 🧠 This effect always runs, regardless of conditions (hook order safe)
  useEffect(() => {
    const checkAdVisibility = () => {
      const adClosedUntil = sessionStorage.getItem("adClosedUntil");
      if (adClosedUntil && Date.now() < Number(adClosedUntil)) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
        sessionStorage.removeItem("adClosedUntil");
      }
    };

    checkAdVisibility();
    const interval = setInterval(checkAdVisibility, 1000);
    return () => clearInterval(interval);
  }, []);

  const closeAds = () => {
    setIsOpen(false);
    const reopenTime = Date.now() + 2 * 60 * 1000; // 2 minutes
    sessionStorage.setItem("adClosedUntil", reopenTime.toString());
  };

  // ✅ Handle loading & conditions AFTER all hooks
  if (!userData) return null;
  if (userData.hasAds === false) return null;

  return (
    <div className="relative">
      {isOpen && (
        <>
          <button
            onClick={closeAds}
            className="cursor-pointer absolute top-0 right-0 z-10 bg-[#f3f3f3] px-2 text-[#3f3f3f] text-xl font-bold rounded-bl-lg"
          >
            ×
          </button>
          <img
            src={randomAds}
            alt="Advertisement"
            className="h-[6rem] w-full object-cover rounded-md shadow-md"
          />
        </>
      )}
    </div>
  );
}
