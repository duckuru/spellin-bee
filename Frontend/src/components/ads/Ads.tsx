import { useEffect, useState, useRef } from 'react'

export default function Ads() {
  const [isOpen, setIsOpen] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const AdsSource = [
    "/bannerAds.jpg",
    "/bannerAds2.jpg",
    "/bannerAds3.jpg",
    "/bannerAds4.jpg",
  ];

  const randomAds = AdsSource[Math.floor(Math.random() * AdsSource.length)];

  const closeAds = () => {
    setIsOpen(false);
  }

  useEffect(() => {
    // If the ad is closed, set a timer to reopen after 2 minutes
    if (!isOpen) {
      timerRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 120000); // 2 minutes
    }
    // Clear timer if ad is reopened or component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <div className='relative'>
      {isOpen && <>
        <button onClick={closeAds} className='cursor-pointer absolute top-0 right-0 z-51 bg-[#f3f3f3] px-2 text-[#3f3f3f] text-xl'>x</button>
        <img src={randomAds} alt="Ads"  className='h-[6rem]'/>      
      </>
    }
    </div>
  )
};