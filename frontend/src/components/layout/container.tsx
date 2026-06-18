import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// 统一页面横向边距与最大宽度
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
