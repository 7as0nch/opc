"use client";

// 轻量滚动渐入容器（gsap + IntersectionObserver）。
// 进入视口时淡入 + 轻微上移；尊重 prefers-reduced-motion（直接显示，不做动画）。
// 初始内联 opacity:0 避免首屏闪烁；内容仍在 DOM 中，启用 JS 后才隐藏并渐入。
import { useEffect, useRef, type PropsWithChildren } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedContentProps extends PropsWithChildren {
  className?: string;
  // 起始下移距离(px)
  distance?: number;
  duration?: number;
  delay?: number;
}

export default function AnimatedContent({
  children,
  className,
  distance = 24,
  duration = 0.6,
  delay = 0,
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(el, { opacity: 1, y: 0, duration, delay, ease: "power3.out" });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [distance, duration, delay]);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{ opacity: 0, transform: `translateY(${distance}px)` }}
    >
      {children}
    </div>
  );
}
