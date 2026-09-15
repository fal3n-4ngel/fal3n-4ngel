export const scrollToTop = (immediate: boolean | unknown = false) => {
  if (typeof window !== "undefined") {
    const isImmediate = immediate === true;
    const lenis = (
      window as unknown as {
        lenis?: { scrollTo: (target: number, opts?: { immediate?: boolean }) => void };
      }
    ).lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: isImmediate });
    }
    window.scrollTo({ top: 0, behavior: isImmediate ? "instant" : "smooth" });
  }
};

