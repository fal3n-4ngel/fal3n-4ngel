import { Dimensions } from "../types/dimensions";
import { Position } from "../types/position";

/**
 * Generates a random path for ghost animation
 * @param startPos - Starting position
 * @param dimensions - Window dimensions
 * @param numPoints - Number of points in the path
 * @param padding - Edge padding
 * @returns Array of positions forming a random path
 */
export const generateRandomPath = (
  startPos: Position,
  dimensions: Dimensions,
  numPoints = 10,
  padding = 50
): Position[] => {
  const { width, height } = dimensions;
  const points: Position[] = [startPos];

  // Add initial offset point
  points.push({
    x: padding + 200,
    y: padding + 200,
  });

  // Generate random points within bounds
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: padding + Math.random() * (width - 2 * padding),
      y: padding + Math.random() * (height - 2 * padding),
    });
  }

  return points;
};
