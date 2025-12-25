// Utility functions index
// Centralized exports for all utility functions

export { useFollowPointer } from "./FollowPointer";
export { generateRandomPath } from "./GenerateRandomPath";
export {
  generateSrcSet,
  getImageProps,
  getOptimizedImageUrl,
  getResponsiveSizes,
} from "./imageOptimization";
export { default as LenisProvider } from "./LenisProvider";
export { measurePageLoad, reportWebVitals } from "./performanceMonitor";
export type { PerformanceMetric } from "./performanceMonitor";
export { scrollToTop, default as useSmoothScroll } from "./SmoothScroll";
