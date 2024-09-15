import React from "react";

const DynamicPlaceholder = () => {
  const randomColor = () => "#121212"; // Replace with your theme color or adjust logic
  const numRects = Math.floor(Math.random() * 11) + 5;

  const generateRects = () => {
    const rects = [];
    for (let i = 0; i < numRects; i++) {
      rects.push({
        x: Math.random() * 1280,
        y: Math.random() * 640,
        width: Math.random() * 200 + 50,
        height: Math.random() * 200 + 50,
        fill: randomColor(),
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    return rects;
  };

  const rects = generateRects();

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" className="w-full h-auto">
      <rect width="1280" height="640" fill="#ececec" /> {/* Light background for light mode */}
      {rects.map((rect, index) => (
        <rect
          key={index}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={rect.fill}
          opacity={rect.opacity}
        />
      ))}
    </svg>
  );
};

export default DynamicPlaceholder;
