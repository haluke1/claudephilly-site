"use client";

import { useEffect, useRef, useState } from "react";

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  scrambleChars?: string;
}

export default function TextScramble({
  text,
  className = "",
  delay = 0,
  duration = 1500,
  scrambleChars = "!@#$%^&*01{}[]<>/\\|~`_-+=",
}: TextScrambleProps) {
  const [display, setDisplay] = useState("");
  const frameRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const totalFrames = Math.floor(duration / 30);
      let frame = 0;

      const animate = () => {
        frame++;
        const progress = frame / totalFrames;

        const result = text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            // Characters reveal left to right based on progress
            const charProgress = i / text.length;
            if (progress > charProgress + 0.3) {
              return char; // Revealed
            }
            // Still scrambling
            return scrambleChars[
              Math.floor(Math.random() * scrambleChars.length)
            ];
          })
          .join("");

        setDisplay(result);

        if (frame < totalFrames) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplay(text);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [text, delay, duration, scrambleChars]);

  return (
    <span className={className} aria-label={text}>
      {display || text}
    </span>
  );
}
