"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingPage from "@/app/loading";
import { CustomCursor } from "./CustomCursor";

export const AppClientShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingPage onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      <CustomCursor />
      {children}
    </>
  );
};

export default AppClientShell;
