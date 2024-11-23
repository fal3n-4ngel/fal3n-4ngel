import { useEffect } from "react";

const useSmoothScroll = () => {
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      e.preventDefault();

      const target = e.target as HTMLAnchorElement;
      if (!target.hash) return;

      const element = document.querySelector(target.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", handleSmoothScroll as EventListener);
    });
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }

    return () => {
      anchors.forEach((anchor) => {
        anchor.removeEventListener(
          "click",
          handleSmoothScroll as EventListener
        );
      });
    };
  }, []);
};

export default useSmoothScroll;


export const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

