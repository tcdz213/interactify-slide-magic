
import React from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: React.ElementType;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className,
  id,
  as: Component = "section"
}) => {
  return (
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
};

export default SectionContainer;
