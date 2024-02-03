import Image from "next/image";
import React from "react";
type projProps = {
    url1: string;
    name: string;
    type:string;
    event:string;
    view:string;
  };


function ProjBox(props: projProps) {
  return (
    <div className="group md:w-[95%] md:h-[95%] overflow-hidden rounded-2xl text-white bg-[#191919] m-4">
      <Image
        src={props.url1}
        alt=""
        className=" object-cover overflow-hidden   interactable projImg h-full hover:scale-[95%] scale-[90%] md:scale-[90%] transition-all duration-300 rounded-lg "
        width={1280}
        height={640}
      />
      <div className=" flex justify-between md:min-h-[100px] md:p-10 p-5 ">
        <div className="interactable">
          <div className="text-left font-logo md:text-7xl m-1 text-3xl">{props.name}</div>
          <div className="flex">
            <div className="w-fit h-fit md:p-1 md:px-2 px-2 text-[10px] font-poppins bg-[#252525] rounded-full m-1">
              {props.type}
            </div>
            <div className="w-fit h-fit md:px-2 md:p-1 px-2 text-[10px] font-poppins bg-[#252525] rounded-full m-1">
              {props.event}
            </div>
          </div>
        </div>
        <a href={props.view}><img src="/Visit.png" alt="" className="md:w-[100px] md:h-[100px] w-[60px] h-[60px] animate-spin-slow interactable"></img></a>
      </div>
    </div>
  );
}

export default ProjBox;
