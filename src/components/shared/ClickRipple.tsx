"use client";

import { useEffect, useRef } from "react";

export default function ClickRipple() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        border: 1px solid rgba(217, 119, 87, 0.4);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9998;
      `;
      document.body.appendChild(ripple);

      const anim = ripple.animate(
        [
          { width: "0px", height: "0px", opacity: 1 },
          { width: "120px", height: "120px", opacity: 0 },
        ],
        { duration: 600, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
      );

      anim.onfinish = () => ripple.remove();
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return <div ref={containerRef} />;
}
