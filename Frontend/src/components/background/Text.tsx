import { useEffect, useState } from "react";

export default function TextFade() {
  const texts = [
    "Welcome to Spellin Bee!",
    "Learn new words daily!",
    "Compete with friends!",
    "Boost your vocabulary!",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true); // true means fade in, false fade out

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade out

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setFade(true); // fade in next text
      }, 500); // duration of fade out in ms (match with CSS)
    }, 5000); // total cycle time 5 seconds

    return () => clearInterval(interval);
  }, [texts.length]);
  return (
    <div>
      <p
        className={`text-[3.5rem] transition-opacity quicksand-semi duration-500 text-[#F5AF36] ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {texts[currentIndex]}
      </p>
    </div>
  );
}
