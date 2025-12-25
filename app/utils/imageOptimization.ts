/**
 * Image optimization utility
 * Provides helper functions for responsive images and lazy loading
 */

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const getImageProps = ({ src, alt, width, height, priority = false }: ImageProps) => {
  return {
    src,
    alt,
    width,
    height,
    priority,
    quality: priority ? 90 : 75,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    placeholder: "blur" as const,
  };
};

export const getOptimizedImageUrl = (src: string, width: number, quality = 75): string => {
  if (src.startsWith("http")) return src;
  return `${src}?w=${width}&q=${quality}`;
};

export const generateSrcSet = (src: string, sizes: number[]): string => {
  return sizes.map((size) => `${getOptimizedImageUrl(src, size)} ${size}w`).join(", ");
};

export const getResponsiveSizes = (mobile: string, tablet: string, desktop: string): string => {
  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
};
