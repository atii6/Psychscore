import React from "react";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const gridItemSizes = cva("space-y-2", {
  variants: {
    size: {
      1: "col-span-1",
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
      5: "col-span-5",
      6: "col-span-6",
    },
  },
  defaultVariants: {
    size: 6,
  },
});
export type GridItemProps = {
  children: React.ReactNode;
  className?: string;
} & VariantProps<typeof gridItemSizes>;

function GridItem({ children, className, size }: GridItemProps) {
  return (
    <div className={cn(gridItemSizes({ size }), className)}>{children}</div>
  );
}

export default GridItem;
