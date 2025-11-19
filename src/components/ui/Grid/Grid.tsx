import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

function Grid({ children, className, onClick }: Props) {
  return (
    <div
      className={cn("grid md:grid-cols-6 gap-4", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Grid;
