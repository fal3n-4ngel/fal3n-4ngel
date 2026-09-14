"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingPage from "@/app/loading";
import { CustomCursor } from "./CustomCursor";

export const AppClientShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingPage onComplete={() => setIsLoading(false)} progress={100} />}
      </AnimatePresence>
      <CustomCursor />
      {children}
    </>
  );
};

export default AppClientShell;
