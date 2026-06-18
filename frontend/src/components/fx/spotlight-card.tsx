"use client";

// 卡片光标跟随柔光（移植自 ReactBits SpotlightCard）。
// 适配本项目：作为透明包裹层，把柔光以 soft-light 叠加在子卡片之上，明暗主题皆可见；
// 柔光层 pointer-events-none 不挡点击，rounded 与子卡片一致、不裁剪子卡片阴影。
import { useRef, useState, type MouseEventHandler, type PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
  // 柔光颜色（半透明），默认与英雄区光束同色系的柔蓝，亮色卡片上也清晰可见
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(138, 180, 255, 0.25)",
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative", className)}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-xl transition-opacity duration-500 ease-out"
        style={{
          opacity,
          background: `radial-gradient(320px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
    </div>
  );
}
