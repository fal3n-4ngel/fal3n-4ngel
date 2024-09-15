import React, { useState, useEffect } from "react";

type projProps = {
  url1: number;
  name: string;
  type: string;
  event: string;
  view: string;
  date: string;
};

const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16); // Replace with your theme color or adjust logic

const generateRects = (seed: number) => {
  const numRects = Math.floor(Math.random() * 11) + 5; // Generate a random number of rectangles
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

function ProjBoxGithub(props: projProps) {
  const [rects, setRects] = useState(generateRects(props.url1));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRects(generateRects(props.url1));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [props.url1]);

  return (
    <div className="group md:w-[95%] md:h-[95%] overflow-hidden rounded-2xl dark:text-white text-black  bg-[#fafafa] dark:bg-[#191919] md:m-8 m-2  ">
      <div className="z-0 object-cover overflow-hidden interactable projImg h-full hover:scale-[95%] scale-[90%] md:scale-[90%] transition-all duration-300 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" className="w-full h-auto z-0">
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
              className="z-0 transition-all duration-1000" // Smooth transition for fill and opacity
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between md:min-h-[100px] md:p-10 p-5 overflow-hidden ">
        <div className="interactable">
          <div className="text-left font-logo md:text-7xl m-1 text-3xl md:max-w-full max-w-[40%]">{props.name}</div>
          <div className="flex flex-wrap">
           
            <div className="w-fit h-fit md:px-2 md:p-1 px-2 md:text-sm text-[10px] font-poppins bg-[#efefef] dark:bg-[#252525] rounded-full m-1">
              {props.event}
            </div>
            <div className="w-fit h-fit md:px-4 md:p-1 px-2 md:text-sm text-[10px] font-poppins bg-[#efefef] dark:bg-[#252525] rounded-full m-1">
              {props.date}
            </div>
          </div>
        </div>
        <a target="_blank" rel="noopener noreferrer" href={props.view} >
          <img src="/Visit.png" alt="" className="md:w-[100px] md:h-[100px] w-[60px] h-[60px] animate-spin-slow interactable" />
        </a>
      </div>
    </div>
  );
}

export default ProjBoxGithub;
