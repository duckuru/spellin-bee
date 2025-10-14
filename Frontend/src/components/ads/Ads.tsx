import { useEffect, useState } from "react";

export default function Ads() {
  const [isOpen, setIsOpen] = useState(true);
  const AdsSource = [
    "/bannerAds.jpg",
    "/bannerAds2.jpg",
    "/bannerAds3.jpg",
    "/bannerAds4.jpg",
  ];
  const randomAds = AdsSource[Math.floor(Math.random() * AdsSource.length)];

  const closeAds = () => {
    setIsOpen(false);
    const reopenTime = Date.now() + 2 * 60 * 1000; // 2min
    localStorage.setItem("adClosedUntil", reopenTime.toString());
  };

  useEffect(() => {
    const hasAds = localStorage.getItem("hasAds");
    if (hasAds === "false") {
      setIsOpen(false);
      return;
    }

    const checkAdVisibility = () => {
      const adClosedUntil = localStorage.getItem("adClosedUntil");
      if (adClosedUntil && Date.now() < Number(adClosedUntil)) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
        localStorage.removeItem("adClosedUntil");
      }
    };

    // Run once immediately
    checkAdVisibility();

    // Then run every second
    const interval = setInterval(checkAdVisibility, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don’t render if user has ad-free package
  if (localStorage.getItem("hasAds") === "false") return null;

  return (
    <div className="relative">
      {isOpen && (
        <>
          <button
            onClick={closeAds}
            className="cursor-pointer absolute top-0 right-0 z-51 bg-[#f3f3f3] px-2 text-[#3f3f3f] text-xl"
          >
            x
          </button>
          <img src={randomAds} alt="Ads" className="h-[6rem]" />
        </>
      )}
    </div>
  );
}
