export interface PreloadProgress {
  loaded: number;
  total: number;
}

/**
 * Warms the browser's image cache for a list of URLs. Resolves once every
 * image has either loaded or failed — a broken URL never blocks the rest.
 */
export function preloadImages(
  urls: (string | undefined | null)[],
  onProgress?: (progress: PreloadProgress) => void
): Promise<void> {
  const unique = Array.from(new Set(urls.filter((u): u is string => !!u)));

  if (unique.length === 0) {
    onProgress?.({ loaded: 0, total: 0 });
    return Promise.resolve();
  }

  let loaded = 0;
  const tasks = unique.map(
    (url) =>
      new Promise<void>((resolve) => {
        const img = new window.Image();
        const settle = () => {
          loaded += 1;
          onProgress?.({ loaded, total: unique.length });
          resolve();
        };
        img.onload = settle;
        img.onerror = settle;
        img.src = url;
      })
  );

  return Promise.all(tasks).then(() => undefined);
}
