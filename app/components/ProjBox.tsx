import Image from "next/image";
import React from "react";
type projProps = {
  url1: string;
  name: string;
  type: string;
  event: string;
  view: string;
  date: string;
};

function ProjBox(props: projProps) {
  return (
    <div className="group md:w-[95%] md:h-[95%] overflow-hidden rounded-2xl dark:text-white text-black  bg-[#fafafa] dark:bg-[#191919] m-2 md:m-8">
      <Image
        src={props.url1}
        alt=""
        className=" object-cover overflow-hidden  projImg h-full hover:scale-[95%] scale-[90%] md:scale-[90%] transition-all duration-300 rounded-lg "
        width={1280}
        height={640}
      />
      <div className=" flex justify-between md:min-h-[100px] md:p-10 p-5 ">
        <div className="interactable">
          <div className="text-left font-logo md:text-7xl m-1 text-3xl">
            {props.name}
          </div>
          <div className="flex flex-wrap">
            <div className="w-fit h-fit md:p-1 md:px-2 px-2 md:text-sm text-[10px] font-poppins bg-[#efefef] dark:bg-[#252525] rounded-full m-1">
              {props.type}
            </div>
            <div className="w-fit h-fit md:px-2 md:p-1 px-2 md:text-sm text-[10px] font-poppins bg-[#efefef] dark:bg-[#252525] rounded-full m-1">
              {props.event}
            </div>
            <div className="w-fit h-fit md:px-4  md:p-1 px-2 md:text-sm md:flex hidden text-[10px] font-poppins bg-[#efefef] dark:bg-[#252525] rounded-full m-1">
              {props.date}
            </div>
          </div>
        </div>
        <a target="_blank" rel="noopener noreferrer" href={props.view}>
          <img
            src="/Visit.png"
            alt=""
            className="md:w-[100px] md:h-[100px] w-[60px] h-[60px] animate-spin-slow interactable"
          ></img>
        </a>
      </div>
    </div>
  );
}

export default ProjBox;
