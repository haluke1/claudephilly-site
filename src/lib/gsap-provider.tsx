"use client";

import { ReactNode, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GsapProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Refresh ScrollTrigger after all content is loaded
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.killAll();
    };
  }, []);

  return <>{children}</>;
}
