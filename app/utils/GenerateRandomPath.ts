import { Position } from "../types/position";

export const generateRandomPath = (
  startPos: Position,
  dimensions: { width: number; height: number },
  numPoints = 10,
  padding = 50,
): Position[] => {
  const { width, height } = dimensions;
  const points: Position[] = [startPos];

  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: padding + Math.random() * (width - 2 * padding),
      y: padding + Math.random() * (height - 2 * padding),
    });
  }
  return points;
};
