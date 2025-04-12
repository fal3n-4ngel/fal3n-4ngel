import React from "react";
import Navbar from "../components/Navbar";

function page() {
  return (
    <main className="h-full min-h-screen w-full bg-[#0A0A0A]">
      <Navbar />
      <section className="relative flex h-screen w-full flex-col items-end justify-center">
        <h1 className="londrina-outline-regular w-full text-center text-[70rem] font-bold tracking-wider text-[#8b8b8b] opacity-30 outline-white">
          Adi
        </h1>
        <div className="absolute bottom-0 z-10 h-[50vw] w-full bg-gradient-to-t from-[#0A0A0A] via-[#0a0a0a8f] to-transparent"></div>
      </section>
    </main>
  );
}

export default page;
