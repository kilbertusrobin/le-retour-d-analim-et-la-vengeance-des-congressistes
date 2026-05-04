import { ReactNode } from "react";

interface LayoutMaxedProps {
  children: ReactNode;
  className?: string;
}

const LayoutMaxed = ({ children, className = "" }: LayoutMaxedProps) => {
  return (
    <div className={`layout-maxed ${className}`}>
      {children}
    </div>
  );
};

export default LayoutMaxed;
