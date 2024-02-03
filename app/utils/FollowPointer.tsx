// hooks/useFollowPointer.ts

import { useEffect, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useFollowPointer = (ref: React.RefObject<HTMLElement | null>): Position => {
    let xh=0,yh=0;
    if (typeof window !== 'undefined') {
        xh=window.innerWidth/2 -50
        yh=window.innerHeight/2 -50
    }
  const [position, setPosition] = useState<Position>({ x: xh, y: yh });

  const handleMouseMove = (e: MouseEvent) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({ 
        x: e.clientX -50 , 
        y: e.clientY  -50
      });
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove,ref]);

  return position;
};
