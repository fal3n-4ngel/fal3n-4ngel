/**
 * Performance monitoring utility
 * Tracks Core Web Vitals and custom metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  id: string;
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(
  metricName: keyof typeof THRESHOLDS,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[metricName];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

export function reportWebVitals(metric: PerformanceMetric) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${metric.name}:`, {
      value: `${Math.round(metric.value)}ms`,
      rating: metric.rating,
      id: metric.id,
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // You can send this to your analytics service
    // Example: sendToAnalytics(metric)
  }
}

export function measurePageLoad() {
  if (typeof window === "undefined") return;

  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  const connectTime = perfData.responseEnd - perfData.requestStart;
  const renderTime = perfData.domComplete - perfData.domLoading;

  if (process.env.NODE_ENV === "development") {
    console.log("[Performance Metrics]", {
      "Page Load Time": `${pageLoadTime}ms`,
      "Connection Time": `${connectTime}ms`,
      "Render Time": `${renderTime}ms`,
    });
  }

  return { pageLoadTime, connectTime, renderTime };
}
