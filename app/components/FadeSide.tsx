import { motion, HTMLMotionProps } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FadeUpProps extends HTMLMotionProps<"div"> {}

const FadeSide: React.FC<FadeUpProps> = ({ children }) => {
  const [ref, inView] = useInView({
    triggerOnce: false, // Only trigger once when entering the viewport
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 100 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{
       
        duration: 1.0,
        delay: 0.2,
      }}
      className="font-poppins "
    >
      {children}
    </motion.div>
  );
};

export default FadeSide;
