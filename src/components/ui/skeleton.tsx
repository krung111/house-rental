import * as React from "react";
import { cn } from "@/lib/utils"; // make sure you have a `cn` util for merging classes

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
