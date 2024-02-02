import { motion, HTMLMotionProps } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FadeUpProps extends HTMLMotionProps<"div"> {}

const FadeUp: React.FC<FadeUpProps> = ({ children }) => {
  const [ref, inView] = useInView({
    triggerOnce: false, // Only trigger once when entering the viewport
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 1.0,
        delay: 0.2,
      }}
      
    >
      {children}
    </motion.div>
  );
};

export default FadeUp;
