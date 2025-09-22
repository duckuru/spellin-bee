import { useEffect, useRef, useMemo } from "react";

interface HexagonBackgroundProps {
  hexCount?: number;
  colorsProp?: string[];
  maxSize?: number;
  minSize?: number;
  speed?: number;
}

interface Hexagon {
  size: number;
  left: number;
  top: number;
  dx: number;
  dy: number;
  rotate: number;
  dRotate: number;
  color: string;
}

interface HexRef {
  hex: Hexagon;
  div: HTMLDivElement;
}

const HexagonBackground = ({
  hexCount = 50,
  colorsProp,
  maxSize = 80,
  minSize = 20,
  speed = 0.4,
}: HexagonBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hexRefs = useRef<HexRef[]>([]);
  const animationId = useRef<number | null>(null);

  // ...existing code...

  // Memoize colors to avoid new array reference on each render
  const colors = useMemo(
    () => colorsProp || ["#795a3e", "#fddb59", "#ffc105", "#f3f3f3", "#3f3f3f"],
    [colorsProp]
  );

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Generate hexagons
    const hexagons = Array.from({ length: hexCount }).map(() => {
      const size = Math.random() * (maxSize - minSize) + minSize;
      const angle = Math.random() * 2 * Math.PI;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;

      return {
        size,
        left: Math.random() * width,
        top: Math.random() * height,
        dx,
        dy,
        rotate: Math.random() * 360,
        dRotate: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    if (containerRef.current) containerRef.current.innerHTML = "";

    hexRefs.current = hexagons.map((hex) => {
      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.width = `${hex.size}px`;
      div.style.height = `${hex.size}px`;
      div.style.left = `${hex.left}px`;
      div.style.top = `${hex.top}px`;
      div.style.backgroundColor = hex.color;
      // div.style.opacity = 0.7;
      div.style.clipPath =
        "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)";
      div.style.transform = `rotate(${hex.rotate}deg)`;
      div.style.pointerEvents = "none";
      if (containerRef.current) {
        containerRef.current.appendChild(div);
      }
      return { hex, div };
    });

    const detectCollisions = () => {
      for (let i = 0; i < hexRefs.current.length; i++) {
        const h1 = hexRefs.current[i].hex;
        const r1 = h1.size / 2;
        for (let j = i + 1; j < hexRefs.current.length; j++) {
          const h2 = hexRefs.current[j].hex;
          const r2 = h2.size / 2;

          const dx = h2.left - h1.left;
          const dy = h2.top - h1.top;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < r1 + r2) {
            const angle = Math.atan2(dy, dx);
            const speed1 = Math.sqrt(h1.dx ** 2 + h1.dy ** 2);
            const speed2 = Math.sqrt(h2.dx ** 2 + h2.dy ** 2);

            h1.dx = Math.cos(angle + Math.PI) * speed1;
            h1.dy = Math.sin(angle + Math.PI) * speed1;
            h2.dx = Math.cos(angle) * speed2;
            h2.dy = Math.sin(angle) * speed2;

            const overlap = r1 + r2 - dist;
            h1.left -= (overlap / 2) * Math.cos(angle);
            h1.top -= (overlap / 2) * Math.sin(angle);
            h2.left += (overlap / 2) * Math.cos(angle);
            h2.top += (overlap / 2) * Math.sin(angle);
          }
        }
      }
    };

    const animate = () => {
      hexRefs.current.forEach(({ hex, div }) => {
        hex.left += hex.dx;
        hex.top += hex.dy;
        hex.rotate += hex.dRotate;

        if (hex.left > width + hex.size) hex.left = -hex.size;
        if (hex.left < -hex.size) hex.left = width + hex.size;
        if (hex.top > height + hex.size) hex.top = -hex.size;
        if (hex.top < -hex.size) hex.top = height + hex.size;

        div.style.left = `${hex.left}px`;
        div.style.top = `${hex.top}px`;
        div.style.transform = `rotate(${hex.rotate}deg)`;
      });

      detectCollisions();
      animationId.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      hexRefs.current.forEach(({ hex }) => {
        hex.left = Math.min(hex.left, w);
        hex.top = Math.min(hex.top, h);
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId.current !== null) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [hexCount, maxSize, minSize, speed, colors]); // memoized colors avoids re-trigger

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0,
      }}
    />
  );
};

export default HexagonBackground;