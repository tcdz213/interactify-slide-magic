import React from "react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: React.ElementType;
  animate?: boolean;
  delay?: number;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className,
  id,
  as: Component = "section",
  animate = true,
  delay = 0
}) => {
  const content = (
    <Component
      id={id}
      className={cn(
        "section-padding w-full",
        className
      )}
    >
      <div className="container-custom">
        {children}
      </div>
    </Component>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
      transition={{ duration: 0.5, delay }}
    >
      {content}
    </motion.div>
  );
};

export default SectionContainer;
